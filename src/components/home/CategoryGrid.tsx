"use client";

import { useEffect, useRef } from "react";
import { Category } from "@/types";

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
            <div
              key={idx}
              className="p-[28px] px-[24px] rounded-[24px] bg-[var(--color-card)] border border-[var(--color-border)] flex items-start gap-[18px] cursor-pointer relative overflow-hidden transition-all duration-400 ease-[var(--ease-custom)] hover:-translate-y-[5px] hover:border-[var(--color-border-bright)] group"
              style={{ "--glow": cat.glow } as React.CSSProperties}
            >
              <div 
                className="absolute inset-0 opacity-0 transition-opacity duration-500 blur-[30px] group-hover:opacity-100" 
                style={{ background: "var(--glow, rgba(255,255,255,.1))" }}
              />
              <div className="text-[32px] leading-none relative">{cat.icon}</div>
              <div className="relative">
                <h4 className="text-[18px] font-archivo font-bold mb-1">{cat.name}</h4>
                <span className="text-[13px] text-[var(--color-text-faint)]">{cat.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
