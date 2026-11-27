import { Prisma, RegistrationStatus } from "@prisma/client";
import { fuzzyRank } from "@/lib/fuzzy";

export type ParticipantParams = { status?: string; q?: string; event?: string };

type Searchable = {
  teamName: string | null;
  event: { title: string };
  student: { college: string; studentId: string | null; user: { name: string; email: string } };
  ticket?: { ticketNumber: string } | null;
};

/** Typo-tolerant search over fetched participants, best match first. An empty query returns everything as is. */
export const rankParticipants = <T extends Searchable>(rows: T[], query: string) =>
  fuzzyRank(rows, query, (r) => [
    { text: r.student.user.name, weight: 2 }, r.student.user.email, r.student.college, r.student.studentId, { text: r.event.title, weight: 1.5 }, r.ticket?.ticketNumber, r.teamName,
  ]);

/** Shared by the Participants page and its CSV export so both always show the same rows. */
export function participantFilter({ status, q, event }: ParticipantParams) {
  const st = Object.values(RegistrationStatus).includes(status as RegistrationStatus) ? (status as RegistrationStatus) : undefined;
  const query = (q ?? "").trim().slice(0, 80);
  const eventId = (event ?? "").trim();
  const where: Prisma.RegistrationWhereInput = {
    ...(st ? { status: st } : {}),
    ...(eventId ? { eventId } : {}),
  };
  return { where, status: st, query, eventId };
}
