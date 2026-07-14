"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
import { EventTimeline } from "@/components/home/EventTimeline";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { TrendingColleges } from "@/components/home/TrendingColleges";
import { Testimonials } from "@/components/home/Testimonials";
import { StatsSection } from "@/components/home/StatsSection";
import { EventDetailModal } from "@/components/shared/EventDetailModal";
import { RegistrationModal } from "@/components/shared/RegistrationModal";
import { AboutSection } from "@/components/home/AboutSection";
import { ContactSection } from "@/components/home/ContactSection";
import { Event, Category } from "@/types";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { COLLEGES, COLLEGE_INFO, TESTIMONIALS } from "@/constants/events";

interface HomeClientProps {
  events: Event[];
  categories: Category[];
  stats: {
    totalEvents: number;
    totalCategories: number;
    totalOrganizers: number;
  };
}

export function HomeClient({ events, categories, stats }: HomeClientProps) {
  const router = useRouter();
  const [detailEventId, setDetailEventId] = useState<string | null>(null);
  const [registerEventId, setRegisterEventId] = useState<string | null>(null);

  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session;

  const detailEvent = detailEventId ? events.find((e) => e.id === detailEventId) || null : null;
  const registerEvent = registerEventId ? events.find((e) => e.id === registerEventId) || null : null;

  const collegeInfo = detailEvent ? COLLEGE_INFO[detailEvent.college] : undefined;

  const openDetails = (id: string) => setDetailEventId(id);

  const handleRegisterClick = (id: string) => {
    if (isAuthenticated) {
      setRegisterEventId(id);
    } else {
      router.push("/signup");
    }
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-main)]">
      <Navbar
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />

      <HeroSection
        events={events}
        onOpenDetails={openDetails}
        onOpenRegister={handleRegisterClick}
      />

      <FeaturedEvents
        events={events}
        onOpenDetails={openDetails}
      />

      <EventTimeline
        events={events}
        onOpenDetails={openDetails}
      />

      <CategoryGrid categories={categories} />

      <TrendingColleges colleges={COLLEGES} />

      <Testimonials testimonials={TESTIMONIALS} />

      <StatsSection />

      <AboutSection />

      <ContactSection />

      <Footer />

      <EventDetailModal
        isOpen={!!detailEventId}
        onClose={() => setDetailEventId(null)}
        event={detailEvent}
        collegeInfo={collegeInfo}
        onRegister={() => {
          if (detailEventId) handleRegisterClick(detailEventId);
        }}
      />

      <RegistrationModal
        isOpen={!!registerEventId}
        onClose={() => setRegisterEventId(null)}
        event={registerEvent}
      />
    </main>
  );
}
