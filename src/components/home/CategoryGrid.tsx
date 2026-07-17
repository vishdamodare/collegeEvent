"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";

interface Category {
  name: string;
  count: string;
  icon: string;
  glow: string;
  slug: string;
  nearestCity?: string;
  trending?: boolean;
}

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
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
    const els = sectionRef.current?.querySelectorAll(".reveal, .stagger");
    els?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="pb-[140px]" ref={sectionRef}>
      <div className="max-w-[1360px] mx-auto px-10">
        <div className="reveal max-w-[640px] mb-[56px]">
          <h2 className="text-[clamp(32px,4.2vw,52px)] mb-[14px]">Explore by category</h2>
          <p className="text-[var(--color-text-muted)] text-[17px] font-normal leading-[1.6]">
            From hackathons to headliners.
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5 stagger">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              href={`/events?category=${cat.slug}`}
              className="p-[28px] px-[24px] rounded-[24px] bg-[var(--color-card)] border border-var(--color-border) flex items-start gap-[18px] cursor-pointer relative overflow-hidden transition-all duration-400 ease-[var(--ease-custom)] hover:-translate-y-[5px] hover:border-[var(--color-border-bright)] group"
              style={{ "--glow": cat.glow } as React.CSSProperties}
            >
              <div 
                className="absolute inset-0 opacity-0 transition-opacity duration-500 blur-[30px] group-hover:opacity-100" 
                style={{ background: "var(--glow, rgba(255,255,255,.1))" }}
              />
              <div className="text-[32px] leading-none relative">{cat.icon}</div>
              <div className="relative flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-[18px] font-archivo font-bold leading-tight">{cat.name}</h4>
                  {cat.trending && (
                    <span className="text-[9px] font-bold bg-[var(--color-lime)]/15 border border-[var(--color-lime)]/30 text-[var(--color-lime)] px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                      Trending
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-semibold text-white/90">{cat.count}</span>
                  {cat.nearestCity && (
                    <span className="text-[11px] text-[var(--color-text-faint)] font-medium font-archivo">
                      {cat.nearestCity}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
