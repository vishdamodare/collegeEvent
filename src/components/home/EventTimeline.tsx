"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Event } from "@/types";
import { cn } from "@/utils/cn";

interface EventTimelineProps {
  events: Event[];
  onOpenDetails: (eventId: string) => void;
}

export function EventTimeline({ events, onOpenDetails }: EventTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [fillHeight, setFillHeight] = useState(0);
  const [litItems, setLitItems] = useState<boolean[]>(new Array(events.length).fill(false));

  useEffect(() => {
    // Reveal Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
          }
        });
      },
      { threshold: 0.15 }
    );
    const els = containerRef.current?.querySelectorAll(".reveal, .stagger");
    els?.forEach((el) => observer.observe(el));

    // Scroll progress for timeline
    const handleScroll = () => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      
      // Math from the vanilla design
      const progress = Math.min(Math.max((vh - rect.top) / (rect.height + vh), 0), 1);
      const fillPx = progress * rect.height;
      setFillHeight(fillPx);

      const newLit = itemRefs.current.map((item) => {
        if (!item) return false;
        return item.offsetTop <= fillPx;
      });
      setLitItems(newLit);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <section className="pb-[140px]" ref={containerRef}>
      <div className="max-w-[900px] mx-auto px-10">
        <div className="reveal mb-[56px]">
          <span className="eyebrow">
            <span className="dot"></span> Don't miss out
          </span>
          <h2 className="text-[clamp(32px,4.2vw,52px)] mt-4 mb-[14px]">Upcoming on your radar</h2>
          <p className="text-[var(--color-text-muted)] text-[17px] font-normal leading-[1.6]">
            A running order of what's next across your favorite campuses.
          </p>
        </div>

        <div className="relative pl-[34px] stagger" ref={timelineRef}>
          {/* Background Track */}
          <div className="absolute left-[5px] top-[6px] bottom-[6px] w-[1.5px] bg-[var(--color-border)]" />
          
          {/* Fill Line */}
          <div 
            className="absolute left-[5px] top-[6px] w-[1.5px] rounded-[2px] transition-all duration-75"
            style={{ 
              height: fillHeight,
              background: "linear-gradient(var(--color-lime), rgba(215,255,61,.15))",
              boxShadow: "0 0 10px 1px rgba(215,255,61,.6), 0 0 22px 2px rgba(215,255,61,.25)"
            }}
          >
            {/* Glow dot */}
            <div className="absolute left-1/2 bottom-[-5px] -translate-x-1/2 w-[11px] h-[11px] rounded-full bg-[var(--color-lime)] shadow-[0_0_14px_4px_rgba(215,255,61,.85),0_0_32px_10px_rgba(215,255,61,.35)] animate-[timelinePulse_1.6s_ease-in-out_infinite]" />
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes timelinePulse {
                0%, 100% { opacity: .75; transform: translateX(-50%) scale(.9); }
                50% { opacity: 1; transform: translateX(-50%) scale(1.2); }
              }
            `}} />
          </div>

          {events.map((ev, index) => (
            <div
              key={ev.id}
              ref={(el) => { itemRefs.current[index] = el; }}
              className="relative pb-[44px] last:pb-0 grid grid-cols-[110px_1fr] gap-6 items-center"
            >
              {/* Timeline Dot */}
              <div 
                className={cn(
                  "absolute left-[-34px] top-[6px] w-[11px] h-[11px] rounded-full transition-all duration-400 ease-[var(--ease-custom)]",
                  litItems[index]
                    ? "bg-[var(--color-lime)] shadow-[0_0_0_5px_rgba(215,255,61,.15),0_0_16px_rgba(215,255,61,.7)]"
                    : "bg-[#f5f3ea33] shadow-none"
                )}
              />

              {/* Date */}
              <div className="text-[13px] font-semibold text-[var(--color-text-muted)] font-archivo">
                {ev.date.split("–")[0]}
                <small className="block text-[11px] text-[var(--color-text-faint)] font-normal mt-0.5">
                  {ev.college}
                </small>
              </div>

              {/* Card */}
              <div 
                className="flex items-center gap-[18px] p-[18px] px-[22px] rounded-[20px] bg-[var(--color-card)] border border-[var(--color-border)] backdrop-blur-[10px] cursor-pointer transition-all duration-400 ease-[var(--ease-custom)] hover:translate-x-2 hover:border-[var(--color-border-bright)] hover:bg-[var(--color-card-hover)] group"
                onClick={() => onOpenDetails(ev.id)}
              >
                <div className="w-16 h-16 rounded-[14px] overflow-hidden flex-none">
                  <Image src={ev.img} alt={ev.title} width={64} height={64} className="object-cover w-full h-full" />
                </div>
                <div>
                  <h4 className="text-[16px] font-semibold font-archivo mb-[3px]">{ev.title}</h4>
                  <span className="text-[12.5px] text-[var(--color-text-faint)]">{ev.venue} · {ev.cat}</span>
                </div>
                <div className="ml-auto w-9 h-9 rounded-full border border-[var(--color-border)] flex items-center justify-center flex-none transition-all duration-400 ease-[var(--ease-custom)] group-hover:bg-[var(--color-lime)] group-hover:text-[#0B0B08] group-hover:border-transparent group-hover:rotate-45">
                  →
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
