"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Event } from "@/types";
import { Button } from "../ui/Button";

interface HeroContentProps {
  event: Event;
}

export function HeroContent({ event }: HeroContentProps) {
  return (
    <div className="w-full md:w-[60%] flex flex-col justify-center px-6 md:px-12 lg:px-24 h-full relative z-20">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col gap-6 w-full"
        >
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="flex items-center gap-2"
          >
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border backdrop-blur-md ${event.category.color || 'bg-white/10 text-white border-white/20'}`}>
              {event.category.name}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white uppercase tracking-tight leading-[1.1] max-w-3xl"
          >
            {event.title}
          </motion.h1>

          {/* Meta Info */}
          <motion.div className="flex flex-col md:flex-row gap-2 md:gap-6 text-white/80 text-sm md:text-base font-medium">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {event.college.name}
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </motion.div>

          {/* Description */}
          <motion.p className="text-white/70 text-lg max-w-xl leading-relaxed line-clamp-3">
            {event.description}
          </motion.p>

          {/* Actions */}
          <motion.div className="flex items-center gap-4 mt-4">
            <Button size="lg" className="px-8">
              Register Now
            </Button>
            <Button size="lg" variant="glass" className="px-8 hidden md:inline-flex">
              Explore Event
            </Button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
