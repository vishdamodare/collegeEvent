import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superadmin";
import { InquiryActions, StatusBadge } from "@/components/superadmin/Controls";

export const dynamic = "force-dynamic";

const FILTERS = ["ALL", "NEW", "READ", "RESOLVED"] as const;

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requireSuperAdmin();
  const { status, q } = await searchParams;
  const active = FILTERS.includes(status as (typeof FILTERS)[number]) ? (status as (typeof FILTERS)[number]) : "ALL";
  const query = (q ?? "").trim().slice(0, 80);

  const [rows, grouped] = await Promise.all([
    prisma.inquiry.findMany({
      where: {
        ...(active === "ALL" ? {} : { status: active }),
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" as const } },
                { email: { contains: query, mode: "insensitive" as const } },
                { subject: { contains: query, mode: "insensitive" as const } },
                { message: { contains: query, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.inquiry.groupBy({ by: ["status"], _count: true }),
  ]);

  const counts = new Map(grouped.map((g) => [g.status, g._count]));
  const total = grouped.reduce((n, g) => n + g._count, 0);
  const href = (f: string) => {
    const params = new URLSearchParams({ ...(f !== "ALL" ? { status: f } : {}), ...(query ? { q: query } : {}) });
    const qs = params.toString();
    return qs ? `/superadmin/inquiries?${qs}` : "/superadmin/inquiries";
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div>
          <h1 className="font-anton text-[34px] uppercase tracking-wide leading-none">Inquiries</h1>
          <p className="text-white/50 text-[14px] mt-2">Messages submitted through the homepage contact form.</p>
        </div>
        <form action="/superadmin/inquiries" className="flex gap-2">
          {active !== "ALL" && <input type="hidden" name="status" value={active} />}
          <input
            name="q"
            defaultValue={query}
            placeholder="Search name, email, subject…"
            aria-label="Search inquiries"
            className="w-full sm:w-64 px-4 py-2.5 rounded-xl bg-[#181818] border border-white/10 text-[14px] placeholder:text-white/30 outline-none focus:border-[var(--color-lime)]"
          />
          <button className="px-4 py-2.5 rounded-xl border border-white/15 text-[13.5px] font-semibold hover:bg-white/5 cursor-pointer">Search</button>
        </form>
      </header>

      <nav aria-label="Filter inquiries" className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={href(f)}
            aria-current={active === f ? "page" : undefined}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap border transition ${
              active === f ? "bg-[var(--color-lime)] border-transparent text-white" : "border-white/15 text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            {f === "ALL" ? "All" : f[0] + f.slice(1).toLowerCase()} <span className="opacity-70">({f === "ALL" ? total : counts.get(f) ?? 0})</span>
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-white/50">No inquiries in this view.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((inq) => (
            <li key={inq.id} className="rounded-2xl border border-white/10 bg-[#121212]/60 p-5 flex flex-col lg:flex-row lg:items-start gap-4 justify-between">
              <div className="min-w-0 space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-[16px]">{inq.subject}</p>
                  <StatusBadge value={inq.status} />
                </div>
                <p className="text-[13px] text-white/60 break-all">
                  {inq.name} ·{" "}
                  <a href={`mailto:${inq.email}`} className="underline underline-offset-2 hover:text-white">
                    {inq.email}
                  </a>{" "}
                  · {inq.createdAt.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}
                </p>
                <p className="text-[14px] text-white/80 whitespace-pre-wrap leading-relaxed pt-1">{inq.message}</p>
              </div>
              <div className="shrink-0">
                <InquiryActions id={inq.id} status={inq.status} email={inq.email} subject={inq.subject} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
