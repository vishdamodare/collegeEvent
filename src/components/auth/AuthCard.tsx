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
        // Phones: no outer frame (content uses the full width); card chrome from sm up
        "w-full sm:p-10 sm:rounded-[32px] sm:bg-card sm:backdrop-blur-xl sm:border sm:border-[var(--color-border)] sm:shadow-2xl",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
