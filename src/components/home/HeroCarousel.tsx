"use client";

import { useEffect, useRef, useState } from "react";
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
  const storiesRef = useRef<HTMLDivElement>(null);

  // Keep the active story visible in the mobile strip (horizontal only, no page jump)
  useEffect(() => {
    const strip = storiesRef.current;
    const item = strip?.children[activeIndex] as HTMLElement | undefined;
    if (!strip || !item) return;
    strip.scrollTo({ left: item.offsetLeft - strip.clientWidth / 2 + item.offsetWidth / 2, behavior: "smooth" });
  }, [activeIndex]);

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
    <>
    {/* Mobile: story-style picker; the hero text above already shows the active event */}
    <div
      ref={storiesRef}
      className="lg:hidden -mx-5 px-5 py-2 flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
    >
      {events.map((ev, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            key={ev.id}
            onClick={() => onEventSelect(index)}
            className="snap-center flex-none w-[72px] flex flex-col items-center gap-2"
            aria-label={`Show ${ev.title}`}
            aria-current={isActive}
          >
            <span
              className={cn(
                "block w-[68px] h-[68px] rounded-full p-[3px] transition-all duration-500 ease-[var(--ease-custom)]",
                isActive
                  ? "bg-[conic-gradient(var(--color-lime),var(--color-butter),var(--color-coral),var(--color-lime))] scale-105"
                  : "bg-[var(--color-border-bright)]"
              )}
            >
              <span className="relative block w-full h-full rounded-full overflow-hidden border-[3px] border-[var(--color-background)]">
                <Image src={ev.img} alt="" fill className="object-cover" sizes="68px" />
              </span>
            </span>
            <span
              className={cn(
                "text-[11px] leading-tight text-center line-clamp-2 transition-colors",
                isActive ? "text-[var(--color-text-main)] font-semibold" : "text-[var(--color-text-faint)]"
              )}
            >
              {ev.title}
            </span>
          </button>
        );
      })}
    </div>

    <div className="hidden lg:block relative h-[640px] w-full" style={{ perspective: "1400px" }}>
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
                : "w-[7px] rounded-full bg-[var(--color-border-bright)] hover:bg-[var(--color-text-faint)]"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
    </>
  );
}
