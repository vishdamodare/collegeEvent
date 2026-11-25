"use client";

import type { ComponentProps } from "react";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
import { EventTimeline } from "@/components/home/EventTimeline";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { TrendingColleges } from "@/components/home/TrendingColleges";
import { StatsSection } from "@/components/home/StatsSection";
import { EventDetailModal } from "@/components/shared/EventDetailModal";
import { AboutSection } from "@/components/home/AboutSection";
import { ContactSection } from "@/components/home/ContactSection";
import { Event } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient, signInWithGoogle } from "@/lib/auth-client";

interface HomeClientProps {
  events: Event[];
  categories: ComponentProps<typeof CategoryGrid>["categories"];
  colleges: ComponentProps<typeof TrendingColleges>["colleges"];
  stats: {
    totalEvents: number;
    totalCategories: number;
    totalOrganizers: number;
    totalStudents: number;
    totalColleges: number;
  };
}

export function HomeClient({ events, categories, colleges, stats }: HomeClientProps) {
  const router = useRouter();
  const [detailEventId, setDetailEventId] = useState<string | null>(null);

  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session;

  const detailEvent = detailEventId ? events.find((e) => e.id === detailEventId) || null : null;

  const openDetails = (id: string) => setDetailEventId(id);

  const handleRegisterClick = (id: string) => {
    const event = events.find((e) => e.id === id);
    if (!event) return;
    const target = `/events/${event.slug}?register=true`;
    if (isAuthenticated) {
      router.push(target);
    } else {
      // Logged out: Google first, then straight back to this event's registration
      signInWithGoogle(target).then(({ error }) => {
        if (error) toast.error(error.message || "Couldn't reach Google sign-in. Please try again.");
      });
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

      <TrendingColleges colleges={colleges} />

      <StatsSection stats={stats} />

      <AboutSection stats={stats} />

      <ContactSection />

      <Footer />

      <EventDetailModal
        isOpen={!!detailEventId}
        onClose={() => setDetailEventId(null)}
        event={detailEvent}
        onRegister={() => {
          if (detailEventId) handleRegisterClick(detailEventId);
        }}
      />
    </main>
  );
}
