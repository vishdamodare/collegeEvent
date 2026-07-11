"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Event } from "@/types";
import { cn } from "@/utils/cn";

interface EventCardProps {
  event: Event;
  isFirst: boolean;
  onClick: () => void;
  index: number;
}

export function EventCard({ event, isFirst, onClick, index }: EventCardProps) {
  // Using layout animations for the cards to slide correctly when re-ordered
  return (
    <motion.div
      layout
      onClick={onClick}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ y: -15, scale: 1.03, transition: { duration: 0.2 } }}
      transition={{ layout: { type: "spring", stiffness: 350, damping: 30 } }}
      className={cn(
        "relative rounded-2xl overflow-hidden cursor-pointer shrink-0 transition-all duration-500 ease-out shadow-2xl group",
        isFirst 
          ? "w-[260px] md:w-[300px] h-[380px] md:h-[420px] opacity-100 brightness-110 shadow-black/50" 
          : "w-[200px] md:w-[240px] h-[300px] md:h-[340px] opacity-70 hover:opacity-100 shadow-black/30"
      )}
    >
      <Image
        src={event.images[0].url}
        alt={event.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      
      {/* Glass gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Card Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-2">
        <span className={cn(
          "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide w-fit border backdrop-blur-md",
          event.category.color || 'bg-white/10 text-white border-white/20'
        )}>
          {event.category.name}
        </span>
        <h3 className="text-white font-bold text-lg md:text-xl leading-tight line-clamp-2">
          {event.title}
        </h3>
        <p className="text-white/60 text-xs md:text-sm flex items-center gap-1 font-medium">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      </div>
      
      {/* Active ring indicator */}
      {isFirst && (
        <div className="absolute inset-0 border-2 border-white/20 rounded-2xl pointer-events-none" />
      )}
    </motion.div>
  );
}
