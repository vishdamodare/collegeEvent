"use client";

import { useState } from "react";
import { EVENTS, CATEGORIES, COLLEGE_INFO, COLLEGES, TESTIMONIALS } from "@/constants/events";
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
import { Event } from "@/types";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [detailEventId, setDetailEventId] = useState<string | null>(null);
  const [registerEventId, setRegisterEventId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const detailEvent = detailEventId ? EVENTS.find((e) => e.id === detailEventId) || null : null;
  const registerEvent = registerEventId ? EVENTS.find((e) => e.id === registerEventId) || null : null;
  
  const collegeInfo = detailEvent ? COLLEGE_INFO[detailEvent.college] : undefined;

  const openDetails = (id: string) => setDetailEventId(id);
  
  const handleRegisterClick = (id: string) => {
    if (isAuthenticated) {
      setRegisterEventId(id);
    } else {
      router.push("/signup");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-main)]">
      <Navbar 
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />
      
      <HeroSection 
        events={EVENTS} 
        onOpenDetails={openDetails} 
        onOpenRegister={handleRegisterClick} 
      />
      
      <FeaturedEvents 
        events={EVENTS} 
        onOpenDetails={openDetails} 
      />
      
      <EventTimeline 
        events={EVENTS} 
        onOpenDetails={openDetails} 
      />
      
      <CategoryGrid categories={CATEGORIES} />
      
      <TrendingColleges colleges={COLLEGES} />
      
      <Testimonials testimonials={TESTIMONIALS} />
      
      <StatsSection />

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
