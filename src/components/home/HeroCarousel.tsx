"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Event } from "@/types";
import { cn } from "@/utils/cn";

interface HeroCarouselProps {
  events: Event[];
  activeIndex: number;
  onEventSelect: (index: number) => void;
  onDetailsClick: () => void;
}

export function HeroCarousel({ events, activeIndex, onEventSelect, onDetailsClick }: HeroCarouselProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play timer
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      onEventSelect((activeIndex + 1) % events.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeIndex, events.length, isHovered, onEventSelect]);

  const n = events.length;

  const getPositionClass = (index: number) => {
    let diff = index - activeIndex;
    if (diff > n / 2) diff -= n;
    if (diff < -n / 2) diff += n;

    if (diff === 0) return "pos-active";
    if (diff === 1) return "pos-r1";
    if (diff === 2) return "pos-r2";
    if (diff === -1) return "pos-l1";
    if (diff === -2) return "pos-l2";
    return "pos-hidden";
  };

  return (
    <div className="relative h-[440px] md:h-[640px] w-full mt-5 md:mt-0" style={{ perspective: "1400px" }}>
      <div 
        className="relative h-full w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {events.map((ev, index) => {
          const posClass = getPositionClass(index);
          const isActive = posClass === "pos-active";
          
          return (
            <div
              key={ev.id}
              className={cn("event-card", posClass)}
              onClick={() => {
                if (isActive) {
                  onDetailsClick();
                } else {
                  onEventSelect(index);
                }
              }}
            >
              <Image src={ev.img} alt={ev.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent from-30% to-black/85" />
              
              <div className="absolute left-[18px] right-[18px] bottom-[18px]">
                <span className="inline-block text-[10.5px] font-bold tracking-[.08em] uppercase px-[10px] py-1 rounded-full mb-2 text-white bg-white/15 backdrop-blur-md">
                  {ev.cat}
                </span>
                <h4 className="text-[17px] font-semibold font-archivo mb-[3px] text-white">
                  {ev.title}
                </h4>
                <div className="text-[12.5px] text-[#cfcfcf]">
                  {ev.college} · {ev.date}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-8 right-10 flex justify-center gap-2 z-[5]">
        {events.map((_, index) => (
          <button
            suppressHydrationWarning
            key={index}
            onClick={() => onEventSelect(index)}
            className={cn(
              "h-[7px] transition-all duration-400 ease-[var(--ease-custom)]",
              index === activeIndex
                ? "w-[22px] rounded-[6px] bg-[var(--color-lime)]"
                : "w-[7px] rounded-full bg-white/25 hover:bg-white/50"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
