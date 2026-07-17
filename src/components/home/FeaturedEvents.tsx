"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Event } from "@/types";

interface FeaturedEventsProps {
  events: Event[];
  onOpenDetails: (eventId: string) => void;
}

export function FeaturedEvents({ events, onOpenDetails }: FeaturedEventsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const el = sectionRef.current?.querySelector(".reveal");
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="events" className="py-[140px]" ref={sectionRef}>
      <div className="max-w-[1360px] mx-auto px-10">
        <div className="reveal max-w-[640px] mb-[56px]">
          <span className="eyebrow">
            <span className="dot"></span> Handpicked for you
          </span>
          <h2 className="text-[clamp(32px,4.2vw,52px)] mt-4 mb-[14px]">Featured events this week</h2>
          <p className="text-[var(--color-text-muted)] text-[17px] font-normal leading-[1.6]">
            The ones your group chat is already talking about.
          </p>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-6 px-1 snap-x snap-mandatory scrollbar-hide">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="snap-start flex-[0_0_340px] rounded-[26px] overflow-hidden relative bg-[var(--color-card)] border border-[var(--color-border)] cursor-pointer transition-all duration-500 ease-[var(--ease-custom)] hover:-translate-y-2.5 hover:-rotate-1 hover:border-[var(--color-border-bright)] hover:shadow-[0_30px_60px_-20px_rgba(215,255,61,.25)] group"
              onClick={() => onOpenDetails(ev.id)}
            >
              <div className="h-[230px] overflow-hidden relative">
                <Image
                  src={ev.img}
                  alt={ev.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-[var(--ease-custom)] group-hover:scale-110"
                />
              </div>
              <div className="p-5 pb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className={`cat-badge ${ev.badge}`}>{ev.cat}</span>
                </div>
                <div className="text-[19px] font-archivo font-bold mb-[6px]">{ev.title}</div>
                <div className="text-[13.5px] text-[var(--color-text-faint)] mb-4">
                  {ev.college} · {ev.venue}
                </div>
                <div className="flex justify-between items-center pt-3.5 border-t border-[var(--color-border)]">
                  <span className="text-[12.5px] text-[var(--color-text-muted)]">{ev.date}</span>
                  <button suppressHydrationWarning className="btn-glass btn-sm rounded-full font-semibold transition-all hover:bg-[var(--color-card-hover)] hover:border-[var(--color-border-bright)] hover:-translate-y-[3px]">
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
