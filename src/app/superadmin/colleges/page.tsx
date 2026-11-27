import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superadmin";
import { Monogram, RegisterCollegeForm } from "@/components/superadmin/Controls";

export const dynamic = "force-dynamic";

export default async function CollegesPage() {
  await requireSuperAdmin();
  const [colleges, profiles] = await Promise.all([
    prisma.college.findMany({ orderBy: { name: "asc" } }),
    prisma.organizerProfile.findMany({
      select: { college: true, user: { select: { events: { select: { _count: { select: { registrations: { where: { status: { not: "CANCELLED" } } } } } } } } } },
    }),
  ]);

  // Per-college totals, keyed by lowercase name (same match the detail page uses)
  const totals = new Map<string, { organizers: number; events: number; registrations: number }>();
  for (const p of profiles) {
    const t = totals.get(p.college.toLowerCase()) ?? { organizers: 0, events: 0, registrations: 0 };
    t.organizers += 1;
    t.events += p.user.events.length;
    t.registrations += p.user.events.reduce((n, e) => n + e._count.registrations, 0);
    totals.set(p.college.toLowerCase(), t);
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-anton text-[34px] uppercase tracking-wide leading-none">Colleges</h1>
        <p className="text-sa-fg/55 text-[14px] max-w-prose">
          A college must be registered here before its organizers can create an account and publish events.
        </p>
      </header>

      <section aria-labelledby="add-college" className="rounded-2xl border border-sa-fg/10 bg-sa-card/60 p-5 space-y-3">
        <h2 id="add-college" className="font-semibold text-[15px]">Register a new college</h2>
        <RegisterCollegeForm />
      </section>

      <section aria-labelledby="registered" className="space-y-3">
        <h2 id="registered" className="font-semibold text-[15px] text-sa-fg/70">
          Registered colleges ({colleges.length})
        </h2>
        {colleges.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-sa-fg/15 p-10 text-center text-sa-fg/50">
            No colleges yet. Register one above and its organizers can start signing up.
          </p>
        ) : (
          <ul className="rounded-2xl border border-sa-fg/10 divide-y divide-sa-fg/10 overflow-hidden">
            {colleges.map((c) => {
              const t = totals.get(c.name.toLowerCase()) ?? { organizers: 0, events: 0, registrations: 0 };
              return (
                <li key={c.id}>
                  <Link
                    href={`/superadmin/colleges/${c.id}`}
                    className="group flex items-center gap-4 p-4 sm:p-5 bg-sa-card/60 hover:bg-sa-fg/[0.04] focus-visible:bg-sa-fg/[0.04] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-lime)] transition-colors"
                  >
                    <Monogram name={c.name} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[16px] truncate">{c.name}</p>
                      <p className="text-[13px] text-sa-fg/50 sm:hidden">
                        {t.organizers} organizer{t.organizers === 1 ? "" : "s"} · {t.events} event{t.events === 1 ? "" : "s"}
                      </p>
                    </div>
                    <dl className="hidden sm:flex gap-8 text-right">
                      {[["Organizers", t.organizers], ["Events", t.events], ["Registrations", t.registrations]].map(([label, n]) => (
                        <div key={label}>
                          <dd className="font-anton text-[20px] leading-none">{n}</dd>
                          <dt className="text-[12px] text-sa-fg/45 mt-1">{label}</dt>
                        </div>
                      ))}
                    </dl>
                    <span aria-hidden className="text-sa-fg/30 group-hover:text-sa-fg transition-colors">›</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
