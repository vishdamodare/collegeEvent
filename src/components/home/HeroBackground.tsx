"use client";

import { useEffect, useState, memo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Event } from "@/types";

interface HeroBackgroundProps {
  events: Event[];
  activeIndex: number;
}

const Particles = memo(function Particles() {
  const [particles, setParticles] = useState<{ id: number; size: number; left: number; top: number; dur: number; delay: number }[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 26 }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      left: Math.random() * 100,
      top: 90 + Math.random() * 10,
      dur: 10 + Math.random() * 14,
      delay: Math.random() * 10,
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white opacity-50 blur-[0.5px]"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            animation: `floatUp ${p.dur}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatUp {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.4; }
          100% { transform: translateY(-120vh) translateX(20px); opacity: 0; }
        }
      `}} />
    </div>
  );
});

export function HeroBackground({ events, activeIndex }: HeroBackgroundProps) {
  return (
    <>
      <div 
        className="absolute inset-0 z-0 transition-colors duration-[1200ms] ease-in-out"
        style={{
          background: `
            radial-gradient(ellipse 900px 600px at 15% 20%, rgba(215,255,61,.16), transparent 60%),
            radial-gradient(ellipse 700px 700px at 85% 75%, rgba(255,75,51,.14), transparent 60%),
            radial-gradient(ellipse 1000px 800px at 50% 100%, rgba(36,81,255,.10), transparent 60%),
            var(--color-background)
          `
        }}
      >
        {events.map((ev, index) => (
          <Image
            key={ev.id}
            src={ev.img}
            alt="Background"
            fill
            priority={index === 0}
            className="object-cover transition-opacity duration-1000 ease-in-out saturate-[1.1] contrast-[1.05]"
            style={{
              opacity: index === activeIndex ? 0.28 : 0,
              zIndex: index === activeIndex ? 1 : 0
            }}
          />
        ))}
        {/* Gradient Overlays */}
        <div 
          className="absolute inset-0 z-[2]" 
          style={{
            background: `
              linear-gradient(180deg, rgba(5,5,5,.2) 0%, rgba(5,5,5,.55) 60%, var(--color-background) 100%),
              linear-gradient(90deg, rgba(5,5,5,.85) 0%, rgba(5,5,5,.2) 50%)
            `
          }} 
        />
      </div>
      <Particles />
    </>
  );
}
