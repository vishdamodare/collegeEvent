"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Event } from "@/types";

interface HeroContentProps {
  event: Event;
  onRegisterClick: () => void;
  onDetailsClick: () => void;
}

export function HeroContent({ event, onRegisterClick, onDetailsClick }: HeroContentProps) {
  // We use key={event.id} on the container to trigger animations on change
  return (
    <div className="max-w-[560px] relative z-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="flex gap-[10px] flex-wrap mb-[26px]">
            <span className="eyebrow">
              <span className="dot"></span> Live across 120+ campuses
            </span>
          </div>

          <h1 className="text-[clamp(42px,5.6vw,74px)] mb-5">
            <span className="block overflow-hidden">
              <span 
                className="inline-block"
                dangerouslySetInnerHTML={{ __html: event.title.toUpperCase().replace(" ", "<br>") }}
              />
            </span>
          </h1>

          <p className="text-[17px] text-[var(--color-text-muted)] leading-[1.65] mb-[30px] max-w-[460px] font-normal">
            {event.sub}
          </p>

          <div className="flex flex-wrap gap-[10px] mb-[34px]">
            <span className="meta-chip">🏫 <b>{event.college}</b></span>
            <span className="meta-chip">📅 <b>{event.date}</b></span>
            <span className="meta-chip">📍 <b>{event.venue}</b></span>
            <span className="meta-chip">👥 <b>{event.participants}</b></span>
            <span className="meta-chip">🏆 <b>{event.prize}</b></span>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row gap-[14px]">
        <button className="btn btn-primary w-full sm:w-auto" onClick={onRegisterClick}>
          Register now
        </button>
        <button className="btn btn-glass w-full sm:w-auto" onClick={onDetailsClick}>
          View details
        </button>
      </div>
    </div>
  );
}
