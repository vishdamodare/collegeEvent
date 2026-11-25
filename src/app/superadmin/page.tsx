import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superadmin";
import { InquiryActions, OrganizerActions, StatusBadge } from "@/components/superadmin/Controls";
import { AreaChart, BarList, Donut } from "@/components/superadmin/Charts";

export const dynamic = "force-dynamic";

const DAYS = 30;
const IST_MS = 5.5 * 60 * 60 * 1000; // buckets follow the organizers' calendar day, not UTC
const dayKey = (d: Date) => new Date(d.getTime() + IST_MS).toISOString().slice(0, 10);

const RED = "#FF4B50";
const BLUE = "#60A5FA";
const STATUS_COLORS: Record<string, string> = { PUBLISHED: "#22C55E", DRAFT: "#9CA3AF", COMPLETED: BLUE, ARCHIVED: "#6B7280", CANCELLED: "#F87171" };
const ROLE_COLORS: Record<string, string> = { STUDENT: BLUE, ORGANIZER: RED, SUPER_ADMIN: "#FBBF24" };

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

function Card({ title, sub, children, className = "" }: { title: string; sub?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-[#121212]/60 p-5 sm:p-6 ${className}`}>
      <h2 className="font-anton text-[18px] uppercase tracking-wide">{title}</h2>
      {sub && <p className="text-[12.5px] text-white/50 mt-0.5 mb-4">{sub}</p>}
      {!sub && <div className="mb-4" />}
      {children}
    </section>
  );
}

export default async function SuperAdminOverview() {
  const me = await requireSuperAdmin();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const since = new Date(now.getTime() - DAYS * 24 * 60 * 60 * 1000);

  const [roles, orgStatus, eventStatus, regs, checkedIn, newUsers, upcoming, pendingOrganizers, recentInquiries, recentRegs, recentUsers, categories, topEvents] = await Promise.all([
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
    prisma.inquiry.findMany({
      where: { status: "NEW" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.registration.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.category.findMany({ select: { name: true, _count: { select: { events: true } } }, orderBy: { events: { _count: "desc" } }, take: 6 }),
    prisma.event.findMany({
      where: { status: { in: ["PUBLISHED", "COMPLETED"] } },
      orderBy: { registrations: { _count: "desc" } },
      take: 5,
      select: { title: true, capacity: true, _count: { select: { registrations: true } } },
    }),
  ]);

  const count = (rows: Array<Record<string, unknown> & { _count: number }>, key: string, val: string) => rows.find((r) => r[key] === val)?._count ?? 0;
  const totalUsers = roles.reduce((n, r) => n + r._count, 0);
  const pending = count(orgStatus, "verificationStatus", "PENDING");
  const approved = count(orgStatus, "verificationStatus", "APPROVED");
  const published = count(eventStatus, "status", "PUBLISHED");
  const totalEvents = eventStatus.reduce((n, r) => n + r._count, 0);

  // 30-day activity, one bucket per IST calendar day
  const days = Array.from({ length: DAYS }, (_, i) => new Date(now.getTime() - (DAYS - 1 - i) * 24 * 60 * 60 * 1000));
  const keys = days.map(dayKey);
  const labels = days.map((d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }));
  const bucket = (rows: { createdAt: Date }[]) => {
    const m = new Map<string, number>();
    for (const r of rows) m.set(dayKey(r.createdAt), (m.get(dayKey(r.createdAt)) ?? 0) + 1);
    return keys.map((k) => m.get(k) ?? 0);
  };
  const regSeries = bucket(recentRegs);
  const userSeries = bucket(recentUsers);
  const sum = (a: number[]) => a.reduce((n, v) => n + v, 0);

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

      {pendingOrganizers.length > 0 && (
        <section aria-label="Needs attention" className="rounded-2xl border border-amber-400/30 bg-amber-400/[0.04] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-anton text-[20px] uppercase tracking-wide">Needs your attention</h2>
            <Link href="/superadmin/organizers?status=PENDING" className="text-[13px] text-white/60 hover:text-white underline underline-offset-4">
              See all
            </Link>
          </div>
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
        </section>
      )}

      {recentInquiries.length > 0 && (
        <section aria-label="New inquiries" className="rounded-2xl border border-amber-400/30 bg-amber-400/[0.04] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-anton text-[20px] uppercase tracking-wide">Unread inquiries</h2>
            <Link href="/superadmin/inquiries" className="text-[13px] text-white/60 hover:text-white underline underline-offset-4">
              See all
            </Link>
          </div>
          <ul className="divide-y divide-white/5">
            {recentInquiries.map((inq) => (
              <li key={inq.id} className="py-4 flex flex-col lg:flex-row lg:items-start gap-3 justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="font-semibold flex items-center gap-2 flex-wrap">
                    {inq.subject} <StatusBadge value={inq.status} />
                  </p>
                  <p className="text-[13px] text-white/50 truncate">
                    {inq.name} · {inq.email} ·{" "}
                    {inq.createdAt.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}
                  </p>
                  <p className="text-[13px] text-white/75 line-clamp-2">{inq.message}</p>
                </div>
                <div className="shrink-0">
                  <InquiryActions id={inq.id} status={inq.status} email={inq.email} subject={inq.subject} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Card title={`Activity · last ${DAYS} days`} sub="New registrations and new sign-ups, per day">
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3 text-[13.5px]">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="w-3 h-1.5 rounded-full" style={{ background: RED }} />
            Registrations <strong className="tabular-nums">{sum(regSeries)}</strong>
          </span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="w-3 h-1.5 rounded-full" style={{ background: BLUE }} />
            New users <strong className="tabular-nums">{sum(userSeries)}</strong>
          </span>
        </div>
        <AreaChart
          id="activity"
          labels={labels}
          series={[
            { label: "Registrations", color: RED, values: regSeries },
            { label: "New users", color: BLUE, values: userSeries },
          ]}
        />
      </Card>

      <section aria-label="Breakdowns" className="grid lg:grid-cols-3 gap-4">
        <Card title="Events by status">
          <Donut
            centerLabel="events"
            slices={["PUBLISHED", "DRAFT", "COMPLETED", "ARCHIVED", "CANCELLED"].map((s) => ({ label: s[0] + s.slice(1).toLowerCase(), value: count(eventStatus, "status", s), color: STATUS_COLORS[s] }))}
          />
        </Card>
        <Card title="People by role">
          <Donut
            centerLabel="people"
            slices={[
              { label: "Students", value: count(roles, "role", "STUDENT"), color: ROLE_COLORS.STUDENT },
              { label: "Organizers", value: count(roles, "role", "ORGANIZER"), color: ROLE_COLORS.ORGANIZER },
              { label: "Super admins", value: count(roles, "role", "SUPER_ADMIN"), color: ROLE_COLORS.SUPER_ADMIN },
            ]}
          />
        </Card>
        <Card title="Check-in rate" sub="Of active registrations">
          <Donut
            centerLabel="registrations"
            slices={[
              { label: "Checked in", value: checkedIn, color: "#22C55E" },
              { label: "Not yet", value: Math.max(regs - checkedIn, 0), color: "#4B5563" },
            ]}
          />
        </Card>
      </section>

      <section aria-label="Rankings" className="grid lg:grid-cols-2 gap-4">
        <Card title="Events per category" sub="Where organizers are creating events">
          <BarList color={RED} empty="No events yet." items={categories.filter((c) => c._count.events > 0).map((c) => ({ label: c.name, value: c._count.events }))} />
        </Card>
        <Card title="Most popular events" sub="By registrations">
          <BarList
            color={BLUE}
            empty="No registrations yet."
            items={topEvents.filter((e) => e._count.registrations > 0).map((e) => ({ label: e.title, value: e._count.registrations, hint: `of ${e.capacity}` }))}
          />
        </Card>
      </section>
    </div>
  );
}
