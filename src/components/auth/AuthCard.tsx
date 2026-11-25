"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

// The form sits directly on the page next to the brand panel: no card chrome, just a short fade in
export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("w-full", className)}
    >
      {children}
    </motion.div>
  );
}
