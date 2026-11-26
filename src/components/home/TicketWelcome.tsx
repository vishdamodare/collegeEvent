"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const LINES = ["Find the fest.", "Register in a minute.", "Walk in with a QR."];

/** Fills the phone ticket's photo area when the event has no photo. Sits bottom-left, clear of the "Checked in" badge. */
export function TicketWelcome() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((n) => (n + 1) % LINES.length), 2400);
    return () => clearInterval(t);
  }, [reduce]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[linear-gradient(135deg,#EEF0FB_0%,#DDE2F0_100%)] text-[#0A1024]" aria-hidden>
      {/* A few drifting dots for life */}
      {!reduce &&
        [
          { l: "12%", t: "22%", s: 7, d: 0 },
          { l: "34%", t: "14%", s: 5, d: 0.8 },
          { l: "22%", t: "46%", s: 6, d: 1.6 },
        ].map((p, k) => (
          <motion.span
            key={k}
            className="absolute rounded-full bg-[#DC2229]/35"
            style={{ left: p.l, top: p.t, width: p.s, height: p.s }}
            animate={{ y: [0, -8, 0], opacity: [0.35, 0.8, 0.35] }}
            transition={{ duration: 3.2, repeat: Infinity, delay: p.d, ease: "easeInOut" }}
          />
        ))}

      <div className="absolute left-4 right-4 bottom-2.5">
        <div className="flex items-center gap-2">
          <motion.span
            initial={reduce ? false : { scale: 0.4, rotate: -12, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 14 }}
            className="shrink-0"
          >
            <Image src="/logo-mark.png" alt="" width={32} height={32} className="w-8 h-8" />
          </motion.span>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="leading-tight"
          >
            <div className="text-[10.5px] font-medium text-[#5A6382]">Welcome to</div>
            <div className="font-anton text-[17px] tracking-tight">CollegeEvent</div>
          </motion.div>
        </div>

        <div className="relative mt-1.5 h-[18px] overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={i}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-x-0 text-[12.5px] font-semibold text-[#DC2229]"
            >
              {LINES[i]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
