"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Event } from "@/types";

interface ScheduleProps {
  events: Event[];
  onOpenDetails: (eventId: string) => void;
}

// Event.date arrives as "Dec 15" (or "Dec 15–17")
function splitDate(date: string) {
  const [month = "", day = ""] = date.split(" ");
  return { month, day };
}

// Recommendations aren't in date order, so sort first; then consecutive equal dates form one block per day
function groupByDay(events: Event[]) {
  const sorted = [...events].sort((a, b) => (a.dateISO ?? "").localeCompare(b.dateISO ?? ""));
  const groups: { date: string; events: Event[] }[] = [];
  for (const e of sorted) {
    const last = groups[groups.length - 1];
    if (last && last.date === e.date) last.events.push(e);
    else groups.push({ date: e.date, events: [e] });
  }
  return groups;
}

export function Schedule({ events, onOpenDetails }: ScheduleProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();

  // The rail fills as the reader scrolls down the schedule
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 65%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });

  if (events.length === 0) return null;
  const days = groupByDay(events);

  return (
    <section id="events" className="pt-12 sm:pt-16 pb-16 sm:pb-24">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-10">
        <div className="flex items-end justify-between gap-6 mb-10 sm:mb-14">
          <div>
            <h2 className="text-[clamp(30px,4vw,48px)]">What&apos;s on</h2>
            <p className="mt-2 text-[17px] text-[var(--color-text-muted)]">The next few days across campuses, day by day.</p>
          </div>
          <Link href="/events" className="shrink-0 text-[15px] font-semibold text-[var(--color-lime)] hover:underline underline-offset-4">
            See all events
          </Link>
        </div>

        <ol ref={listRef} className="relative">
          {/* One continuous rail (desktop), with a bright fill that follows the scroll */}
          <div aria-hidden className="absolute left-[5px] md:left-[172px] top-[18px] bottom-[18px] w-px bg-[var(--color-border-bright)]">
            <motion.div
              className="absolute inset-0 origin-top bg-[var(--color-lime)]"
              style={{ scaleY: reduce ? 1 : fill }}
            />
          </div>

          {days.map((day, dayIndex) => (
            <Day key={`${day.date}-${dayIndex}`} date={day.date} events={day.events} dayIndex={dayIndex} reduce={!!reduce} onOpenDetails={onOpenDetails} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Day({
  date,
  events,
  dayIndex,
  reduce,
  onOpenDetails,
}: {
  date: string;
  events: Event[];
  dayIndex: number;
  reduce: boolean;
  onOpenDetails: (eventId: string) => void;
}) {
  const { month, day } = splitDate(date);
  const ref = useRef<HTMLLIElement>(null);
  // The day's dot lights once the reader has scrolled to it (and stays lit, matching the rail fill)
  const reached = useInView(ref, { margin: "0px 0px -40% 0px", once: true });

  return (
    <li ref={ref} className="relative pl-7 md:pl-0 md:grid md:grid-cols-[132px_minmax(0,1fr)] md:gap-10 pb-10 last:pb-0">
      <span
        aria-hidden
        className={`absolute left-0 md:left-[167px] top-[14px] w-[11px] h-[11px] rounded-full ring-4 ring-[var(--color-background)] transition-all duration-500 ${
          reached || reduce ? "bg-[var(--color-lime)] scale-110" : "bg-[var(--color-border-bright)]"
        }`}
      />

      <div className="flex items-baseline gap-2 md:block md:text-right md:pt-1 mb-4 md:mb-0">
        <div className="text-[14px] font-semibold text-[var(--color-lime)]">{month}</div>
        <div className="font-anton text-[40px] md:text-[56px] leading-none tracking-tight">{day}</div>
      </div>

      <div className="md:pl-10 space-y-3 overflow-x-clip">
        {events.map((event, i) => (
          <motion.button
            key={event.id}
            type="button"
            onClick={() => onOpenDetails(event.id)}
            initial={reduce ? false : { opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "0px 0px -12% 0px" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: Math.min(i, 3) * 0.08 }}
            className="group w-full flex items-center gap-4 sm:gap-5 p-3 sm:p-4 text-left rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-border-bright)] hover:bg-[var(--color-card-hover)] transition-colors cursor-pointer"
            data-day={dayIndex}
          >
            <div className="relative shrink-0 w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] rounded-xl overflow-hidden bg-[var(--color-bg-elevated)]">
              {event.img && (
                <Image
                  src={event.img}
                  alt=""
                  fill
                  sizes="88px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  aria-hidden
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-[var(--color-text-faint)]">{event.cat.charAt(0) + event.cat.slice(1).toLowerCase()}</p>
              <h3 className="mt-0.5 text-[17px] sm:text-[19px] font-semibold leading-snug line-clamp-2 group-hover:text-[var(--color-lime)] transition-colors">
                {event.title}
              </h3>
              <p className="mt-1 text-[14px] text-[var(--color-text-muted)] truncate">
                {event.venue}, {event.college}
              </p>
            </div>
            {/* Wrapper does the hiding: .btn sets its own display, which would override `hidden` on the button itself */}
            <span className="hidden sm:block shrink-0">
              <span className="btn btn-glass !py-2.5 !px-5 !text-[14px] group-hover:bg-[var(--color-card-hover)]">View</span>
            </span>
          </motion.button>
        ))}
      </div>
    </li>
  );
}
