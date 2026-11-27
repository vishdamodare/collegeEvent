import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superadmin";
import { participantFilter, rankParticipants } from "@/lib/participants";

export const dynamic = "force-dynamic";

const MAX_ROWS = 5000;
const IST = "Asia/Kolkata";
const dt = (d?: Date | null) => (d ? d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: IST }) : "");

// Quote every cell; prefix a quote when it starts like a spreadsheet formula so a student's name can't run as one in Excel
const cell = (v: unknown) => {
  let t = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`;
  return `"${t.replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  try {
    await requireSuperAdmin("throw");
  } catch {
    return new Response("Not allowed.", { status: 403 });
  }

  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const { where, query } = participantFilter(sp);

  const found = await prisma.registration.findMany({
    where,
    orderBy: { registeredAt: "desc" },
    take: query ? MAX_ROWS + 5000 : MAX_ROWS, // with a search, rank a wider candidate set first
    include: {
      event: { select: { title: true, date: true } },
      student: { include: { user: { select: { name: true, email: true } } } },
      ticket: { select: { ticketNumber: true } },
      teamMembers: { select: { name: true, email: true, phone: true } },
    },
  });

  const rows = rankParticipants(found, query).slice(0, MAX_ROWS);

  const header = ["Name", "Email", "Phone", "College", "Branch", "Year", "College ID", "Gender", "Event", "Event date", "Status", "Registered on", "Checked in", "Check-in time", "Ticket", "Type", "Team name", "Team members"];
  const lines = rows.map((r) =>
    [
      r.student.user.name, r.student.user.email, r.student.phoneNumber, r.student.college, r.student.branch, r.student.academicYear, r.student.studentId, r.student.gender,
      r.event.title, dt(r.event.date), r.status, dt(r.registeredAt), r.checkedIn ? "Yes" : "No", dt(r.checkedInAt), r.ticket?.ticketNumber,
      r.registrationType, r.teamName, r.teamMembers.map((m) => `${m.name} <${m.email}> ${m.phone}`).join("; "),
    ].map(cell).join(",")
  );

  const stamp = new Date().toLocaleDateString("en-CA", { timeZone: IST });
  return new Response("﻿" + [header.map(cell).join(","), ...lines].join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="participants-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
