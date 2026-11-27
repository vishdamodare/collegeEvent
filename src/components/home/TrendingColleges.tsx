"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, GraduationCap, Star } from "lucide-react";

export interface College {
  name: string;
  short?: string;
  loc: string;
  events: string;
  registrations: string;
  img?: string;
  credit?: { text: string; url: string };
  rating?: string;
  slug: string;
  verified?: boolean;
  categories?: string;
}

interface TrendingCollegesProps {
  colleges: College[];
}

export function CollegeCard({ college }: { college: College }) {
  return (
    <Link
      href={`/colleges/${college.slug}`}
      className="rounded-2xl overflow-hidden bg-[var(--color-card)] border border-[var(--color-border)] relative cursor-pointer group flex flex-col justify-between"
    >
      <div>
        <div className="h-[200px] relative overflow-hidden">
          {college.img ? (
            <Image
              src={college.img}
              alt={college.name}
              fill
              className="object-cover transition-transform duration-800 ease-[var(--ease-custom)] group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 350px"
            />
          ) : (
            // No photo yet: a neutral placeholder rather than a stock image of some other campus
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cobalt)]/35 via-[var(--color-card-hover)] to-[var(--color-card)] flex items-center justify-center">
              <GraduationCap className="w-14 h-14 text-[var(--color-text-faint)] opacity-60" aria-hidden />
            </div>
          )}
          {college.credit && (
            <span className="absolute bottom-2 left-3 z-[2] text-[9px] text-white/80 [text-shadow:0_1px_2px_rgba(0,0,0,.8)] pointer-events-none">
              {college.credit.text}
            </span>
          )}
        </div>
        <div className="p-[22px] px-[24px]">
          <div className="flex items-start justify-between gap-3 mb-[6px]">
            <h4 className="text-[20px] font-archivo font-bold leading-tight group-hover:text-[var(--color-lime)] transition-colors">
              {college.name}
              {college.verified && (
                <CheckCircle2 className="inline-block w-[17px] h-[17px] ml-1.5 -mt-0.5 text-emerald-500" aria-label="Verified campus" />
              )}
            </h4>
            {college.rating && (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-400 shrink-0 mt-1" aria-label={`Rated ${college.rating} out of 5`}>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden />
                {college.rating}
              </span>
            )}
          </div>
          <div className="text-[13px] text-[var(--color-text-faint)] mb-4">{college.loc}</div>

          {college.categories && (
            <div className="text-[14px] text-[var(--color-text-muted)] mb-4">{college.categories}</div>
          )}
        </div>
      </div>

      <div className="p-[22px] px-[24px] pt-0 border-t border-[var(--color-border)] mt-4">
        <div className="flex gap-[18px] pt-4">
          <div className="text-[12px] text-[var(--color-text-muted)] flex flex-col gap-[3px]">
            <span className="text-[var(--color-text-main)] text-[14px] font-bold leading-none">{college.events}</span>
            <span>{college.events === "1" ? "live event" : "live events"}</span>
          </div>
          <div className="text-[12px] text-[var(--color-text-muted)] flex flex-col gap-[3px]">
            <span className="text-[var(--color-text-main)] text-[14px] font-bold leading-none">{college.registrations}</span>
            <span>registrations</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function TrendingColleges({ colleges }: TrendingCollegesProps) {
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
    <section 
      id="colleges" 
      className="py-16 sm:py-24 bg-[var(--color-bg-elevated)] border-y border-[var(--color-border)]"
      ref={sectionRef}
    >
      <div className="max-w-[1360px] mx-auto px-5 sm:px-10">
        <div className="mb-8 sm:mb-10">
          <h2 className="text-[clamp(28px,3.6vw,40px)]">Trending campuses</h2>
          <p className="mt-2 text-[var(--color-text-muted)] text-[17px] leading-[1.6]">
            Where the events are happening this season.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {colleges.map((college, idx) => (
            <CollegeCard key={idx} college={college} />
          ))}
        </div>

        <div className="text-center mt-[50px] reveal">
          <Link 
            href="/events" 
            className="btn-glass px-[28px] py-[15px] rounded-full font-semibold transition-all hover:bg-[var(--color-card-hover)] hover:border-[var(--color-border-bright)] hover:-translate-y-[3px] inline-block text-sm"
          >
            Explore all fests
          </Link>
        </div>
      </div>
    </section>
  );
}
