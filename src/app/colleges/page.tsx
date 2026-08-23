import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Building2, MapPin, CalendarDays, ArrowRight, GraduationCap } from "lucide-react";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

export const dynamic = "force-dynamic";

export default async function CollegesDirectoryPage() {
  // Fetch organizer profiles with college information
  const organizerProfiles = await prisma.organizerProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          events: {
            where: { status: "PUBLISHED" },
            select: { id: true, title: true, category: { select: { name: true } } },
          },
        },
      },
    },
  });

  // Group by college name
  const collegeMap = new Map<string, {
    name: string;
    slug: string;
    departments: Set<string>;
    eventsCount: number;
    address: string | null;
    website: string | null;
    organizersCount: number;
  }>();

  for (const org of organizerProfiles) {
    if (!org.college) continue;
    const collegeName = org.college.trim();
    const slug = collegeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    if (!collegeMap.has(slug)) {
      collegeMap.set(slug, {
        name: collegeName,
        slug,
        departments: new Set(org.department ? [org.department] : []),
        eventsCount: org.user.events.length,
        address: org.address || null,
        website: org.website || null,
        organizersCount: 1,
      });
    } else {
      const existing = collegeMap.get(slug)!;
      if (org.department) existing.departments.add(org.department);
      existing.eventsCount += org.user.events.length;
      existing.organizersCount += 1;
    }
  }

  const collegesList = Array.from(collegeMap.values());

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex flex-col font-archivo selection:bg-[var(--color-lime)] selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--color-lime)]/30 bg-[var(--color-lime)]/10 text-[var(--color-lime)] text-[12px] font-bold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" /> Partner Network
          </div>
          <h1 className="text-4xl sm:text-5xl font-anton uppercase tracking-wider text-white">
            Participating Colleges & Host Institutions
          </h1>
          <p className="text-base text-white/50 leading-relaxed">
            Discover premier campus fests, hackathons, and cultural events organized by top engineering, medical, and degree institutions.
          </p>
        </div>

        {/* Colleges Grid */}
        {collegesList.length === 0 ? (
          <div className="py-24 text-center text-white/30 space-y-3 rounded-3xl border border-white/10 bg-[#121212]/40">
            <Building2 className="w-12 h-12 mx-auto text-white/20" />
            <p className="text-base font-bold uppercase tracking-wider">No partner colleges registered yet</p>
            <p className="text-sm text-white/30">Check back soon as new host colleges join the platform!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collegesList.map((col) => (
              <Link
                key={col.slug}
                href={`/colleges/${col.slug}`}
                className="group rounded-3xl border border-white/10 bg-[#121212]/50 hover:bg-[#161616] p-6 space-y-6 transition-all duration-300 hover:border-[var(--color-lime)]/40 hover:shadow-2xl flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[var(--color-lime)]/50 group-hover:bg-[var(--color-lime)]/10 transition-colors">
                      <Building2 className="w-6 h-6 text-white group-hover:text-[var(--color-lime)] transition-colors" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[var(--color-lime)]/10 border border-[var(--color-lime)]/20 text-[var(--color-lime)] font-bold text-[11px] uppercase">
                      {col.eventsCount} Active Fests
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-[var(--color-lime)] transition-colors leading-tight">
                      {col.name}
                    </h3>
                    {col.address && (
                      <p className="flex items-center gap-1.5 text-xs text-white/40 mt-2">
                        <MapPin className="w-3.5 h-3.5 text-white/30 shrink-0" />
                        <span className="truncate">{col.address}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {Array.from(col.departments).slice(0, 3).map((dept) => (
                      <span
                        key={dept}
                        className="text-[10.5px] px-2.5 py-0.5 rounded-md bg-white/5 border border-white/5 text-white/60"
                      >
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-white/50 group-hover:text-white transition-colors">
                  <span>View Fest Catalog</span>
                  <ArrowRight className="w-4 h-4 text-[var(--color-lime)] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
