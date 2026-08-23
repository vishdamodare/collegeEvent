"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { RegistrationStatus } from "@prisma/client";
import {
  generateTicketNumber,
  generateVerificationToken,
  generateQRCodeDataUrl,
} from "@/lib/ticket-generator";
import { sendTicketConfirmationEmail } from "@/lib/email";
import crypto from "crypto";

/**
 * Gets the current authenticated user session
 */
async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user ?? null;
}

/**
 * Register a student for a free event
 */
export async function registerForFreeEvent(
  eventId: string,
  params?: {
    answers?: Record<string, string>;
    teamName?: string;
    members?: Array<{
      name: string;
      email: string;
      phone: string;
      college: string;
      branch: string;
      academicYear: string;
    }>;
  }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "You must be logged in to register for events." };
    }

    if (user.role !== "STUDENT") {
      return { error: "Only students can register for events." };
    }

    // Find student profile
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
      include: { user: true }
    });

    if (!studentProfile) {
      return { error: "PROFILE_INCOMPLETE", message: "Please complete your student profile before registering." };
    }

    // Validate profile completeness
    const requiredFields = [
      studentProfile.user.name,
      studentProfile.user.email,
      studentProfile.phoneNumber,
      studentProfile.college,
      studentProfile.branch,
      studentProfile.academicYear,
      studentProfile.gender
    ];
    if (requiredFields.some(field => !field)) {
      return { error: "PROFILE_INCOMPLETE", message: "Please fill out all required profile fields (Name, Email, Phone, College, Branch, Year, Gender) before registering." };
    }

    // Check event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event) {
      return { error: "Event not found." };
    }

    if (event.status !== "PUBLISHED") {
      return { error: "This event is not open for registration." };
    }

    if (event.isClosed || new Date(event.date) < new Date()) {
      return { error: "Registration for this event is closed." };
    }

    // Check event capacity
    if (event._count.registrations >= event.capacity) {
      return { error: "This event is sold out." };
    }

    // Check if already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        eventId_studentId: {
          eventId,
          studentId: studentProfile.id,
        },
      },
    });

    if (existingRegistration) {
      if (existingRegistration.status !== RegistrationStatus.CANCELLED) {
        return { error: "You are already registered for this event." };
      }
    }

    const eventType = event.eventType || "INDIVIDUAL";

    // Validate team details
    if (eventType === "TEAM") {
      const teamName = params?.teamName?.trim();
      if (!teamName) {
        return { error: "Team name is required." };
      }
      const members = params?.members || [];
      const totalSize = members.length + 1; // Captain + members
      if (totalSize < event.teamMinSize || totalSize > event.teamMaxSize) {
        return { error: `Team size must be between ${event.teamMinSize} and ${event.teamMaxSize} members.` };
      }
    }

    // Transaction to create registration, generate ticket, and notify
    const result = await prisma.$transaction(async (tx) => {
      // 1. Lock the event row for updates to prevent parallel registration capacity race conditions
      const lockedEvent = await tx.$queryRaw<Array<{ capacity: number; isClosed: boolean; status: string }>>`
        SELECT capacity, "isClosed", status 
        FROM "Event" 
        WHERE id = ${eventId} 
        FOR UPDATE
      `;

      if (!lockedEvent || lockedEvent.length === 0) {
        throw new Error("Event not found during booking transaction.");
      }

      const dbEvent = lockedEvent[0];

      if (dbEvent.status !== "PUBLISHED") {
        throw new Error("This event is not open for registration.");
      }

      if (dbEvent.isClosed || new Date(event.date) < new Date()) {
        throw new Error("Registration for this event is closed.");
      }

      // Helper function to create placeholder profiles for members
      const getOrCreateStudentProfileTx = async (
        mName: string,
        mEmail: string,
        mPhone: string,
        mCollege: string,
        mBranch: string,
        mYear: string
      ) => {
        let mUser = await tx.user.findUnique({ where: { email: mEmail } });
        if (!mUser) {
          mUser = await tx.user.create({
            data: {
              name: mName,
              email: mEmail,
              role: "STUDENT",
            },
          });
        }
        let mProfile = await tx.studentProfile.findUnique({ where: { userId: mUser.id } });
        if (!mProfile) {
          mProfile = await tx.studentProfile.create({
            data: {
              userId: mUser.id,
              college: mCollege,
              branch: mBranch,
              academicYear: mYear,
              phoneNumber: mPhone,
              phoneVerified: true, // Captain verifies them via client OTP
              verifiedAt: new Date(),
              verificationMethod: "SMS_OTP",
            },
          });
        }
        return mProfile;
      };

      // 1. Create Captain Registration
      const initialTimeline = [
        { status: "SUBMITTED", time: new Date().toISOString(), label: "Registration Submitted" },
        { status: "OTP_VERIFIED", time: new Date().toISOString(), label: "Captain OTP Verified" },
        { status: "CONFIRMED", time: new Date().toISOString(), label: "Registration Confirmed" },
        { status: "TICKET_GENERATED", time: new Date().toISOString(), label: "Ticket Issued" }
      ];

      const captainReg = await tx.registration.upsert({
        where: {
          eventId_studentId: {
            eventId,
            studentId: studentProfile.id,
          },
        },
        update: {
          status: RegistrationStatus.CONFIRMED,
          phoneVerified: true,
          registrationAnswers: (params?.answers || null) as any,
          teamName: eventType === "TEAM" ? params?.teamName : null,
          registrationType: eventType,
          timeline: initialTimeline,
          cancelledAt: null,
        },
        create: {
          eventId,
          studentId: studentProfile.id,
          status: RegistrationStatus.CONFIRMED,
          phoneVerified: true,
          registrationAnswers: (params?.answers || null) as any,
          teamName: eventType === "TEAM" ? params?.teamName : null,
          registrationType: eventType,
          timeline: initialTimeline,
        },
      });

      // Generate Captain Ticket
      const captainTicketId = crypto.randomUUID();
      const captainTicketNumber = await generateTicketNumber(tx);
      const captainVerificationToken = generateVerificationToken();
      const captainQr = await generateQRCodeDataUrl(
        captainTicketId,
        captainReg.id,
        eventId,
        event.organizerId,
        captainVerificationToken,
        studentProfile.user.name,
        eventType === "TEAM" ? params?.teamName || "" : ""
      );

      const captainTicket = await tx.ticket.upsert({
        where: { registrationId: captainReg.id },
        update: {
          ticketNumber: captainTicketNumber,
          verificationToken: captainVerificationToken,
          qrCode: captainQr,
          status: "ACTIVE",
          issuedAt: new Date(),
        },
        create: {
          id: captainTicketId,
          registrationId: captainReg.id,
          eventId,
          studentId: studentProfile.id,
          ticketNumber: captainTicketNumber,
          verificationToken: captainVerificationToken,
          qrCode: captainQr,
          status: "ACTIVE",
          issuedAt: new Date(),
        },
      });

      // Create Captain Notification
      await tx.notification.create({
        data: {
          userId: user.id,
          message: `Successfully registered for ${event.title}. Ticket Code: ${captainTicketNumber}`,
        },
      });

      // Create Organizer Notification
      await tx.notification.create({
        data: {
          userId: event.organizerId,
          message: `New registration received for event "${event.title}" from student "${studentProfile.user.name}".`,
        },
      });

      // 2. Handle Team Members if TEAM type
      if (eventType === "TEAM") {
        const members = params?.members || [];
        for (const member of members) {
          const mProfile = await getOrCreateStudentProfileTx(
            member.name,
            member.email,
            member.phone,
            member.college,
            member.branch,
            member.academicYear
          );

          // Save member roster relation
          await tx.teamMember.create({
            data: {
              registrationId: captainReg.id,
              name: member.name,
              email: member.email,
              phone: member.phone,
              otpVerified: true,
              college: member.college,
              branch: member.branch,
              academicYear: member.academicYear,
            },
          });

          // Create separate member Registration
          const memberTimeline = [
            { status: "SUBMITTED", time: new Date().toISOString(), label: "Registration Submitted (Invited by Captain)" },
            { status: "OTP_VERIFIED", time: new Date().toISOString(), label: "OTP Verified" },
            { status: "CONFIRMED", time: new Date().toISOString(), label: "Registration Confirmed" },
            { status: "TICKET_GENERATED", time: new Date().toISOString(), label: "Ticket Issued" }
          ];

          const memberReg = await tx.registration.upsert({
            where: {
              eventId_studentId: {
                eventId,
                studentId: mProfile.id,
              },
            },
            update: {
              status: RegistrationStatus.CONFIRMED,
              phoneVerified: true,
              registrationAnswers: (params?.answers || null) as any,
              teamName: params?.teamName,
              registrationType: "TEAM",
              timeline: memberTimeline,
              cancelledAt: null,
            },
            create: {
              eventId,
              studentId: mProfile.id,
              status: RegistrationStatus.CONFIRMED,
              phoneVerified: true,
              registrationAnswers: (params?.answers || null) as any,
              teamName: params?.teamName,
              registrationType: "TEAM",
              timeline: memberTimeline,
            },
          });

          // Generate Member Ticket
          const memberTicketId = crypto.randomUUID();
          const memberTicketNumber = await generateTicketNumber(tx);
          const memberVerificationToken = generateVerificationToken();
          const memberQr = await generateQRCodeDataUrl(
            memberTicketId,
            memberReg.id,
            eventId,
            event.organizerId,
            memberVerificationToken,
            member.name,
            params?.teamName || ""
          );

          await tx.ticket.upsert({
            where: { registrationId: memberReg.id },
            update: {
              ticketNumber: memberTicketNumber,
              verificationToken: memberVerificationToken,
              qrCode: memberQr,
              status: "ACTIVE",
              issuedAt: new Date(),
            },
            create: {
              id: memberTicketId,
              registrationId: memberReg.id,
              eventId,
              studentId: mProfile.id,
              ticketNumber: memberTicketNumber,
              verificationToken: memberVerificationToken,
              qrCode: memberQr,
              status: "ACTIVE",
              issuedAt: new Date(),
            },
          });

          // Create Member Notification
          await tx.notification.create({
            data: {
              userId: mProfile.userId,
              message: `You have been registered for ${event.title} in team ${params?.teamName}. Ticket Code: ${memberTicketNumber}`,
            },
          });
        }
      }

      // 3. Count confirmed registrations inside the transaction to verify we haven't exceeded capacity
      const confirmedCountAfter = await tx.registration.count({
        where: {
          eventId,
          status: {
            notIn: [RegistrationStatus.CANCELLED, RegistrationStatus.WAITLISTED]
          }
        }
      });

      if (confirmedCountAfter > dbEvent.capacity) {
        throw new Error("Event capacity has been reached. Unable to complete registration.");
      }

      return { registration: captainReg, ticket: captainTicket };
    });

    // Revalidate relevant pages
    revalidatePath(`/events/${event.slug}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/events");
    revalidatePath("/dashboard/notifications");

    // Dispatch ticket confirmation email asynchronously
    sendTicketConfirmationEmail({
      to: studentProfile.user.email,
      studentName: studentProfile.user.name,
      eventTitle: event.title,
      eventDate: new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      ticketNumber: result.ticket.ticketNumber,
    }).catch((err) => console.error("Ticket email dispatch error:", err));

    return {
      success: true,
      registration: result.registration,
      ticket: result.ticket,
    };
  } catch (error: any) {
    console.error("Error registering for free event:", error);
    return { error: error.message || "An unexpected error occurred." };
  }
}

/**
 * Cancel a registration
 */
export async function cancelRegistration(registrationId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "You must be logged in to cancel registrations." };
    }

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        student: true,
        event: true,
        ticket: true,
      },
    });

    if (!registration) {
      return { error: "Registration not found." };
    }

    // Check ownership
    if (registration.student.userId !== user.id) {
      return { error: "You are not authorized to cancel this registration." };
    }

    if (registration.status === RegistrationStatus.CANCELLED) {
      return { error: "This registration has already been cancelled." };
    }

    // Cancel registration and ticket in a transaction
    await prisma.$transaction(async (tx) => {
      // Update registration status to CANCELLED
      await tx.registration.update({
        where: { id: registrationId },
        data: {
          status: RegistrationStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      });

      // Update ticket status to CANCELLED
      if (registration.ticket) {
        await tx.ticket.update({
          where: { id: registration.ticket.id },
          data: {
            status: "CANCELLED",
          },
        });
      }

      // Create cancellation notification
      await tx.notification.create({
        data: {
          userId: user.id,
          message: `Your registration for ${registration.event.title} has been cancelled.`,
        },
      });
    });

    revalidatePath(`/events/${registration.event.slug}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/events");
    revalidatePath("/dashboard/notifications");

    return { success: true };
  } catch (error: any) {
    console.error("Error cancelling registration:", error);
    return { error: error.message || "An unexpected error occurred." };
  }
}

/**
 * Get student's registrations
 */
export async function getStudentRegistrations() {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });

    if (!studentProfile) return [];

    const registrations = await prisma.registration.findMany({
      where: {
        studentId: studentProfile.id,
      },
      include: {
        event: {
          include: {
            category: true,
            images: {
              where: { isHero: true },
              take: 1,
            },
          },
        },
        ticket: true,
      },
      orderBy: {
        registeredAt: "desc",
      },
    });

    const now = new Date();

    const upcoming = registrations.filter(
      (r) => r.status !== RegistrationStatus.CANCELLED && new Date(r.event.date) >= now
    );
    const completed = registrations.filter(
      (r) => r.status !== RegistrationStatus.CANCELLED && new Date(r.event.date) < now
    );
    const cancelled = registrations.filter(
      (r) => r.status === RegistrationStatus.CANCELLED
    );

    return {
      all: registrations,
      upcoming,
      completed,
      cancelled,
    };
  } catch (error) {
    console.error("Error fetching student registrations:", error);
    return { all: [], upcoming: [], completed: [], cancelled: [] };
  }
}

/**
 * Get ticket details by ID
 */
export async function getTicket(ticketId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: {
          include: {
            category: true,
            images: { where: { isHero: true }, take: 1 },
            organizer: {
              select: {
                name: true,
                organizerProfile: {
                  select: {
                    college: true,
                  },
                },
              },
            },
          },
        },
        registration: true,
        student: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    if (!ticket) return null;

    // Verify authorized user (must be the student who owns it, or event organizer, or admin)
    if (
      ticket.student.userId !== user.id &&
      ticket.event.organizerId !== user.id &&
      user.role !== "SUPER_ADMIN"
    ) {
      return null;
    }

    return ticket;
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return null;
  }
}

/**
 * Increment download count for ticket
 */
export async function incrementTicketDownloadCount(ticketId: string) {
  try {
    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        downloadCount: { increment: 1 },
        lastDownloadedAt: new Date(),
      },
    });
    return { success: true, ticket };
  } catch (error) {
    console.error("Error incrementing ticket download count:", error);
    return { error: "Failed to update download count." };
  }
}

/**
 * Record last shared timestamp
 */
export async function recordTicketShared(ticketId: string) {
  try {
    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        lastSharedAt: new Date(),
      },
    });
    return { success: true, ticket };
  } catch (error) {
    console.error("Error recording ticket shared status:", error);
    return { error: "Failed to record share event." };
  }
}

/**
 * Clear all notifications for the current user
 */
export async function clearNotifications() {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Unauthorized" };

    await prisma.notification.deleteMany({
      where: { userId: user.id },
    });

    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (error: any) {
    console.error("Error clearing notifications:", error);
    return { error: error.message || "Failed to clear notifications" };
  }
}

/**
 * Validates check-in ticket references from scanned QR code.
 */
export async function verifyCheckInTicket(ticketIdentifier: string, verificationToken: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Unauthorized. Please log in." };
    }

    if (user.role !== "ORGANIZER" && user.role !== "SUPER_ADMIN") {
      return { error: "Access denied. Organizer role required." };
    }

    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [
          { ticketNumber: ticketIdentifier.trim() },
          { id: ticketIdentifier.trim() },
          { registrationId: ticketIdentifier.trim() },
        ],
        verificationToken: verificationToken.trim(),
      },
      include: {
        event: true,
        student: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        registration: true,
      },
    });

    if (!ticket) {
      return { error: "Ticket not found or verification signatures do not match." };
    }

    // Verify organizer permission
    const isSuperAdmin = user.role === "SUPER_ADMIN";
    if (!isSuperAdmin && ticket.event.organizerId !== user.id) {
      const organizerProfile = await prisma.organizerProfile.findUnique({
        where: { userId: user.id },
      });
      if (!organizerProfile || organizerProfile.verificationStatus !== "APPROVED") {
        return { error: "You are not authorized to check in participants for this event." };
      }
    }

    let checkedInByName = "";
    if (ticket.registration.checkedInBy) {
      const checker = await prisma.user.findUnique({
        where: { id: ticket.registration.checkedInBy },
        select: { name: true },
      });
      checkedInByName = checker?.name || "Organizer";
    }

    return {
      success: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        issuedAt: ticket.issuedAt,
      },
      registration: {
        id: ticket.registration.id,
        status: ticket.registration.status,
        checkInStatus: ticket.registration.checkInStatus,
        checkedInAt: ticket.registration.checkedInAt,
        teamName: ticket.registration.teamName,
        checkedInByName,
      },
      student: {
        name: ticket.student.user.name,
        email: ticket.student.user.email,
        phone: ticket.student.phoneNumber || "Not Provided",
        college: ticket.student.college,
        branch: ticket.student.branch,
        academicYear: ticket.student.academicYear,
      },
      event: {
        id: ticket.event.id,
        title: ticket.event.title,
      },
    };
  } catch (error: any) {
    console.error("Error verifying check-in ticket:", error);
    return { error: "Failed to verify ticket details." };
  }
}

/**
 * Confirms participant check-in, updating ticket and timeline records.
 */
export async function confirmCheckInAction(
  ticketId: string,
  method: "QR" | "MANUAL",
  device: string
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Unauthorized." };
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { event: true, registration: true, student: true },
    });

    if (!ticket) {
      return { error: "Ticket not found." };
    }

    const isSuperAdmin = user.role === "SUPER_ADMIN";
    if (!isSuperAdmin && ticket.event.organizerId !== user.id) {
      const organizerProfile = await prisma.organizerProfile.findUnique({
        where: { userId: user.id },
      });
      if (!organizerProfile || organizerProfile.verificationStatus !== "APPROVED") {
        return { error: "Unauthorized check-in permission." };
      }
    }

    if (ticket.registration.checkInStatus === "CHECKED_IN") {
      return { error: "Participant has already checked in." };
    }

    // Append to registration timeline log
    let timeline = [];
    if (ticket.registration.timeline) {
      try {
        timeline = typeof ticket.registration.timeline === "string"
          ? JSON.parse(ticket.registration.timeline)
          : ticket.registration.timeline;
      } catch (e) {
        timeline = [];
      }
    }
    timeline.push({
      status: "CHECKED_IN",
      time: new Date().toISOString(),
      label: `Checked In via ${method} (${device})`,
    });

    await prisma.$transaction(async (tx) => {
      // 1. Update Registration check-in states
      await tx.registration.update({
        where: { id: ticket.registrationId },
        data: {
          checkedIn: true,
          checkedInAt: new Date(),
          checkedInBy: user.id,
          checkInDevice: device,
          checkInMethod: method,
          checkInStatus: "CHECKED_IN",
          status: RegistrationStatus.CHECKED_IN,
          timeline,
        },
      });

      // 2. Update Ticket status
      await tx.ticket.update({
        where: { id: ticketId },
        data: {
          status: "USED",
        },
      });

      // 3. Create check-in notification
      await tx.notification.create({
        data: {
          userId: ticket.student.userId,
          message: `Check-in successful for ${ticket.event.title}! Welcome to the event.`,
        },
      });
    });

    revalidatePath(`/events/${ticket.event.slug}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/events");
    revalidatePath("/dashboard/notifications");

    return { success: true };
  } catch (error: any) {
    console.error("Error confirming check-in:", error);
    return { error: "Failed to confirm check-in." };
  }
}

/**
 * Creates a Razorpay Payment Order for paid event registrations
 */
export async function createRazorpayOrderAction(eventId: string, amountInRupees: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Authentication required" };
    }

    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_samplekey123";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "sample_secret_key_12345";

    // Dynamic import/require of Razorpay
    const Razorpay = require("razorpay");
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.max(1, amountInRupees) * 100, // amount in paise
      currency: "INR",
      receipt: `rcpt_${eventId.slice(0, 6)}_${Date.now().toString().slice(-6)}`,
    };

    const order = await razorpay.orders.create(options);
    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    };
  } catch (err: any) {
    console.error("Razorpay order creation error:", err);
    return { error: err.message || "Failed to create payment order." };
  }
}

