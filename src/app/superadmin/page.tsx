import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superadmin";
import { OrganizerActions, StatusBadge } from "@/components/superadmin/Controls";

export const dynamic = "force-dynamic";

function Stat({ label, value, sub, href }: { label: string; value: number | string; sub?: string; href?: string }) {
  const body = (
    <div className="rounded-2xl border border-white/10 bg-[#121212]/60 p-5 h-full hover:border-white/25 transition">
      <p className="text-[11.5px] font-bold uppercase tracking-wider text-white/50">{label}</p>
      <p className="font-anton text-[40px] leading-none mt-3">{value}</p>
      {sub && <p className="text-[12.5px] text-white/50 mt-2">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export default async function SuperAdminOverview() {
  const me = await requireSuperAdmin();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [roles, orgStatus, eventStatus, regs, checkedIn, newUsers, upcoming, pendingOrganizers] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: true }),
    prisma.organizerProfile.groupBy({ by: ["verificationStatus"], _count: true }),
    prisma.event.groupBy({ by: ["status"], _count: true }),
    prisma.registration.count({ where: { status: { not: "CANCELLED" } } }),
    prisma.registration.count({ where: { checkedIn: true } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.event.count({ where: { status: "PUBLISHED", date: { gte: now } } }),
    prisma.organizerProfile.findMany({
      where: { verificationStatus: "PENDING" },
      orderBy: { createdAt: "asc" },
      take: 5,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  const count = (rows: Array<Record<string, unknown> & { _count: number }>, key: string, val: string) =>
    rows.find((r) => r[key] === val)?._count ?? 0;
  const totalUsers = roles.reduce((n, r) => n + r._count, 0);
  const pending = count(orgStatus, "verificationStatus", "PENDING");
  const approved = count(orgStatus, "verificationStatus", "APPROVED");
  const published = count(eventStatus, "status", "PUBLISHED");
  const totalEvents = eventStatus.reduce((n, r) => n + r._count, 0);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-anton text-[34px] sm:text-[40px] uppercase tracking-wide leading-none">Platform overview</h1>
        <p className="text-white/50 text-[14px] mt-2">Welcome, {me.name}. Here&apos;s how CollegeEvents is doing right now.</p>
      </header>

      <section aria-label="Key numbers" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Users" value={totalUsers} sub={`${newUsers} new in the last 7 days`} href="/superadmin/users" />
        <Stat label="Organizers" value={approved} sub={pending ? `${pending} waiting for approval` : "None waiting"} href="/superadmin/organizers" />
        <Stat label="Events" value={totalEvents} sub={`${published} published · ${upcoming} upcoming`} href="/superadmin/events" />
        <Stat label="Registrations" value={regs} sub={`${checkedIn} checked in`} />
      </section>

      <section aria-label="Needs attention" className="rounded-2xl border border-white/10 bg-[#121212]/60 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-anton text-[20px] uppercase tracking-wide">Needs your attention</h2>
          <Link href="/superadmin/organizers?status=PENDING" className="text-[13px] text-white/50 hover:text-white underline underline-offset-4">
            See all
          </Link>
        </div>
        {pendingOrganizers.length === 0 ? (
          <p className="text-white/50 text-[14px]">Nothing waiting. New organizer applications will show up here.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {pendingOrganizers.map((o) => (
              <li key={o.id} className="py-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div className="min-w-0">
                  <p className="font-semibold flex items-center gap-2 flex-wrap">
                    {o.user.name} <StatusBadge value="PENDING" />
                  </p>
                  <p className="text-[13px] text-white/50 truncate">
                    {o.user.email} · {o.college} · {o.department}
                  </p>
                </div>
                <OrganizerActions userId={o.user.id} status="PENDING" name={o.user.name} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Breakdown" className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#121212]/60 p-5 sm:p-6">
          <h2 className="font-anton text-[18px] uppercase tracking-wide mb-3">Events by status</h2>
          <ul className="space-y-2 text-[14px]">
            {["PUBLISHED", "DRAFT", "COMPLETED", "ARCHIVED", "CANCELLED"].map((s) => (
              <li key={s} className="flex items-center justify-between">
                <StatusBadge value={s} />
                <span className="font-bold">{count(eventStatus, "status", s)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#121212]/60 p-5 sm:p-6">
          <h2 className="font-anton text-[18px] uppercase tracking-wide mb-3">People by role</h2>
          <ul className="space-y-2 text-[14px]">
            {["STUDENT", "ORGANIZER", "SUPER_ADMIN"].map((r) => (
              <li key={r} className="flex items-center justify-between">
                <StatusBadge value={r} />
                <span className="font-bold">{count(roles, "role", r)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
