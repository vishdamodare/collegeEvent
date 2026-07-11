"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Testimonial } from "@/types";

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export function Testimonials({ testimonials }: TestimonialsProps) {
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
    const els = sectionRef.current?.querySelectorAll(".reveal");
    els?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Duplicate items for seamless infinite scroll
  const items = [...testimonials, ...testimonials];

  return (
    <section className="pt-[140px] pb-10 overflow-hidden" ref={sectionRef}>
      <div className="max-w-[1360px] mx-auto px-10 text-center">
        <div className="reveal max-w-[640px] mx-auto mb-[50px]">
          <h2 className="text-[clamp(32px,4.2vw,52px)] m-0">Word on campus</h2>
        </div>
      </div>

      <div className="relative w-full overflow-hidden py-5">
        <div className="absolute left-0 top-0 bottom-0 w-[150px] z-[2] pointer-events-none bg-gradient-to-r from-[var(--color-background)] to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-[150px] z-[2] pointer-events-none bg-gradient-to-l from-[var(--color-background)] to-transparent" />
        
        <div className="flex gap-[24px] w-max animate-[tScroll_35s_linear_infinite]">
          {items.map((t, idx) => (
            <div
              key={idx}
              className="w-[420px] p-[32px] rounded-[24px] bg-[var(--color-card)] border border-[var(--color-border)]"
            >
              <p className="text-[16px] leading-[1.6] mb-[24px] font-normal">"{t.quote}"</p>
              <div className="flex items-center gap-[14px]">
                <Image
                  src={t.avatar}
                  alt={t.name}
                  width={46}
                  height={46}
                  className="w-[46px] h-[46px] rounded-full object-cover"
                />
                <div className="text-left">
                  <h5 className="text-[15px] font-archivo font-bold mb-[2px]">{t.name}</h5>
                  <span className="text-[12.5px] text-[var(--color-text-faint)]">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes tScroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(calc(-50% - 12px)); }
            }
          `}} />
        </div>
      </div>
    </section>
  );
}
