"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface HeroBackgroundProps {
  images: string[];
  activeIndex: number;
}

export function HeroBackground({ images, activeIndex }: HeroBackgroundProps) {
  return (
    <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden bg-[#111]">
      {images.map((imageUrl, index) => (
        <motion.div
          key={imageUrl}
          initial={false}
          animate={{ 
            opacity: index === activeIndex ? 1 : 0,
            scale: index === activeIndex ? 1 : 1.05
          }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: index === activeIndex ? 1 : 0 }}
        >
          <Image
            src={imageUrl}
            alt="Event Background"
            fill
            className="object-cover object-center"
            priority={index === 0} // Only prioritize the first one for initial page load
          />
        </motion.div>
      ))}
      {/* Dark overlay for contrast (35-50% as specified) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 z-10" />
    </div>
  );
}
