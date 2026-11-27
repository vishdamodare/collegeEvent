import Link from "next/link";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superadmin";
import { fuzzyRank } from "@/lib/fuzzy";
import { Monogram, StatusBadge } from "@/components/superadmin/Controls";

export const dynamic = "force-dynamic";

const FILTERS = ["ALL", "STUDENT", "ORGANIZER", "SUPER_ADMIN"] as const;

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ role?: string; q?: string }> }) {
  await requireSuperAdmin();
  const { role, q } = await searchParams;
  const active = FILTERS.includes(role as (typeof FILTERS)[number]) ? (role as (typeof FILTERS)[number]) : "ALL";
  const query = (q ?? "").trim().slice(0, 80);

  const [found, grouped] = await Promise.all([
    prisma.user.findMany({
      where: active === "ALL" ? {} : { role: active as UserRole },
      orderBy: { createdAt: "desc" },
      take: query ? 3000 : 100, // with a search, rank a wide candidate set (typo-tolerant), then show the best 100
      select: { id: true, name: true, email: true, role: true, provider: true, emailVerified: true, createdAt: true },
    }),
    prisma.user.groupBy({ by: ["role"], _count: true }),
  ]);
  const users = fuzzyRank(found, query, (u) => [{ text: u.name, weight: 2 }, u.email]).slice(0, 100);
  const counts = new Map(grouped.map((g) => [g.role, g._count]));
  const total = grouped.reduce((n, g) => n + g._count, 0);
  const href = (f: string) => `/superadmin/users?${new URLSearchParams({ ...(f !== "ALL" ? { role: f } : {}), ...(query ? { q: query } : {}) })}`;

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div>
          <h1 className="font-anton text-[34px] uppercase tracking-wide leading-none">Users</h1>
          <p className="text-sa-fg/50 text-[14px] mt-2">Everyone who has signed up. This list is read-only.</p>
        </div>
        <form action="/superadmin/users" className="flex gap-2">
          {active !== "ALL" && <input type="hidden" name="role" value={active} />}
          <input
            name="q"
            defaultValue={query}
            placeholder="Search name or email…"
            aria-label="Search users"
            className="w-full sm:w-64 px-4 py-2.5 rounded-xl bg-sa-input border border-sa-fg/10 text-[14px] placeholder:text-sa-fg/30 outline-none focus:border-[var(--color-lime)]"
          />
          <button className="px-4 py-2.5 rounded-xl border border-sa-fg/15 text-[13.5px] font-semibold hover:bg-sa-fg/5 cursor-pointer">Search</button>
        </form>
      </header>

      <nav aria-label="Filter users" className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={href(f)}
            aria-current={active === f ? "page" : undefined}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap border transition ${
              active === f ? "bg-[var(--color-lime)] border-transparent text-white" : "border-sa-fg/15 text-sa-fg/60 hover:text-sa-fg hover:bg-sa-fg/5"
            }`}
          >
            {f === "ALL" ? "All" : f === "SUPER_ADMIN" ? "Super admins" : f[0] + f.slice(1).toLowerCase() + "s"}{" "}
            <span className="opacity-70">({f === "ALL" ? total : counts.get(f as UserRole) ?? 0})</span>
          </Link>
        ))}
      </nav>

      {users.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-sa-fg/15 p-10 text-center text-sa-fg/50">No users match.</p>
      ) : (
        <ul className="space-y-2">
          {users.map((u) => (
            <li key={u.id} className="rounded-xl border border-sa-fg/10 bg-sa-card/60 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 justify-between">
              <div className="min-w-0 flex items-center gap-3">
                <Monogram name={u.name} size={40} />
                <div className="min-w-0">
                  <p className="font-semibold flex items-center gap-2 flex-wrap">
                    {u.name} <StatusBadge value={u.role} />
                  </p>
                  <p className="text-[13px] text-sa-fg/60 break-all">{u.email}</p>
                </div>
              </div>
              <p className="text-[12px] text-sa-fg/40 sm:text-right shrink-0">
                {u.provider === "google" ? "Google" : "Email & password"} · {u.emailVerified ? "verified" : "not verified"}
                <br />
                Joined {u.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}
              </p>
            </li>
          ))}
        </ul>
      )}
      {users.length === 100 && <p className="text-center text-[12.5px] text-sa-fg/40">Showing the latest 100. Use search to find others.</p>}
    </div>
  );
}
