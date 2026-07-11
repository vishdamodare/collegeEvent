"use client";

import { motion } from "framer-motion";

export function AuthBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0A0A0A]">
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#111] to-[#0A0A0A] opacity-90"></div>
      
      {/* Animated glowing orbs */}
      <motion.div 
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--color-lime)] opacity-[0.03] blur-[120px]"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div 
        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[var(--color-cobalt)] opacity-[0.03] blur-[150px]"
        animate={{
          x: [0, -40, 0],
          y: [0, -60, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      
      {/* Noise texture overlay for premium feel */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml;utf8,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
    </div>
  );
}
