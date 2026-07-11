"use client";

import * as React from "react";
import { Event } from "@/types";
import { HeroBackground } from "./HeroBackground";
import { HeroContent } from "./HeroContent";
import { HeroCarousel } from "./HeroCarousel";
import { Navbar } from "../layout/Navbar";

interface HeroSectionProps {
  events: Event[];
}

export function HeroSection({ events }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  
  // Autoplay functionality: cycle to the next event every 5 seconds
  React.useEffect(() => {
    if (!events || events.length === 0) return;
    
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % events.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [events]);

  if (!events || events.length === 0) return null;
  
  const activeEvent = events[activeIndex];
  // Extract all hero images from all events to pass to the background for preloading
  const allImages = events.map(
    event => event.images.find(img => img.isHero)?.url || event.images[0]?.url
  );

  return (
    <section className="relative w-full h-screen min-h-[800px] overflow-hidden flex flex-col">
      <Navbar />
      <HeroBackground images={allImages} activeIndex={activeIndex} />
      
      <div className="flex-1 flex flex-col md:flex-row pt-24 pb-12 w-full max-w-[2000px] mx-auto">
        <HeroContent event={activeEvent} />
        <HeroCarousel 
          events={events} 
          activeEventIndex={activeIndex} 
          onEventSelect={setActiveIndex} 
        />
      </div>
    </section>
  );
}
