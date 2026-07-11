"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "w-full p-8 sm:p-10 rounded-[32px] bg-[var(--color-card)]/80 backdrop-blur-xl border border-white/10 shadow-2xl",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
