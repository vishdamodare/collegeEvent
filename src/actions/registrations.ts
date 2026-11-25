"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { RegistrationStatus, type Prisma } from "@prisma/client";
import {
  generateTicketNumber,
  generateVerificationToken,
  generateQRCodeDataUrl,
} from "@/lib/ticket-generator";
import { sendTicketConfirmationEmail } from "@/lib/email";
import crypto from "crypto";

/** Errors safe to show users; anything else (e.g. Prisma) is replaced by a generic message. */
class UserError extends Error {}
const KNOWN = [/closed/i, /capacity/i, /not open/i, /sold out/i, /already registered/i, /not found/i];
function publicError(e: unknown, fallback: string) {
  return e instanceof UserError || (e instanceof Error && !e.name.startsWith("Prisma") && KNOWN.some((r) => r.test(e.message)))
    ? (e as Error).message
    : fallback;
}

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
    ];
    if (requiredFields.some(field => !field)) {
      return { error: "PROFILE_INCOMPLETE", message: "Please fill out all required profile fields (Name, Email, Phone, College, Branch, Year) before registering." };
    }

    // Check event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: { where: { status: { not: RegistrationStatus.CANCELLED } } } },
        },
      },
    });

    if (!event) {
      return { error: "Event not found." };
    }

    if (event.status !== "PUBLISHED") {
      return { error: "This event is not open for registration." };
    }

    const { details } = (await prisma.event.findUnique({ where: { id: eventId }, select: { details: true } })) ?? {};
    const d = details as {
      schedule?: { registrationOpens?: string; registrationCloses?: string };
      pricing?: { isFree?: boolean; fee?: number; tickets?: { price?: number }[] };
    } | null;
    const closesAt = d?.schedule?.registrationCloses;
    const opensAt = d?.schedule?.registrationOpens;
    if (opensAt && new Date(opensAt) > new Date()) {
      return { error: "Registration for this event has not opened yet." };
    }
    // Paid events must never be issued for free; online payment verification isn't wired up yet.
    if (d?.pricing && (d.pricing.isFree === false || Number(d.pricing.fee) > 0 || d.pricing.tickets?.some((t) => Number(t.price) > 0))) {
      return { error: "Online payment is not available yet for this event." };
    }
    if (event.isClosed || new Date(event.date) < new Date() || (closesAt && new Date(closesAt) < new Date())) {
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

    // Organizer-defined required questions (answers are keyed by question label)
    const questions = Array.isArray(event.additionalQuestions) ? (event.additionalQuestions as { label: string; required?: boolean }[]) : [];
    const missing = questions.find((q) => q?.required && !String(params?.answers?.[q.label] ?? "").trim());
    if (missing) {
      return { error: `"${missing.label}" is a required question.` };
    }

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

      const emails = members.map((m) => m.email.trim().toLowerCase());
      if (emails.some((e) => !e)) {
        return { error: "Every team member needs an email address." };
      }
      if (new Set(emails).size !== emails.length) {
        return { error: "Each team member must have a different email address." };
      }
      if (emails.includes(studentProfile.user.email.toLowerCase())) {
        return { error: "You are the team captain — don't add yourself as a member." };
      }
      const conflicts = await prisma.user.findMany({
        where: {
          email: { in: emails, mode: "insensitive" },
          OR: [
            { role: { not: "STUDENT" } },
            { studentProfile: { registrations: { some: { eventId, status: { not: RegistrationStatus.CANCELLED } } } } },
          ],
        },
        select: { email: true, role: true },
      });
      if (conflicts.length) {
        const c = conflicts[0];
        return {
          error: c.role !== "STUDENT"
            ? `${c.email} is not a student account and can't be added to a team.`
            : `${c.email} is already registered for this event.`,
        };
      }
      // Normalise so lookups/creates below use the same casing
      members.forEach((m, i) => (m.email = emails[i]));
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

      // Re-check under the lock so double-clicks can't re-issue an active registration
      const existingReg = await tx.registration.findUnique({
        where: { eventId_studentId: { eventId, studentId: studentProfile.id } },
        select: { status: true },
      });
      if (existingReg && existingReg.status !== RegistrationStatus.CANCELLED) {
        throw new UserError("You are already registered for this event.");
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
          registrationAnswers: params?.answers || undefined,
          teamName: eventType === "TEAM" ? params?.teamName : null,
          registrationType: eventType,
          timeline: initialTimeline,
          cancelledAt: null,
          checkedIn: false,
          checkedInAt: null,
          checkInStatus: "NOT_CHECKED_IN",
        },
        create: {
          eventId,
          studentId: studentProfile.id,
          status: RegistrationStatus.CONFIRMED,
          phoneVerified: true,
          registrationAnswers: params?.answers || undefined,
          teamName: eventType === "TEAM" ? params?.teamName : null,
          registrationType: eventType,
          timeline: initialTimeline,
        },
      });

      // Generate Captain Ticket
      const captainTicketId = crypto.randomUUID();
      const captainTicketNumber = await generateTicketNumber(tx);
      const captainVerificationToken = generateVerificationToken();
      const captainQr = await generateQRCodeDataUrl(captainTicketId, captainVerificationToken);

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
      await tx.teamMember.deleteMany({ where: { registrationId: captainReg.id } });
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
              registrationAnswers: params?.answers || undefined,
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
              registrationAnswers: params?.answers || undefined,
              teamName: params?.teamName,
              registrationType: "TEAM",
              timeline: memberTimeline,
            },
          });

          // Generate Member Ticket
          const memberTicketId = crypto.randomUUID();
          const memberTicketNumber = await generateTicketNumber(tx);
          const memberVerificationToken = generateVerificationToken();
          const memberQr = await generateQRCodeDataUrl(memberTicketId, memberVerificationToken);

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
    }, { timeout: 20000, maxWait: 10000 });

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
  } catch (error) {
    console.error("Error registering for free event:", error);
    return { error: publicError(error, "Registration failed. Please try again.") };
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
        teamMembers: { select: { email: true } },
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

    if (registration.checkedIn || new Date(registration.event.date) < new Date()) {
      return { error: "This registration can no longer be cancelled." };
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

      // Captain cancelling a team frees the members' seats and tickets too
      const memberEmails = registration.teamMembers.map((m) => m.email);
      if (memberEmails.length) {
        const memberRegs = await tx.registration.findMany({
          where: {
            eventId: registration.eventId,
            status: { not: RegistrationStatus.CANCELLED },
            student: { user: { email: { in: memberEmails, mode: "insensitive" } } },
          },
          select: { id: true, student: { select: { userId: true } } },
        });
        const ids = memberRegs.map((r) => r.id);
        await tx.registration.updateMany({
          where: { id: { in: ids } },
          data: { status: RegistrationStatus.CANCELLED, cancelledAt: new Date() },
        });
        await tx.ticket.updateMany({ where: { registrationId: { in: ids } }, data: { status: "CANCELLED" } });
        await tx.notification.createMany({
          data: memberRegs.map((r) => ({
            userId: r.student.userId,
            message: `Your team registration for ${registration.event.title} was cancelled by the team captain.`,
          })),
        });
      }
    });

    revalidatePath(`/events/${registration.event.slug}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/events");
    revalidatePath("/dashboard/notifications");

    return { success: true };
  } catch (error) {
    console.error("Error cancelling registration:", error);
    return { error: "An unexpected error occurred." };
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

    // Re-render from the signed payload: tickets issued with the old low-res QR get the high-res one, no DB write
    return { ...ticket, qrCode: await generateQRCodeDataUrl(ticket.id, ticket.verificationToken) };
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
    const user = await getCurrentUser();
    if (!user) return { error: "Unauthorized" };
    const ticket = await prisma.ticket.update({
      where: { id: ticketId, student: { userId: user.id } },
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
    const user = await getCurrentUser();
    if (!user) return { error: "Unauthorized" };
    const ticket = await prisma.ticket.update({
      where: { id: ticketId, student: { userId: user.id } },
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
  } catch (error) {
    console.error("Error clearing notifications:", error);
    return { error: "Failed to clear notifications" };
  }
}

/**
 * Validates check-in ticket references from scanned QR code.
 */
export async function verifyCheckInTicket(ticketIdentifier: string, verificationToken?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Unauthorized. Please log in." };
    }

    if (user.role !== "ORGANIZER" && user.role !== "SUPER_ADMIN") {
      return { error: "Access denied. Organizer role required." };
    }

    const cleanIdentifier = ticketIdentifier.trim();
    const cleanToken = verificationToken?.trim() || "";

    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [
          { ticketNumber: { equals: cleanIdentifier, mode: "insensitive" } },
          { id: cleanIdentifier },
          { registrationId: cleanIdentifier },
        ],
        ...(cleanToken ? { verificationToken: cleanToken } : {}),
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
    if (user.role !== "SUPER_ADMIN" && ticket.event.organizerId !== user.id) {
      return { error: "This ticket belongs to another organizer's event." };
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
  } catch (error) {
    console.error("Error verifying check-in ticket:", error);
    return { error: "Failed to verify ticket details." };
  }
}

/**
 * Atomically claims a check-in. Returns true only for the single caller that flips the ticket ACTIVE -> USED.
 * Both updates run in one DB transaction and each is guarded by its own WHERE, so two scanners hitting the same
 * ticket at once can never both win: the loser's row is re-checked after the winner commits and matches nothing.
 */
async function claimCheckIn(
  t: { id: string; registrationId: string; studentUserId: string; eventTitle: string; eventSlug: string; timeline: unknown },
  userId: string,
  method: "QR" | "MANUAL",
  device: string
): Promise<{ claimed: boolean; checkedInAt: Date }> {
  let timeline: Prisma.InputJsonValue[] = [];
  try {
    const v = typeof t.timeline === "string" ? JSON.parse(t.timeline) : t.timeline;
    if (Array.isArray(v)) timeline = v;
  } catch {}
  const checkedInAt = new Date();
  timeline.push({ status: "CHECKED_IN", time: checkedInAt.toISOString(), label: `Checked In via ${method} (${device})` });

  const notCancelled = { not: RegistrationStatus.CANCELLED };
  const [gate] = await prisma.$transaction([
    prisma.ticket.updateMany({
      where: { id: t.id, status: "ACTIVE", registration: { checkedIn: false, status: notCancelled } },
      data: { status: "USED" },
    }),
    prisma.registration.updateMany({
      where: { id: t.registrationId, checkedIn: false, status: notCancelled },
      data: {
        checkedIn: true,
        checkedInAt,
        checkedInBy: userId,
        checkInDevice: device,
        checkInMethod: method,
        checkInStatus: "CHECKED_IN",
        status: RegistrationStatus.CHECKED_IN,
        timeline,
      },
    }),
  ]);
  if (gate.count !== 1) return { claimed: false, checkedInAt };

  // Best effort: the check-in is already committed, so a failed notification must not fail the scan
  await prisma.notification
    .create({ data: { userId: t.studentUserId, message: `Check-in successful for ${t.eventTitle}! Welcome to the event.` } })
    .catch((e) => console.error("Check-in notification failed:", e));
  revalidatePath(`/events/${t.eventSlug}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/events");
  revalidatePath("/dashboard/notifications");
  return { claimed: true, checkedInAt };
}

/**
 * Confirms participant check-in (manual flow: verify first, then approve).
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

    if (user.role !== "SUPER_ADMIN" && ticket.event.organizerId !== user.id) {
      return { error: "Unauthorized check-in permission." };
    }

    if (ticket.registration.checkInStatus === "CHECKED_IN") {
      return { error: "Participant has already checked in." };
    }

    if (ticket.status !== "ACTIVE" || ticket.registration.status === RegistrationStatus.CANCELLED) {
      return { error: `This ticket is ${ticket.status === "ACTIVE" ? "cancelled" : ticket.status.toLowerCase()} and can't be checked in.` };
    }

    const { claimed } = await claimCheckIn(
      {
        id: ticket.id,
        registrationId: ticket.registrationId,
        studentUserId: ticket.student.userId,
        eventTitle: ticket.event.title,
        eventSlug: ticket.event.slug,
        timeline: ticket.registration.timeline,
      },
      user.id,
      method,
      device
    );
    if (!claimed) return { error: "Participant has already checked in." };

    return { success: true };
  } catch (error) {
    console.error("Error confirming check-in:", error);
    return { error: "Failed to confirm check-in." };
  }
}

export type ScanResult = {
  /** valid = just checked in (green), used = already checked in (red), invalid = bad/foreign/cancelled (red) */
  state: "valid" | "used" | "invalid";
  message: string;
  studentName?: string;
  college?: string;
  ticketNumber?: string;
  eventTitle?: string;
  teamName?: string | null;
  checkedInAt?: string | null;
};

/**
 * One-call scan: validates the QR payload and checks the attendee in atomically, so the scanner can show
 * green/red immediately without a separate "approve" step. The token is mandatory (it is the QR's signature).
 */
export async function scanCheckIn(
  ticketIdentifier: string,
  verificationToken: string,
  device: string = "Scanner"
): Promise<ScanResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { state: "invalid", message: "Session expired. Please log in again." };
    if (user.role !== "ORGANIZER" && user.role !== "SUPER_ADMIN") {
      return { state: "invalid", message: "Organizer access required." };
    }

    const id = ticketIdentifier?.trim();
    const token = verificationToken?.trim();
    if (!id || !token) return { state: "invalid", message: "Not a valid ticket QR code." };

    const ticket = await prisma.ticket.findFirst({
      where: { OR: [{ id }, { ticketNumber: id }], verificationToken: token },
      select: {
        id: true,
        ticketNumber: true,
        status: true,
        registrationId: true,
        event: { select: { title: true, slug: true, organizerId: true } },
        registration: { select: { status: true, checkedIn: true, checkedInAt: true, teamName: true, timeline: true } },
        student: { select: { userId: true, college: true, user: { select: { name: true } } } },
      },
    });
    if (!ticket) return { state: "invalid", message: "Ticket not found or QR code was tampered with." };

    const info = {
      studentName: ticket.student.user.name,
      college: ticket.student.college,
      ticketNumber: ticket.ticketNumber,
      eventTitle: ticket.event.title,
      teamName: ticket.registration.teamName,
    };

    if (user.role !== "SUPER_ADMIN" && ticket.event.organizerId !== user.id) {
      return { state: "invalid", message: "This ticket is for another organizer's event.", ...info };
    }
    if (ticket.registration.status === RegistrationStatus.CANCELLED || ticket.status === "CANCELLED") {
      return { state: "invalid", message: "Registration was cancelled.", ...info };
    }
    const alreadyUsed = (at: Date | null) => ({
      state: "used" as const,
      message: `Already checked in${at ? ` at ${at.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}` : ""}.`,
      checkedInAt: at?.toISOString() ?? null,
      ...info,
    });
    if (ticket.registration.checkedIn || ticket.status === "USED") return alreadyUsed(ticket.registration.checkedInAt);
    if (ticket.status !== "ACTIVE") return { state: "invalid", message: "Ticket is not active.", ...info };

    const { claimed, checkedInAt } = await claimCheckIn(
      {
        id: ticket.id,
        registrationId: ticket.registrationId,
        studentUserId: ticket.student.userId,
        eventTitle: ticket.event.title,
        eventSlug: ticket.event.slug,
        timeline: ticket.registration.timeline,
      },
      user.id,
      "QR",
      device
    );
    // Lost the race to another scanner: report the winner's check-in, never a second acceptance
    if (!claimed) return alreadyUsed(null);

    return { state: "valid", message: "Entry approved.", checkedInAt: checkedInAt.toISOString(), ...info };
  } catch (error) {
    console.error("Error scanning ticket:", error);
    return { state: "invalid", message: "Could not verify ticket. Try again." };
  }
}

/**
 * Creates a Razorpay Payment Order for paid event registrations
 */
export async function createRazorpayOrderAction(eventId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Authentication required" };
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return { error: "Payments are not configured." };
    }

    // Price comes from the event, never from the client
    const event = await prisma.event.findUnique({ where: { id: eventId }, select: { status: true, details: true } });
    if (!event || event.status !== "PUBLISHED") {
      return { error: "Event not found." };
    }
    const fee = Number((event.details as { pricing?: { fee?: number } } | null)?.pricing?.fee);
    if (!Number.isFinite(fee) || fee <= 0) {
      return { error: "This event does not require payment." };
    }

    // Loaded lazily so the SDK only ships with this action
    const { default: Razorpay } = await import("razorpay");
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: Math.round(fee * 100), // paise
      currency: "INR",
      receipt: `rcpt_${eventId.slice(0, 6)}_${Date.now().toString().slice(-6)}`,
    });
    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    };
  } catch (err) {
    console.error("Razorpay order creation error:", err);
    return { error: "Failed to create payment order." };
  }
}


/**
 * Lightweight check-in status for the ticket owner's live "you're in" feedback (polled by CheckInWatcher).
 */
export async function getCheckInStatus(ticketId: string) {
  const user = await getCurrentUser();
  if (!user) return { checkedIn: false, checkedInAt: null };
  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId, student: { userId: user.id } }, // owner only
    select: { registration: { select: { checkedIn: true, checkedInAt: true } } },
  });
  return {
    checkedIn: !!ticket?.registration.checkedIn,
    checkedInAt: ticket?.registration.checkedInAt?.toISOString() ?? null,
  };
}
