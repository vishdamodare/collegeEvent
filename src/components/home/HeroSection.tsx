"use client";

import { useState } from "react";
import { Event } from "@/types";
import { HeroBackground } from "./HeroBackground";
import { HeroContent } from "./HeroContent";
import { HeroCarousel } from "./HeroCarousel";

interface HeroSectionProps {
  events: Event[];
  onOpenDetails: (eventId: string) => void;
  onOpenRegister: (eventId: string) => void;
}

export function HeroSection({ events, onOpenDetails, onOpenRegister }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!events || events.length === 0) return null;
  const activeEvent = events[activeIndex];

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-[120px] pb-[60px] overflow-hidden">
      <HeroBackground events={events} activeIndex={activeIndex} />
      
      <div className="max-w-[1360px] mx-auto px-10 w-full relative z-[2] grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
        <HeroContent 
          event={activeEvent}
          onRegisterClick={() => onOpenRegister(activeEvent.id)}
          onDetailsClick={() => onOpenDetails(activeEvent.id)}
        />
        
        <HeroCarousel 
          events={events}
          activeIndex={activeIndex}
          onEventSelect={setActiveIndex}
          onDetailsClick={() => onOpenDetails(activeEvent.id)}
        />
      </div>

      <div className="absolute bottom-9 left-10 flex items-center gap-[10px] z-[3] text-[12px] text-[var(--color-text-muted)] tracking-[.05em]">
        <div className="w-[1px] h-[34px] bg-gradient-to-b from-[var(--color-text-muted)] to-transparent relative overflow-hidden">
          <div className="absolute left-0 w-full h-full bg-white animate-[scrollcue_1.8s_infinite_ease]" style={{ top: "-100%" }} />
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scrollcue {
              50% { top: 100%; }
              100% { top: 100%; }
            }
          `}} />
        </div>
        Scroll to explore
      </div>
    </section>
  );
}
