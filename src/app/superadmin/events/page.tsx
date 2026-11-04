import Link from "next/link";
import { EventStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superadmin";
import { EventActions, StatusBadge } from "@/components/superadmin/Controls";

export const dynamic = "force-dynamic";

const FILTERS = ["ALL", "PUBLISHED", "DRAFT", "COMPLETED", "ARCHIVED", "CANCELLED"] as const;

export default async function EventsModerationPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requireSuperAdmin();
  const { status, q } = await searchParams;
  const active = FILTERS.includes(status as (typeof FILTERS)[number]) ? (status as (typeof FILTERS)[number]) : "ALL";
  const query = (q ?? "").trim().slice(0, 80);

  const [events, grouped] = await Promise.all([
    prisma.event.findMany({
      where: {
        ...(active === "ALL" ? {} : { status: active as EventStatus }),
        ...(query ? { title: { contains: query, mode: "insensitive" as const } } : {}),
      },
      orderBy: { date: "desc" },
      take: 100,
      select: {
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
  const counts = new Map(grouped.map((g) => [g.status, g._count]));
  const total = grouped.reduce((n, g) => n + g._count, 0);
  const href = (f: string) => `/superadmin/events?${new URLSearchParams({ ...(f !== "ALL" ? { status: f } : {}), ...(query ? { q: query } : {}) })}`;

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div>
          <h1 className="font-anton text-[34px] uppercase tracking-wide leading-none">Events</h1>
          <p className="text-white/50 text-[14px] mt-2">Every event on the platform. Unpublish anything that shouldn&apos;t be public.</p>
        </div>
        <form action="/superadmin/events" className="flex gap-2">
          {active !== "ALL" && <input type="hidden" name="status" value={active} />}
          <input
            name="q"
            defaultValue={query}
            placeholder="Search by title…"
            aria-label="Search events by title"
            className="w-full sm:w-64 px-4 py-2.5 rounded-xl bg-[#181818] border border-white/10 text-[14px] placeholder:text-white/30 outline-none focus:border-[var(--color-lime)]"
          />
          <button className="px-4 py-2.5 rounded-xl border border-white/15 text-[13.5px] font-semibold hover:bg-white/5 cursor-pointer">Search</button>
        </form>
      </header>

      <nav aria-label="Filter events" className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={href(f)}
            aria-current={active === f ? "page" : undefined}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap border transition ${
              active === f ? "bg-[var(--color-lime)] border-transparent text-white" : "border-white/15 text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            {f === "ALL" ? "All" : f[0] + f.slice(1).toLowerCase()} <span className="opacity-70">({f === "ALL" ? total : counts.get(f as EventStatus) ?? 0})</span>
          </Link>
        ))}
      </nav>

      {events.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-white/50">No events match.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((e) => (
            <li key={e.id} className="rounded-2xl border border-white/10 bg-[#121212]/60 p-5 flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
              <div className="min-w-0 space-y-1.5">
                <p className="font-semibold text-[16px] flex items-center gap-2 flex-wrap">
                  {e.title} <StatusBadge value={e.status} />
                </p>
                <p className="text-[13px] text-white/60">
                  By {e.organizer.name}
                  {e.organizer.organizerProfile?.college ? ` · ${e.organizer.organizerProfile.college}` : ""}
                </p>
                <p className="text-[12px] text-white/40">
                  {e.date.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" })} IST · {e._count.registrations}/{e.capacity} registered
                </p>
              </div>
              <EventActions id={e.id} status={e.status} title={e.title} registrations={e._count.registrations} slug={e.slug} />
            </li>
          ))}
        </ul>
      )}
      {events.length === 100 && <p className="text-center text-[12.5px] text-white/40">Showing the latest 100. Use search to find older events.</p>}
    </div>
  );
}
