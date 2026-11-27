import Link from "next/link";
import { Download } from "lucide-react";
import { RegistrationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superadmin";
import { participantFilter, rankParticipants } from "@/lib/participants";
import { Monogram } from "@/components/superadmin/Controls";

export const dynamic = "force-dynamic";

const FILTERS = ["ALL", ...Object.values(RegistrationStatus)] as const;
const IST = "Asia/Kolkata";
const dt = (d: Date) => d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: IST });
const STATUS: Record<string, { text: string; cls: string }> = {
  PENDING: { text: "Pending", cls: "text-amber-300 bg-amber-400/10 border-amber-400/30" },
  CONFIRMED: { text: "Registered", cls: "text-blue-300 bg-blue-500/10 border-blue-500/25" },
  WAITLISTED: { text: "Waitlisted", cls: "text-amber-300 bg-amber-400/10 border-amber-400/30" },
  CANCELLED: { text: "Cancelled", cls: "text-red-400 bg-red-500/10 border-red-500/25" },
  CHECKED_IN: { text: "Attended", cls: "text-green-400 bg-green-500/10 border-green-500/25" },
  COMPLETED: { text: "Completed", cls: "text-green-400 bg-green-500/10 border-green-500/25" },
  CERTIFICATE_ISSUED: { text: "Certificate issued", cls: "text-green-400 bg-green-500/10 border-green-500/25" },
};
const label = (s: string) => STATUS[s]?.text ?? s;

function Pill({ status }: { status: string }) {
  const m = STATUS[status] ?? { text: status, cls: "text-sa-fg/60 bg-sa-fg/5 border-sa-fg/15" };
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-[12px] font-semibold whitespace-nowrap ${m.cls}`}>{m.text}</span>;
}

/** One labelled value. Empty values are hidden so the panel only shows what the student actually gave. */
function Field({ name, children }: { name: string; children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="min-w-0">
      <dt className="text-[12px] text-sa-fg/45">{name}</dt>
      <dd className="text-[14px] text-sa-fg/90 break-words">{children}</dd>
    </div>
  );
}

export default async function ParticipantsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; event?: string }> }) {
  await requireSuperAdmin();
  const { status, q, event } = await searchParams;
  const { where, status: activeStatus, query, eventId } = participantFilter({ status, q, event });
  const active = activeStatus ?? "ALL";

  const [found, grouped, events] = await Promise.all([

    prisma.registration.findMany({
      where,
      orderBy: { registeredAt: "desc" },
      take: query ? 3000 : 100, // with a search, rank a wide candidate set (typo-tolerant), then show the best 100
      include: {
        event: { select: { title: true, slug: true, date: true } },
        student: { include: { user: { select: { name: true, email: true, createdAt: true, provider: true } } } },
        ticket: { select: { ticketNumber: true, status: true } },
        teamMembers: true,
      },
    }),
    prisma.registration.groupBy({ by: ["status"], _count: true }),
    prisma.event.findMany({ where: { registrations: { some: {} } }, select: { id: true, title: true }, orderBy: { date: "desc" }, take: 100 }),
  ]);
  const rows = rankParticipants(found, query).slice(0, 100);
  const counts = new Map(grouped.map((g) => [g.status, g._count]));
  const total = grouped.reduce((n, g) => n + g._count, 0);
  const href = (f: string) => `/superadmin/participants?${new URLSearchParams({ ...(f !== "ALL" ? { status: f } : {}), ...(query ? { q: query } : {}), ...(eventId ? { event: eventId } : {}) })}`;
  const field = "px-4 py-2.5 rounded-xl bg-sa-input border border-sa-fg/10 text-[14px] outline-none focus:border-[var(--color-lime)]";

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
         <div>
          <h1 className="font-anton text-[34px] uppercase tracking-wide leading-none">Participants</h1>
          <p className="text-sa-fg/50 text-[14px] mt-2">Every student who registered for an event, with their full details. Open a row to see everything.</p>
         </div>
         <a
          href={`/superadmin/participants/export?${new URLSearchParams({ ...(activeStatus ? { status: activeStatus } : {}), ...(query ? { q: query } : {}), ...(eventId ? { event: eventId } : {}) })}`}
          download
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-lime)] text-white text-[13.5px] font-semibold hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sa-fg"
         >
          <Download aria-hidden className="size-4" /> Export CSV
         </a>
        </div>
        <form action="/superadmin/participants" className="flex flex-col sm:flex-row gap-2">
          {active !== "ALL" && <input type="hidden" name="status" value={active} />}
          <input name="q" defaultValue={query} placeholder="Search name, email or college…" aria-label="Search participants" className={`${field} sm:w-72 placeholder:text-sa-fg/30`} />
          <select name="event" defaultValue={eventId} aria-label="Filter by event" className={`${field} sm:w-64`}>
            <option value="">All events</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
          <button className="px-4 py-2.5 rounded-xl border border-sa-fg/15 text-[13.5px] font-semibold hover:bg-sa-fg/5 cursor-pointer">Search</button>
        </form>
      </header>

      <nav aria-label="Filter by registration status" className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={href(f)}
            aria-current={active === f ? "page" : undefined}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap border transition ${
              active === f ? "bg-[var(--color-lime)] border-transparent text-white" : "border-sa-fg/15 text-sa-fg/60 hover:text-sa-fg hover:bg-sa-fg/5"
            }`}
          >
            {f === "ALL" ? "All" : label(f)} <span className="opacity-70">({f === "ALL" ? total : counts.get(f as RegistrationStatus) ?? 0})</span>
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-sa-fg/15 p-10 text-center text-sa-fg/50">No participants match. Try another status, event or search.</p>
      ) : (
        <div className="rounded-2xl border border-sa-fg/10 overflow-hidden">
          <div aria-hidden className="hidden lg:grid grid-cols-[1.3fr_1.2fr_1.3fr_8rem_1.5rem] gap-4 px-5 py-3 bg-sa-fg/[0.04] text-[12.5px] text-sa-fg/50">
            <span>Student</span>
            <span>College</span>
            <span>Event</span>
            <span>Status</span>
            <span />
          </div>
          <ul className="divide-y divide-sa-fg/10">
            {rows.map((r) => {
              const s = r.student;
              const answers = r.registrationAnswers && typeof r.registrationAnswers === "object" && !Array.isArray(r.registrationAnswers) ? Object.entries(r.registrationAnswers as Record<string, unknown>) : [];
              return (
                <li key={r.id} className="bg-sa-card/60">
                  <details className="group">
                    <summary className="list-none cursor-pointer px-4 sm:px-5 py-4 grid gap-1.5 lg:gap-4 lg:grid-cols-[1.3fr_1.2fr_1.3fr_8rem_1.5rem] lg:items-center hover:bg-sa-fg/[0.04] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-lime)] [&::-webkit-details-marker]:hidden">
                      <div className="flex items-center gap-3 min-w-0">
                        <Monogram name={s.user.name} size={36} />
                        <div className="min-w-0">
                          <p className="font-semibold text-[15px] truncate">{s.user.name}</p>
                          <p className="text-[12.5px] text-sa-fg/45 truncate">{s.user.email}</p>
                        </div>
                      </div>
                      <p className="text-[13.5px] text-sa-fg/75 truncate">{s.college}</p>
                      <p className="text-[13.5px] text-sa-fg/75 truncate">{r.event.title}</p>
                      <div><Pill status={r.status} /></div>
                      <span aria-hidden className="hidden lg:block text-sa-fg/30 transition-transform group-open:rotate-90">›</span>
                    </summary>

                    <div className="px-4 sm:px-5 pb-5 pt-1 bg-sa-fg/[0.03] grid lg:grid-cols-2 gap-x-10 gap-y-6">
                      <section aria-label="About the student" className="space-y-3 pt-4">
                        <h3 className="font-semibold text-[14px]">About the student</h3>
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                          <Field name="Phone">{s.phoneNumber && `${s.phoneNumber}${s.phoneVerified ? " (verified)" : ""}`}</Field>
                          <Field name="Email"><a href={`mailto:${s.user.email}`} className="hover:underline break-all">{s.user.email}</a></Field>
                          <Field name="Branch">{s.branch}</Field>
                          <Field name="Year">{s.academicYear}</Field>
                          <Field name="College ID">{s.studentId}</Field>
                          <Field name="Gender">{s.gender}</Field>
                          <Field name="Joined">{dt(s.user.createdAt)}</Field>
                          <Field name="Interests">{s.interests.join(", ")}</Field>
                        </dl>
                      </section>

                      <section aria-label="Registration" className="space-y-3 pt-4">
                        <h3 className="font-semibold text-[14px]">Registration</h3>
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                          <Field name="Event"><Link href={`/events/${r.event.slug}`} className="hover:underline">{r.event.title}</Link></Field>
                          <Field name="Registered on">{dt(r.registeredAt)}</Field>
                          <Field name="Check-in">{r.checkedIn ? `Attended${r.checkedInAt ? `, ${dt(r.checkedInAt)}` : ""}` : "Not checked in yet"}</Field>
                          <Field name="Ticket">{r.ticket?.ticketNumber}</Field>
                          <Field name="Team">{r.registrationType === "TEAM" ? r.teamName || "Team" : ""}</Field>
                          <Field name="Cancelled on">{r.cancelledAt && dt(r.cancelledAt)}</Field>
                          {answers.map(([k, v]) => (
                            <Field key={k} name={k}>{typeof v === "string" ? v : JSON.stringify(v)}</Field>
                          ))}
                        </dl>
                      </section>

                      {r.teamMembers.length > 0 && (
                        <section aria-label="Team members" className="space-y-3 lg:col-span-2">
                          <h3 className="font-semibold text-[14px]">Team members ({r.teamMembers.length})</h3>
                          <ul className="grid sm:grid-cols-2 gap-3">
                            {r.teamMembers.map((m) => (
                              <li key={m.id} className="rounded-xl bg-sa-fg/[0.04] p-3 text-[13px] space-y-0.5">
                                <p className="font-semibold text-[14px]">{m.name}</p>
                                <p className="text-sa-fg/60 break-all">{m.email}, {m.phone}</p>
                                <p className="text-sa-fg/50">{m.college}, {m.branch}, {m.academicYear}</p>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {rows.length === 100 && <p className="text-center text-[12.5px] text-sa-fg/40">Showing the latest 100. Use search or the event filter to narrow it down.</p>}
    </div>
  );
}
