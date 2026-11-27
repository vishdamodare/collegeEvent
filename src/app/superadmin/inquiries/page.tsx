import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superadmin";
import { fuzzyRank } from "@/lib/fuzzy";
import { InquiryActions, Monogram, StatusBadge } from "@/components/superadmin/Controls";

export const dynamic = "force-dynamic";

const FILTERS = ["ALL", "NEW", "READ", "RESOLVED"] as const;

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requireSuperAdmin();
  const { status, q } = await searchParams;
  const active = FILTERS.includes(status as (typeof FILTERS)[number]) ? (status as (typeof FILTERS)[number]) : "ALL";
  const query = (q ?? "").trim().slice(0, 80);

  const [found, grouped] = await Promise.all([
    prisma.inquiry.findMany({
      where: active === "ALL" ? {} : { status: active },
      orderBy: { createdAt: "desc" },
      take: query ? 2000 : 200, // with a search, rank a wide candidate set (typo-tolerant), then show the best 200
    }),
    prisma.inquiry.groupBy({ by: ["status"], _count: true }),
  ]);

  const rows = fuzzyRank(found, query, (i) => [{ text: i.subject, weight: 2 }, i.name, i.email, { text: i.message, weight: 0.5 }]).slice(0, 200);
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
          <p className="text-sa-fg/50 text-[14px] mt-2">Messages submitted through the homepage contact form.</p>
        </div>
        <form action="/superadmin/inquiries" className="flex gap-2">
          {active !== "ALL" && <input type="hidden" name="status" value={active} />}
          <input
            name="q"
            defaultValue={query}
            placeholder="Search name, email, subject…"
            aria-label="Search inquiries"
            className="w-full sm:w-64 px-4 py-2.5 rounded-xl bg-sa-input border border-sa-fg/10 text-[14px] placeholder:text-sa-fg/30 outline-none focus:border-[var(--color-lime)]"
          />
          <button className="px-4 py-2.5 rounded-xl border border-sa-fg/15 text-[13.5px] font-semibold hover:bg-sa-fg/5 cursor-pointer">Search</button>
        </form>
      </header>

      <nav aria-label="Filter inquiries" className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={href(f)}
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
        <p className="rounded-2xl border border-dashed border-sa-fg/15 p-10 text-center text-sa-fg/50">No inquiries here. New messages from the homepage contact form will show up in this list.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((inq) => (
            <li
              key={inq.id}
              className={`rounded-2xl border bg-sa-card/60 p-5 space-y-4 ${inq.status === "NEW" ? "border-amber-400/30 border-l-4 border-l-amber-400" : "border-sa-fg/10"}`}
            >
              <div className="flex items-start gap-3">
                <Monogram name={inq.name} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[15px]">{inq.name}</p>
                  <a href={`mailto:${inq.email}`} className="text-[13px] text-sa-fg/60 break-all underline-offset-2 hover:text-sa-fg hover:underline">
                    {inq.email}
                  </a>
                </div>
                <time dateTime={inq.createdAt.toISOString()} className="shrink-0 text-[12px] text-sa-fg/40 text-right">
                  {inq.createdAt.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" })}
                </time>
              </div>

              <div className="space-y-2">
                <p className="flex items-center gap-2 flex-wrap font-semibold text-[16px]">
                  {inq.subject} <StatusBadge value={inq.status} />
                </p>
                <p className="max-w-prose rounded-xl bg-sa-fg/[0.03] p-4 text-[14px] text-sa-fg/80 whitespace-pre-wrap leading-relaxed">{inq.message}</p>
              </div>

              <div className="border-t border-sa-fg/10 pt-4">
                <InquiryActions id={inq.id} status={inq.status} email={inq.email} subject={inq.subject} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
