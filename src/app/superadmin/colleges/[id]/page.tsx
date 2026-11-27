import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superadmin";
import { Monogram, StatusBadge } from "@/components/superadmin/Controls";

export const dynamic = "force-dynamic";

const IST = "Asia/Kolkata";
const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: IST });
const month = (d: Date) => d.toLocaleDateString("en-IN", { month: "short", timeZone: IST });
const day = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", timeZone: IST });

export default async function CollegeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSuperAdmin();
  const { id } = await params;
  const college = await prisma.college.findUnique({ where: { id } });
  if (!college) notFound();

  const organizers = await prisma.organizerProfile.findMany({
    where: { college: { equals: college.name, mode: "insensitive" } },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: {
          id: true, name: true, email: true, createdAt: true,
          events: {
            orderBy: { date: "desc" },
            select: { id: true, title: true, slug: true, date: true, status: true, capacity: true, category: { select: { name: true } }, _count: { select: { registrations: { where: { status: { not: "CANCELLED" } } } } } },
          },
        },
      },
    },
  });

  const events = organizers.flatMap((o) => o.user.events.map((e) => ({ ...e, by: o.user.name }))).sort((a, b) => +b.date - +a.date);
  const regs = events.reduce((n, e) => n + e._count.registrations, 0);
  const live = events.filter((e) => e.status === "PUBLISHED").length;
  const stats: [string, number][] = [["Organizers", organizers.length], ["Events", events.length], ["Published", live], ["Registrations", regs]];

  return (
    <div className="space-y-10">
      <header className="space-y-5">
        <Link href="/superadmin/colleges" className="inline-block text-[13px] text-sa-fg/50 hover:text-sa-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-lime)] rounded">
          ‹ All colleges
        </Link>
        <div className="flex items-center gap-4">
          <Monogram name={college.name} size={64} />
          <div className="min-w-0">
            <h1 className="font-anton text-[30px] sm:text-[38px] uppercase tracking-wide leading-[1.05]">{college.name}</h1>
            <p className="text-sa-fg/50 text-[14px] mt-1.5">Registered on {fmt(college.createdAt)}</p>
          </div>
        </div>
        <dl className="grid grid-cols-2 sm:grid-cols-4 rounded-2xl border border-sa-fg/10 bg-sa-card/60 divide-x divide-sa-fg/10 [&>div:nth-child(n+3)]:max-sm:border-t [&>div:nth-child(n+3)]:max-sm:border-sa-fg/10 max-sm:[&>div:nth-child(3)]:border-l-0">
          {stats.map(([label, n]) => (
            <div key={label} className="p-4 sm:p-5">
              <dd className="font-anton text-[30px] leading-none">{n}</dd>
              <dt className="text-[13px] text-sa-fg/50 mt-1.5">{label}</dt>
            </div>
          ))}
        </dl>
      </header>

      <section aria-labelledby="admins" className="space-y-3">
        <h2 id="admins" className="font-semibold text-[18px]">College admins</h2>
        {organizers.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-sa-fg/15 p-8 text-center text-sa-fg/50">
            Nobody has signed up for this college yet. Organizers can pick it on the organizer sign-up page.
          </p>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {organizers.map((o) => (
              <li key={o.id} className="rounded-2xl border border-sa-fg/10 bg-sa-card/60 p-5 flex gap-4">
                <Monogram name={o.user.name} size={44} />
                <div className="min-w-0 space-y-1">
                  <p className="font-semibold text-[16px] flex items-center gap-2 flex-wrap">
                    {o.user.name} <StatusBadge value={o.verificationStatus} />
                  </p>
                  <p className="text-[13px] text-sa-fg/70">{o.position}, {o.department}</p>
                  <p className="text-[13px] text-sa-fg/55 break-all">
                    <a href={`mailto:${o.user.email}`} className="hover:text-sa-fg hover:underline">{o.user.email}</a>
                    {o.phone && <> · <a href={`tel:${o.phone}`} className="hover:text-sa-fg hover:underline">{o.phone}</a></>}
                  </p>
                  <p className="text-[12px] text-sa-fg/40">
                    Joined {fmt(o.user.createdAt)}, created {o.user.events.length} event{o.user.events.length === 1 ? "" : "s"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="events" className="space-y-3">
        <h2 id="events" className="font-semibold text-[18px]">Events created</h2>
        {events.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-sa-fg/15 p-8 text-center text-sa-fg/50">
            No events yet. They&apos;ll appear here as soon as this college&apos;s organizers create one.
          </p>
        ) : (
          <ul className="rounded-2xl border border-sa-fg/10 divide-y divide-sa-fg/10 overflow-hidden">
            {events.map((e) => {
              const pct = e.capacity > 0 ? Math.min(100, Math.round((e._count.registrations / e.capacity) * 100)) : 0;
              return (
                <li key={e.id} className="bg-sa-card/60 p-4 sm:p-5 flex flex-wrap sm:flex-nowrap items-center gap-x-4 gap-y-3">
                  <div aria-hidden className="shrink-0 w-14 rounded-xl border border-sa-fg/10 bg-sa-fg/5 py-2 text-center">
                    <p className="text-[12px] text-[#FF8A8E] leading-none">{month(e.date)}</p>
                    <p className="font-anton text-[22px] leading-none mt-1">{day(e.date)}</p>
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-semibold text-[15px] flex items-center gap-2 flex-wrap">
                      <Link href={`/events/${e.slug}`} className="hover:underline focus-visible:outline-2 focus-visible:outline-[var(--color-lime)] rounded">{e.title}</Link>
                      <StatusBadge value={e.status} />
                    </p>
                    <p className="text-[13px] text-sa-fg/55">{e.category.name}, by {e.by}</p>
                  </div>
                  <div className="w-full sm:w-36 shrink-0 sm:text-right">
                    <p className="text-[13px] text-sa-fg/70">{e._count.registrations} of {e.capacity}</p>
                    <div aria-hidden className="mt-1.5 h-1.5 rounded-full bg-sa-fg/10 overflow-hidden">
                      <div className="h-full rounded-full bg-[var(--color-lime)]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
