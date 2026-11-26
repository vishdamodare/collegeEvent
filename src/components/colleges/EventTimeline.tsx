"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export interface TimelineEvent {
  id: string;
  slug: string;
  title: string;
  dateISO: string;
  category: string;
  location: string;
  imageUrl?: string;
}

// Fixed zone so server and browser always agree on the day an event falls on
const TZ = "Asia/Kolkata";
const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(iso).toLocaleString("en-IN", { timeZone: TZ, ...o });
const dayKey = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ });

/** Events grouped by day along a vertical rail that fills as you scroll. Uses the page's --a / --c-* tokens. */
export function EventTimeline({ events }: { events: TimelineEvent[] }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 60%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 220, damping: 32, mass: 0.3 });

  const groups: { key: string; items: TimelineEvent[] }[] = [];
  for (const e of events) {
    const k = dayKey(e.dateISO);
    const last = groups[groups.length - 1];
    if (last?.key === k) last.items.push(e);
    else groups.push({ key: k, items: [e] });
  }

  return (
    <div ref={ref} className="relative pl-10 sm:pl-14 overflow-x-clip">
      {/* Rail: faint track, then the brand-coloured fill that follows the scroll */}
      <div aria-hidden className="absolute left-[15px] sm:left-[23px] top-2 bottom-2 w-0.5 rounded bg-[color:var(--c-line2)]" />
      <motion.div
        aria-hidden
        style={{ scaleY: reduce ? 1 : fill, originY: 0 }}
        className="absolute left-[15px] sm:left-[23px] top-2 bottom-2 w-0.5 rounded bg-[var(--a)]"
      />

      <ol className="space-y-10">
        {groups.map((g, gi) => (
          <li key={g.key} className="relative">
            {/* Day marker on the rail */}
            <span className="absolute -left-[30px] sm:-left-[39px] top-1.5 sm:top-2 grid place-items-center w-3 h-3 sm:w-3.5 sm:h-3.5">
              {gi === 0 && !reduce && (
                <span aria-hidden className="absolute inset-0 rounded-full bg-[var(--a)] opacity-50 animate-ping" />
              )}
              <span className="relative block w-full h-full rounded-full border-2 border-[var(--a)] bg-[color:var(--c-bg)]">
                <motion.span
                  className="block w-full h-full rounded-full bg-[var(--a)]"
                  initial={reduce ? false : { scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: "0px 0px -40% 0px" }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                />
              </span>
            </span>

            <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="font-anton text-xl sm:text-2xl leading-none">{fmt(g.items[0].dateISO, { weekday: "short", month: "short", day: "numeric" })}</h3>
              <span className="text-sm text-[color:var(--c-faint)]">
                {g.items.length} {g.items.length === 1 ? "event" : "events"}
              </span>
              {gi === 0 && (
                <span className="rounded-full bg-[var(--a)] px-2.5 py-0.5 text-xs font-semibold text-white">Next up</span>
              )}
            </div>

            <ul className="space-y-3">
              {g.items.map((e, ei) => (
                <motion.li
                  key={e.id}
                  initial={reduce ? false : { opacity: 0, x: 28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                  transition={{ duration: 0.45, delay: ei * 0.07, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={`/events/${e.slug}`}
                    className="group flex items-center gap-3 sm:gap-4 rounded-xl border border-[color:var(--c-line)] bg-[color:var(--c-card)] p-2.5 sm:p-3 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-[var(--a)] focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span className="relative shrink-0 w-[72px] h-[72px] sm:w-28 sm:h-[72px] rounded-lg overflow-hidden bg-[color:var(--c-thumb)]">
                      {e.imageUrl && <Image src={e.imageUrl} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="112px" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs text-[var(--dt)] font-medium">
                        {fmt(e.dateISO, { hour: "numeric", minute: "2-digit" })}
                      </span>
                      <span className="block text-[15px] sm:text-base font-bold leading-snug line-clamp-2 group-hover:text-[var(--dt)]">{e.title}</span>
                      <span className="block text-sm text-[color:var(--c-faint)] truncate">
                        {e.category}
                        <span className="hidden sm:inline"> · {e.location}</span>
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--dt)] shrink-0">
                      <span className="hidden sm:inline">Register</span>
                      <ArrowUpRight className="w-5 h-5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
