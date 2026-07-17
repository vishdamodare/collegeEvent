import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CheckInClient } from "./CheckInClient";

export const dynamic = "force-dynamic";

export default async function CheckInPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login?callbackUrl=/admin/check-in");
  }

  if (session.user.role !== "ORGANIZER" && session.user.role !== "SUPER_ADMIN") {
    redirect("/unauthorized");
  }

  // Load a list of active tickets for testing scans in the dashboard
  const activeTickets = await prisma.ticket.findMany({
    where: {
      status: "ACTIVE",
      event: session.user.role === "ORGANIZER" 
        ? { organizerId: session.user.id }
        : undefined, // Super admins can view all
    },
    include: {
      event: { select: { title: true } },
      student: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
      registration: { select: { id: true, teamName: true } },
    },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  // Map into simple structures for the client component
  const demoTickets = activeTickets.map(t => ({
    ticketNumber: t.ticketNumber,
    token: t.verificationToken,
    studentName: t.student.user.name,
    eventName: t.event.title,
    teamName: t.registration.teamName || "Individual",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-archivo)] text-text-main">
          QR Event Check-In
        </h1>
        <p className="text-sm text-text-faint mt-1">
          Scan QR codes, verify attendee signatures, and manage manual check-ins live.
        </p>
      </div>

      <CheckInClient demoTickets={demoTickets} />
    </div>
  );
}
