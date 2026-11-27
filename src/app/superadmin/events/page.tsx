import Link from "next/link";
import { EventStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superadmin";
import { fuzzyRank } from "@/lib/fuzzy";
import { EventActions, StatusBadge } from "@/components/superadmin/Controls";

export const dynamic = "force-dynamic";

const FILTERS = ["ALL", "PUBLISHED", "DRAFT", "COMPLETED", "ARCHIVED", "CANCELLED"] as const;

export default async function EventsModerationPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requireSuperAdmin();
  const { status, q } = await searchParams;
  const active = FILTERS.includes(status as (typeof FILTERS)[number]) ? (status as (typeof FILTERS)[number]) : "ALL";
  const query = (q ?? "").trim().slice(0, 80);

  const [found, grouped] = await Promise.all([
    prisma.event.findMany({
      where: active === "ALL" ? {} : { status: active as EventStatus },
      orderBy: { date: "desc" },
      take: query ? 2000 : 100, // with a search, rank a wide candidate set (typo-tolerant), then show the best 100
      select: {
        location: true,
        id: true,
        title: true,
        slug: true,
        status: true,
        date: true,
        capacity: true,
        organizer: { select: { name: true, organizerProfile: { select: { college: true } } } },
        _count: { select: { registrations: true } },
      },
    }),
    prisma.event.groupBy({ by: ["status"], _count: true }),
  ]);
  const events = fuzzyRank(found, query, (e) => [
    { text: e.title, weight: 2 }, e.organizer.organizerProfile?.college, e.organizer.name, e.location,
  ]).slice(0, 100);
  const counts = new Map(grouped.map((g) => [g.status, g._count]));
  const total = grouped.reduce((n, g) => n + g._count, 0);
  const href = (f: string) => `/superadmin/events?${new URLSearchParams({ ...(f !== "ALL" ? { status: f } : {}), ...(query ? { q: query } : {}) })}`;

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div>
          <h1 className="font-anton text-[34px] uppercase tracking-wide leading-none">Events</h1>
          <p className="text-sa-fg/50 text-[14px] mt-2">Every event on the platform. Unpublish anything that shouldn&apos;t be public.</p>
        </div>
        <form action="/superadmin/events" className="flex gap-2">
          {active !== "ALL" && <input type="hidden" name="status" value={active} />}
          <input
            name="q"
            defaultValue={query}
            placeholder="Search title, college or organizer…"
            aria-label="Search events"
            className="w-full sm:w-64 px-4 py-2.5 rounded-xl bg-sa-input border border-sa-fg/10 text-[14px] placeholder:text-sa-fg/30 outline-none focus:border-[var(--color-lime)]"
          />
          <button className="px-4 py-2.5 rounded-xl border border-sa-fg/15 text-[13.5px] font-semibold hover:bg-sa-fg/5 cursor-pointer">Search</button>
        </form>
      </header>

      <nav aria-label="Filter events" className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={href(f)}
            aria-current={active === f ? "page" : undefined}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap border transition ${
              active === f ? "bg-[var(--color-lime)] border-transparent text-white" : "border-sa-fg/15 text-sa-fg/60 hover:text-sa-fg hover:bg-sa-fg/5"
            }`}
          >
            {f === "ALL" ? "All" : f[0] + f.slice(1).toLowerCase()} <span className="opacity-70">({f === "ALL" ? total : counts.get(f as EventStatus) ?? 0})</span>
          </Link>
        ))}
      </nav>

      {events.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-sa-fg/15 p-10 text-center text-sa-fg/50">No events match. Try another status or a different search.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((e) => {
            const pct = e.capacity > 0 ? Math.min(100, Math.round((e._count.registrations / e.capacity) * 100)) : 0;
            const college = e.organizer.organizerProfile?.college;
            return (
              <li key={e.id} className="rounded-2xl border border-sa-fg/10 bg-sa-card/60 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div aria-hidden className="shrink-0 w-14 rounded-xl border border-sa-fg/10 bg-sa-fg/5 py-2 text-center">
                    <p className="text-[12px] text-[#FF8A8E] leading-none">{e.date.toLocaleDateString("en-IN", { month: "short", timeZone: "Asia/Kolkata" })}</p>
                    <p className="font-anton text-[22px] leading-none mt-1">{e.date.toLocaleDateString("en-IN", { day: "numeric", timeZone: "Asia/Kolkata" })}</p>
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="font-semibold text-[16px] flex items-center gap-2 flex-wrap">
                      {e.title} <StatusBadge value={e.status} />
                    </p>
                    <p className="text-[13px] text-sa-fg/60 truncate">
                      {college ? `${college}, ` : ""}by {e.organizer.name}
                    </p>
                    <p className="text-[12px] text-sa-fg/40">
                      {e.date.toLocaleString("en-IN", { year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" })} IST
                    </p>
                  </div>
                </div>
                <div className="lg:w-40 shrink-0">
                  <p className="text-[13px] text-sa-fg/70 tabular-nums">{e._count.registrations} of {e.capacity} registered</p>
                  <div aria-hidden className="mt-1.5 h-1.5 rounded-full bg-sa-fg/10 overflow-hidden">
                    <div className="h-full rounded-full bg-[var(--color-lime)]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <EventActions id={e.id} status={e.status} title={e.title} registrations={e._count.registrations} slug={e.slug} />
              </li>
            );
          })}
        </ul>
      )}
      {events.length === 100 && <p className="text-center text-[12.5px] text-sa-fg/40">Showing the latest 100. Use search to find older events.</p>}
    </div>
  );
}
