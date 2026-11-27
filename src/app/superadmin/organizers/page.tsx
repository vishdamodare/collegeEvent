import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superadmin";
import { Monogram, OrganizerActions, StatusBadge } from "@/components/superadmin/Controls";

export const dynamic = "force-dynamic";

const FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED", "BLOCKED"] as const;

export default async function OrganizersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireSuperAdmin();
  const { status } = await searchParams;
  const active = FILTERS.includes(status as (typeof FILTERS)[number]) ? (status as (typeof FILTERS)[number]) : "ALL";

  const [rows, grouped] = await Promise.all([
    prisma.organizerProfile.findMany({
      where: active === "ALL" ? {} : { verificationStatus: active },
      orderBy: [{ createdAt: "desc" }],
      take: 200,
      include: { user: { select: { id: true, name: true, email: true, createdAt: true, _count: { select: { events: true } } } } },
    }),
    prisma.organizerProfile.groupBy({ by: ["verificationStatus"], _count: true }),
  ]);
  const counts = new Map(grouped.map((g) => [g.verificationStatus, g._count]));
  const total = grouped.reduce((n, g) => n + g._count, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-anton text-[34px] uppercase tracking-wide leading-none">Organizers</h1>
        <p className="text-sa-fg/50 text-[14px] mt-2">Approve new organizers, or suspend anyone who breaks the rules. They&apos;re notified automatically.</p>
      </header>

      <nav aria-label="Filter organizers" className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "ALL" ? "/superadmin/organizers" : `/superadmin/organizers?status=${f}`}
            aria-current={active === f ? "page" : undefined}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap border transition ${
              active === f ? "bg-[var(--color-lime)] border-transparent text-white" : "border-sa-fg/15 text-sa-fg/60 hover:text-sa-fg hover:bg-sa-fg/5"
            }`}
          >
            {f === "ALL" ? "All" : f[0] + f.slice(1).toLowerCase()} <span className="opacity-70">({f === "ALL" ? total : counts.get(f) ?? 0})</span>
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-sa-fg/15 p-10 text-center text-sa-fg/50">No organizers in this view.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((o) => (
            <li key={o.id} className="rounded-2xl border border-sa-fg/10 bg-sa-card/60 p-5 flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
              <div className="min-w-0 flex gap-4"><Monogram name={o.user.name} size={44} /><div className="min-w-0 space-y-1.5">
                <p className="font-semibold text-[16px] flex items-center gap-2 flex-wrap">
                  {o.user.name} <StatusBadge value={o.verificationStatus} />
                </p>
                <p className="text-[13px] text-sa-fg/60 break-all">{o.user.email}{o.phone ? ` · ${o.phone}` : ""}</p>
                <p className="text-[13px] text-sa-fg/60">
                  {o.college} · {o.department} · {o.position}
                </p>
                <p className="text-[12px] text-sa-fg/40">
                  Joined {o.user.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })} · {o.user._count.events} event
                  {o.user._count.events === 1 ? "" : "s"}
                  {o.verificationDocument && (
                    <>
                      {" · "}
                      <a href={o.verificationDocument} target="_blank" rel="noopener noreferrer" className="text-[#FF8A8E] underline underline-offset-2">
                        View verification document
                      </a>
                    </>
                  )}
                </p>
              </div></div>
              <OrganizerActions userId={o.user.id} status={o.verificationStatus} name={o.user.name} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
