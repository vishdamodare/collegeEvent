"use client";

import { useEffect, useRef } from "react";

export function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            const nums = e.target.querySelectorAll(".stat-num");
            nums.forEach((n) => {
              const el = n as HTMLElement;
              const target = parseInt(el.getAttribute("data-target") || "0", 10);
              let count = 0;
              const inc = target / 40;
              const timer = setInterval(() => {
                count += inc;
                if (count >= target) {
                  el.innerText = target.toLocaleString() + "+";
                  clearInterval(timer);
                } else {
                  el.innerText = Math.floor(count).toLocaleString();
                }
              }, 30);
            });
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    const el = sectionRef.current?.querySelector(".stagger");
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <section className="pb-[180px]" ref={sectionRef}>
      <div className="max-w-[1360px] mx-auto px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger">
          <div className="p-[34px] px-[28px] rounded-[24px] bg-[var(--color-card)] border border-[var(--color-border)] flex flex-col justify-center">
            <h3 className="stat-num text-[56px] font-anton text-[var(--color-lime)] leading-none mb-1" data-target="120">
              0
            </h3>
            <p className="text-[15px] text-[var(--color-text-muted)] font-medium">Campuses</p>
          </div>
          <div className="p-[34px] px-[28px] rounded-[24px] bg-[var(--color-card)] border border-[var(--color-border)] flex flex-col justify-center">
            <h3 className="stat-num text-[56px] font-anton text-[var(--color-lime)] leading-none mb-1" data-target="15000">
              0
            </h3>
            <p className="text-[15px] text-[var(--color-text-muted)] font-medium">Active Users</p>
          </div>
          <div className="p-[34px] px-[28px] rounded-[24px] bg-[var(--color-card)] border border-[var(--color-border)] flex flex-col justify-center">
            <h3 className="stat-num text-[56px] font-anton text-[var(--color-lime)] leading-none mb-1" data-target="850">
              0
            </h3>
            <p className="text-[15px] text-[var(--color-text-muted)] font-medium">Events Listed</p>
          </div>
          <div className="p-[34px] px-[28px] rounded-[24px] flex flex-col justify-center bg-[var(--color-lime)] text-[#0B0B08] border-none">
            <h3 className="font-anton text-[32px] font-normal mb-2">Ready to join?</h3>
            <p className="text-[#0B0B08] opacity-80 mb-4 font-medium">Create your account in 30 seconds.</p>
            <button className="btn bg-[#0B0B08] text-white hover:bg-black w-fit">Sign up free</button>
          </div>
        </div>
      </div>
    </section>
  );
}
