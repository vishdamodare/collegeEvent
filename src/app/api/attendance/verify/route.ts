import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { RegistrationStatus, Prisma } from "@prisma/client";

/**
 * GET /api/attendance/verify?ticketId=[id]&token=[token]
 * Verifies the validity of a ticket pass.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get("ticketId") || searchParams.get("id");
    const token = searchParams.get("token");
    const ticketNumber = searchParams.get("ticketNumber");

    // Public endpoint: the unguessable token is mandatory, so tickets can't be enumerated.
    if (!token || (!ticketId && !ticketNumber)) {
      return NextResponse.json(
        { valid: false, error: "Missing ticketId/ticketNumber and token." },
        { status: 400 }
      );
    }

    const whereClause: Prisma.TicketWhereInput = {};
    if (token) {
      whereClause.verificationToken = token.trim();
    }
    if (ticketId) {
      whereClause.OR = [
        { id: ticketId.trim() },
        { registrationId: ticketId.trim() },
      ];
    }
    if (ticketNumber) {
      whereClause.ticketNumber = ticketNumber.trim();
    }

    const ticket = await prisma.ticket.findFirst({
      where: whereClause,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            date: true,
            location: true,
            status: true,
            organizerId: true,
          },
        },
        student: {
          include: {
            user: {
              select: { name: true, email: true, image: true },
            },
          },
        },
        registration: true,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { valid: false, error: "Invalid ticket: Record not found." },
        { status: 404 }
      );
    }

    const isCancelled =
      ticket.status === "CANCELLED" ||
      ticket.registration.status === RegistrationStatus.CANCELLED;

    const isCheckedIn =
      ticket.registration.checkedIn ||
      ticket.registration.checkInStatus === "CHECKED_IN";

    return NextResponse.json({
      valid: !isCancelled,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        issuedAt: ticket.issuedAt,
      },
      registration: {
        id: ticket.registration.id,
        status: ticket.registration.status,
        checkedIn: isCheckedIn,
        checkedInAt: ticket.registration.checkedInAt,
        teamName: ticket.registration.teamName,
        registrationType: ticket.registration.registrationType,
      },
      student: {
        name: ticket.student.user.name,
        college: ticket.student.college,
      },
      event: {
        id: ticket.event.id,
        title: ticket.event.title,
        slug: ticket.event.slug,
        date: ticket.event.date,
        location: ticket.event.location,
        status: ticket.event.status,
      },
    });
  } catch (error) {
    console.error("Ticket verification error:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to verify ticket" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/attendance/verify
 * Performs check-in confirmation for an attendee.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized. Login required." }, { status: 401 });
    }

    // Re-read from DB: the session cookie caches the role for 5 minutes
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, organizerProfile: { select: { verificationStatus: true } } },
    });
    const role = dbUser?.role;
    const approved = role === "SUPER_ADMIN" || dbUser?.organizerProfile?.verificationStatus === "APPROVED";
    if ((role !== "ORGANIZER" && role !== "SUPER_ADMIN") || !approved) {
      return NextResponse.json(
        { error: "Access denied. Organizer permissions required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { ticketIdentifier, verificationToken, device = "Web Scanner", method = "QR" } = body;

    if (typeof ticketIdentifier !== "string" || !ticketIdentifier.trim() || (verificationToken != null && typeof verificationToken !== "string")) {
      return NextResponse.json(
        { error: "ticketIdentifier is required." },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [
          { id: ticketIdentifier.trim() },
          { ticketNumber: ticketIdentifier.trim() },
          { registrationId: ticketIdentifier.trim() },
        ],
        ...(verificationToken ? { verificationToken: verificationToken.trim() } : {}),
      },
      include: {
        event: true,
        registration: true,
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found or invalid token signature." },
        { status: 404 }
      );
    }

    // Verify organizer permission
    if (ticket.event.organizerId !== session.user.id && role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "You are not authorized to check in attendees for this event." },
        { status: 403 }
      );
    }

    if (ticket.registration.status === RegistrationStatus.CANCELLED) {
      return NextResponse.json(
        { error: "Cannot check in: Registration was cancelled." },
        { status: 400 }
      );
    }

    if (ticket.registration.checkedIn || ticket.registration.checkInStatus === "CHECKED_IN") {
      return NextResponse.json({
        alreadyCheckedIn: true,
        message: `Already checked in at ${ticket.registration.checkedInAt ? new Date(ticket.registration.checkedInAt).toLocaleTimeString() : "earlier"}.`,
        studentName: ticket.student.user.name,
        ticketNumber: ticket.ticketNumber,
      });
    }

    if (ticket.status !== "ACTIVE") {
      return NextResponse.json({ error: "Ticket is not active." }, { status: 400 });
    }

    // Atomic: only one concurrent scan can flip NOT_CHECKED_IN -> CHECKED_IN
    const checkedInAt = new Date();
    const claimed = await prisma.$transaction(async (tx) => {
      const r = await tx.registration.updateMany({
        where: { id: ticket.registration.id, checkedIn: false, status: { not: RegistrationStatus.CANCELLED } },
        data: {
          checkedIn: true,
          checkedInAt,
          checkedInBy: session.user.id,
          checkInDevice: device,
          checkInMethod: method,
          checkInStatus: "CHECKED_IN",
          status: RegistrationStatus.CHECKED_IN,
        },
      });
      if (r.count === 0) return false;
      await tx.ticket.update({ where: { id: ticket.id }, data: { status: "USED" } });
      return true;
    });

    if (!claimed) {
      return NextResponse.json({
        alreadyCheckedIn: true,
        message: "Already checked in.",
        studentName: ticket.student.user.name,
        ticketNumber: ticket.ticketNumber,
      });
    }
    const updatedReg = { checkedInAt };

    return NextResponse.json({
      success: true,
      message: `Successfully checked in ${ticket.student.user.name}!`,
      ticketNumber: ticket.ticketNumber,
      checkedInAt: updatedReg.checkedInAt,
      student: {
        name: ticket.student.user.name,
        email: ticket.student.user.email,
        college: ticket.student.college,
        branch: ticket.student.branch,
      },
      event: {
        id: ticket.event.id,
        title: ticket.event.title,
      },
    });
  } catch (error) {
    console.error("Check-in execution error:", error);
    return NextResponse.json(
      { error: "Failed to process check-in" },
      { status: 500 }
    );
  }
}
