import Link from "next/link";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superadmin";
import { StatusBadge } from "@/components/superadmin/Controls";

export const dynamic = "force-dynamic";

const FILTERS = ["ALL", "STUDENT", "ORGANIZER", "SUPER_ADMIN"] as const;

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ role?: string; q?: string }> }) {
  await requireSuperAdmin();
  const { role, q } = await searchParams;
  const active = FILTERS.includes(role as (typeof FILTERS)[number]) ? (role as (typeof FILTERS)[number]) : "ALL";
  const query = (q ?? "").trim().slice(0, 80);

  const [users, grouped] = await Promise.all([
    prisma.user.findMany({
      where: {
        ...(active === "ALL" ? {} : { role: active as UserRole }),
        ...(query ? { OR: [{ name: { contains: query, mode: "insensitive" as const } }, { email: { contains: query, mode: "insensitive" as const } }] } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, name: true, email: true, role: true, provider: true, emailVerified: true, createdAt: true },
    }),
    prisma.user.groupBy({ by: ["role"], _count: true }),
  ]);
  const counts = new Map(grouped.map((g) => [g.role, g._count]));
  const total = grouped.reduce((n, g) => n + g._count, 0);
  const href = (f: string) => `/superadmin/users?${new URLSearchParams({ ...(f !== "ALL" ? { role: f } : {}), ...(query ? { q: query } : {}) })}`;

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div>
          <h1 className="font-anton text-[34px] uppercase tracking-wide leading-none">Users</h1>
          <p className="text-white/50 text-[14px] mt-2">Everyone who has signed up. This list is read-only.</p>
        </div>
        <form action="/superadmin/users" className="flex gap-2">
          {active !== "ALL" && <input type="hidden" name="role" value={active} />}
          <input
            name="q"
            defaultValue={query}
            placeholder="Search name or email…"
            aria-label="Search users"
            className="w-full sm:w-64 px-4 py-2.5 rounded-xl bg-[#181818] border border-white/10 text-[14px] placeholder:text-white/30 outline-none focus:border-[var(--color-lime)]"
          />
          <button className="px-4 py-2.5 rounded-xl border border-white/15 text-[13.5px] font-semibold hover:bg-white/5 cursor-pointer">Search</button>
        </form>
      </header>

      <nav aria-label="Filter users" className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={href(f)}
            aria-current={active === f ? "page" : undefined}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap border transition ${
              active === f ? "bg-[var(--color-lime)] border-transparent text-white" : "border-white/15 text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            {f === "ALL" ? "All" : f === "SUPER_ADMIN" ? "Super admins" : f[0] + f.slice(1).toLowerCase() + "s"}{" "}
            <span className="opacity-70">({f === "ALL" ? total : counts.get(f as UserRole) ?? 0})</span>
          </Link>
        ))}
      </nav>

      {users.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-white/50">No users match.</p>
      ) : (
        <ul className="space-y-2">
          {users.map((u) => (
            <li key={u.id} className="rounded-xl border border-white/10 bg-[#121212]/60 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 justify-between">
              <div className="min-w-0">
                <p className="font-semibold flex items-center gap-2 flex-wrap">
                  {u.name} <StatusBadge value={u.role} />
                </p>
                <p className="text-[13px] text-white/60 break-all">{u.email}</p>
              </div>
              <p className="text-[12px] text-white/40 sm:text-right shrink-0">
                {u.provider === "google" ? "Google" : "Email & password"} · {u.emailVerified ? "verified" : "not verified"}
                <br />
                Joined {u.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}
              </p>
            </li>
          ))}
        </ul>
      )}
      {users.length === 100 && <p className="text-center text-[12.5px] text-white/40">Showing the latest 100. Use search to find others.</p>}
    </div>
  );
}
