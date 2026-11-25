import Link from "next/link";
import { differenceInCalendarDays, format, formatDistanceToNowStrict } from "date-fns";
import { CalendarPlus, MapPin, Pencil, ScanLine, Users } from "lucide-react";
import { ChartsSection } from "@/components/admin/ChartsSection";
import { getOrganizerProfile, getAdminDashboardStats, getAdminAnalytics } from "@/actions/admin";

export const dynamic = "force-dynamic";

// Dates are shown in the fest's timezone, not the server's (UTC on Vercel)
const IST = "Asia/Kolkata";
const inIst = (iso: string) => new Date(new Date(iso).toLocaleString("en-US", { timeZone: IST }));

function whenLabel(iso: string) {
  const days = differenceInCalendarDays(inIst(iso), inIst(new Date().toISOString()));
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 7) return `In ${days} days`;
  return `In ${formatDistanceToNowStrict(new Date(iso))}`;
}

export default async function AdminHome() {
  // All three in parallel (they share one cached auth lookup) instead of back-to-back round trips
  const [profile, stats, analyticsData] = await Promise.all([
    getOrganizerProfile().catch(() => ({ name: "Organizer", college: "" })),
    getAdminDashboardStats(),
    getAdminAnalytics(),
  ]);
  const { quickStats: q, nextEvent: next, recentRegistrations } = stats;
  const fill = next ? Math.min(100, Math.round((next.registered / Math.max(1, next.capacity)) * 100)) : 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-anton text-[28px] sm:text-[32px] font-bold tracking-tight leading-tight">Welcome back</h1>
        <p className="text-[15px] text-[var(--ink-3)] mt-1">
          {profile.college ? `${profile.college} · ` : ""}
          {q.upcomingEvents === 0 ? "No upcoming events yet" : `${q.upcomingEvents} upcoming ${q.upcomingEvents === 1 ? "event" : "events"}`}
        </p>
      </header>

      {/* Focal point: the next event, as a ticket stub */}
      {next ? (
        <section aria-label="Next event" className="relative flex flex-col sm:flex-row rounded-2xl bg-[var(--desk-raised)] border border-[var(--desk-line)] overflow-hidden">
          {/* Date block */}
          <div className="sm:w-36 shrink-0 flex sm:flex-col items-center sm:justify-center gap-3 sm:gap-0 px-5 py-4 sm:py-6 bg-[var(--color-lime)] text-white">
            <span className="text-[13px] font-bold uppercase tracking-wide opacity-90">{format(inIst(next.date), "MMM")}</span>
            <span className="font-anton text-[34px] sm:text-[52px] font-bold leading-none tabular-nums">{format(inIst(next.date), "d")}</span>
            <span className="text-[13px] font-medium opacity-90">{format(inIst(next.date), "EEE · h:mm a")}</span>
          </div>

          {/* Perforation */}
          <div aria-hidden className="hidden sm:block relative w-0 border-l-2 border-dashed border-[var(--desk-line-strong)]">
            <span className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-[var(--desk)]" />
            <span className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-[var(--desk)]" />
          </div>

          <div className="flex-1 min-w-0 p-5 sm:p-6 flex flex-col gap-4">
            <div>
              <p className="text-[13px] font-semibold text-[var(--color-lime)]">Next up · {whenLabel(next.date)}</p>
              <h2 className="font-anton text-[22px] sm:text-[24px] font-bold tracking-tight leading-snug mt-1">{next.title}</h2>
              <p className="flex items-center gap-1.5 text-[14px] text-[var(--ink-3)] mt-1.5">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{next.location}</span>
              </p>
            </div>

            <div>
              <div className="flex items-baseline justify-between gap-3 text-[14px]">
                <span>
                  <span className="text-[20px] font-bold tabular-nums">{next.registered}</span>
                  <span className="text-[var(--ink-3)]"> / {next.capacity} registered</span>
                </span>
                <span className="text-[var(--stamp)] font-semibold tabular-nums">{next.checkedIn} checked in</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-[var(--desk-inset)] overflow-hidden" role="progressbar" aria-valuenow={fill} aria-valuemin={0} aria-valuemax={100} aria-label="Seats filled">
                <div className="h-full rounded-full bg-[var(--color-lime)]" style={{ width: `${Math.max(fill, next.registered ? 2 : 0)}%` }} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/admin/check-in" className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[var(--color-lime)] text-white text-[14px] font-semibold hover:opacity-90 active:scale-[0.97] transition">
                <ScanLine className="w-4 h-4" /> Open check-in
              </Link>
              <Link href={`/admin/events/${next.id}`} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-[var(--desk-line-strong)] text-[14px] font-semibold hover:bg-[var(--desk-overlay)] transition-colors">
                <Users className="w-4 h-4" /> See who&apos;s coming
              </Link>
              <Link href={`/admin/events/${next.id}/edit`} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-[14px] font-semibold text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--desk-overlay)] transition-colors">
                <Pencil className="w-4 h-4" /> Edit
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-[var(--desk-line-strong)] p-8 sm:p-10 text-center">
          <CalendarPlus className="w-8 h-8 mx-auto text-[var(--ink-3)]" />
          <h2 className="font-anton text-[22px] font-bold tracking-tight mt-3">Plan your next event</h2>
          <p className="text-[14px] text-[var(--ink-3)] mt-1 max-w-sm mx-auto">It takes about 2 minutes. Students can register as soon as you publish.</p>
          <Link href="/admin/events/create" className="inline-flex items-center gap-2 h-10 px-5 mt-5 rounded-lg bg-[var(--color-lime)] text-white text-[14px] font-semibold hover:opacity-90">
            Create an event
          </Link>
        </section>
      )}

      {/* Quiet totals: one strip, not four competing cards */}
      <dl className="grid grid-cols-2 lg:grid-cols-4 rounded-2xl border border-[var(--desk-line)] divide-x divide-y lg:divide-y-0 divide-[var(--desk-line)] overflow-hidden">
        {[
          { label: "Registrations", value: q.totalRegistrations, href: "/admin/participants" },
          { label: "Checked in", value: q.checkedInTotal, href: "/admin/participants" },
          { label: "Upcoming events", value: q.upcomingEvents, href: "/admin/events" },
          { label: "Drafts", value: q.draftEvents, href: "/admin/events/drafts" },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="px-5 py-4 hover:bg-[var(--desk-raised)] transition-colors">
            <dt className="text-[13px] text-[var(--ink-3)]">{s.label}</dt>
            <dd className="text-[24px] font-bold tabular-nums mt-0.5">{s.value}</dd>
          </Link>
        ))}
      </dl>

      {/* Latest sign-ups */}
      <section className="rounded-2xl bg-[var(--desk-raised)] border border-[var(--desk-line)]">
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-3">
          <h2 className="text-[16px] font-semibold">Latest registrations</h2>
          <Link href="/admin/participants" className="text-[13.5px] font-semibold text-[var(--ink-2)] hover:text-[var(--ink)]">
            View all
          </Link>
        </div>
        {recentRegistrations.length === 0 ? (
          <p className="px-6 pb-8 pt-4 text-center text-[14px] text-[var(--ink-3)]">No one has registered yet. Share your event link to get the first sign-ups.</p>
        ) : (
          <ul className="pb-2">
            {recentRegistrations.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-5 sm:px-6 py-3 border-t border-[var(--desk-line)]">
                <span aria-hidden className="w-9 h-9 shrink-0 rounded-full bg-[var(--desk-overlay)] flex items-center justify-center text-[13px] font-semibold">
                  {r.participantName.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold truncate">{r.participantName}</p>
                  <p className="text-[13px] text-[var(--ink-3)] truncate">
                    {r.eventName}
                    {r.college ? ` · ${r.college}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {r.cancelled ? (
                    <span className="text-[12px] font-semibold text-[var(--ink-3)]">Cancelled</span>
                  ) : r.checkedIn ? (
                    <span className="text-[12px] font-semibold text-[var(--stamp)]">Checked in</span>
                  ) : (
                    <span className="text-[12px] font-semibold text-[var(--ink-2)]">Registered</span>
                  )}
                  <p className="text-[12px] text-[var(--ink-3)]">{formatDistanceToNowStrict(new Date(r.registeredAt), { addSuffix: true })}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ChartsSection data={analyticsData} />
    </div>
  );
}
