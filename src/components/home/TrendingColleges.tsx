"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Star } from "lucide-react";

interface College {
  name: string;
  loc: string;
  events: string;
  students: string;
  img: string;
  slug: string;
  verified?: boolean;
  followers?: string;
  upcomingEvents?: string;
  rating?: string;
  categories?: string;
}

interface TrendingCollegesProps {
  colleges: College[];
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
      className="py-[140px] bg-[#0F0F0B] border-y border-[var(--color-border)]"
      ref={sectionRef}
    >
      <div className="max-w-[1360px] mx-auto px-10">
        <div className="reveal max-w-[640px] mx-auto text-center mb-[60px]">
          <span className="eyebrow">
            <span className="dot" style={{ background: "var(--color-cobalt)", boxShadow: "0 0 10px var(--color-cobalt)" }}></span> 
            The big leagues
          </span>
          <h2 className="text-[clamp(32px,4.2vw,52px)] mt-4 mb-[14px]">Trending Campuses</h2>
          <p className="text-[var(--color-text-muted)] text-[17px] font-normal leading-[1.6]">
            The colleges hosting the most buzzed-about events this season.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
          {colleges.map((college, idx) => (
            <Link
              key={idx}
              href={`/colleges/${college.slug}`}
              className="rounded-[24px] overflow-hidden bg-[var(--color-card)] border border-[var(--color-border)] relative cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="h-[200px] relative overflow-hidden">
                  <div className="absolute top-4 left-4 w-[34px] h-[34px] rounded-full bg-[#05050599] backdrop-blur-[10px] border border-white/10 flex items-center justify-center font-bold text-[14px] font-anton z-[2]">
                    #{idx + 1}
                  </div>
                  {college.verified && (
                    <div className="absolute top-4 right-4 bg-emerald-500/90 backdrop-blur-[5px] rounded-lg border border-white/10 px-2.5 py-1 flex items-center gap-1 z-[2] text-[10px] font-bold text-white uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3 fill-emerald-500 text-black" />
                      Verified
                    </div>
                  )}
                  <Image
                    src={college.img}
                    alt={college.name}
                    fill
                    className="object-cover transition-transform duration-800 ease-[var(--ease-custom)] group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 350px"
                  />
                </div>
                <div className="p-[22px] px-[24px]">
                  <div className="flex items-start justify-between gap-3 mb-[6px]">
                    <h4 className="text-[20px] font-archivo font-bold leading-tight group-hover:text-[var(--color-lime)] transition-colors">
                      {college.name}
                    </h4>
                    {college.rating && (
                      <span className="flex items-center gap-0.5 text-xs font-bold text-orange-400 shrink-0 mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                        {college.rating.split(" ")[0]}
                      </span>
                    )}
                  </div>
                  <div className="text-[13px] text-[var(--color-text-faint)] mb-4">{college.loc}</div>
                  
                  {college.categories && (
                    <div className="text-[11px] text-[var(--color-text-muted)] font-medium mb-4 uppercase tracking-wider">
                      <span className="text-[var(--color-lime)] font-bold">Top:</span> {college.categories}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-[22px] px-[24px] pt-0 border-t border-white/5 mt-4">
                <div className="flex gap-[18px] pt-4">
                  <div className="text-[12px] text-[var(--color-text-muted)] flex flex-col gap-[3px]">
                    <span className="text-white text-[14px] font-bold leading-none">{college.events}</span>
                    <span>events active</span>
                  </div>
                  <div className="text-[12px] text-[var(--color-text-muted)] flex flex-col gap-[3px]">
                    <span className="text-white text-[14px] font-bold leading-none">{college.students}</span>
                    <span>students registered</span>
                  </div>
                  {college.followers && (
                    <div className="text-[12px] text-[var(--color-text-muted)] flex flex-col gap-[3px]">
                      <span className="text-white text-[14px] font-bold leading-none">{college.followers}</span>
                      <span>followers</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
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
