"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const badges = [
  { text: "Hackathon", top: "15%", left: "10%", delay: 0 },
  { text: "Music Fest", top: "45%", left: "5%", delay: 0.2 },
  { text: "Robotics", top: "25%", left: "75%", delay: 0.4 },
  { text: "Sports", top: "65%", left: "80%", delay: 0.1 },
  { text: "AI Workshop", top: "75%", left: "15%", delay: 0.5 },
];

export function AuthHero() {
  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col justify-end p-12 lg:p-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2000&auto=format&fit=crop"
          alt="Students at a massive tech event"
          fill
          className="object-cover"
          priority
        />
        {/* Deep gradient overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/60 to-transparent"></div>
      </div>

      {/* Floating Badges */}
      <div className="absolute inset-0 z-10 pointer-events-none hidden md:block">
        {badges.map((badge, i) => (
          <motion.div
            key={i}
            className="absolute px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white/90 text-[13px] font-bold tracking-wider uppercase"
            style={{ top: badge.top, left: badge.left }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: [0, -15, 0],
            }}
            transition={{ 
              opacity: { duration: 0.8, delay: badge.delay },
              y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: badge.delay }
            }}
          >
            {badge.text}
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-[clamp(32px,5vw,56px)] font-anton leading-[1] uppercase tracking-tight mb-6">
            Join the most exciting college events across the country.
          </h1>
          <div className="flex gap-4 text-[18px] md:text-[22px] font-archivo font-bold text-[var(--color-lime)]">
            <span>Connect.</span>
            <span>Compete.</span>
            <span>Celebrate.</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
