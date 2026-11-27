import { Building2, GraduationCap } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CollegeCard } from "@/components/home/TrendingColleges";
import { getDynamicColleges } from "@/actions/events";

export const dynamic = "force-dynamic";

export default async function CollegesDirectoryPage() {
  const collegesList = await getDynamicColleges();

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col font-archivo selection:bg-[var(--color-lime)] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[110px] sm:pt-32 pb-16 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--color-lime)]/30 bg-[var(--color-lime)]/10 text-[var(--color-lime)] text-[12px] font-bold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" /> Partner Network
          </div>
          <h1 className="text-4xl sm:text-5xl font-anton uppercase tracking-wider text-text-main">
            Participating Colleges & Host Institutions
          </h1>
          <p className="text-base text-text-muted leading-relaxed">
            Discover premier campus fests, hackathons, and cultural events organized by top engineering, medical, and degree institutions.
          </p>
        </div>

        {/* Colleges Grid */}
        {collegesList.length === 0 ? (
          <div className="py-24 text-center text-text-faint space-y-3 rounded-3xl border border-border bg-card">
            <Building2 className="w-12 h-12 mx-auto text-text-faint" />
            <p className="text-base font-bold uppercase tracking-wider">No partner colleges registered yet</p>
            <p className="text-sm text-text-faint">Check back soon as new host colleges join the platform!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {collegesList.map((col) => (
              <CollegeCard key={col.slug} college={col} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
