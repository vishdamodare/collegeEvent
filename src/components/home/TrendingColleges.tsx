"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { College } from "@/types";

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
            <div
              key={idx}
              className="rounded-[24px] overflow-hidden bg-[var(--color-card)] border border-[var(--color-border)] relative cursor-pointer group"
            >
              <div className="h-[200px] relative overflow-hidden">
                <div className="absolute top-4 left-4 w-[34px] h-[34px] rounded-full bg-[#05050599] backdrop-blur-[10px] border border-white/10 flex items-center justify-center font-bold text-[14px] font-anton z-[2]">
                  #{idx + 1}
                </div>
                <Image
                  src={college.img}
                  alt={college.name}
                  fill
                  className="object-cover transition-transform duration-800 ease-[var(--ease-custom)] group-hover:scale-105"
                />
              </div>
              <div className="p-[22px] px-[24px]">
                <h4 className="text-[22px] font-archivo font-bold mb-[6px]">{college.name}</h4>
                <div className="text-[13px] text-[var(--color-text-faint)] mb-4">{college.loc}</div>
                <div className="flex gap-[18px]">
                  <div className="text-[12.5px] text-[var(--color-text-muted)] flex flex-col gap-[3px]">
                    <b className="text-white text-[15px] font-semibold">{college.events}</b> events active
                  </div>
                  <div className="text-[12.5px] text-[var(--color-text-muted)] flex flex-col gap-[3px]">
                    <b className="text-white text-[15px] font-semibold">{college.students}</b> students on campus
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-[50px] reveal">
          <button className="btn-glass px-[28px] py-[15px] rounded-full font-semibold transition-all hover:bg-[var(--color-card-hover)] hover:border-[var(--color-border-bright)] hover:-translate-y-[3px]">
            View all 120+ campuses
          </button>
        </div>
      </div>
    </section>
  );
}
