"use client";

import { useState, useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

const subscribeNoop = () => () => {};

export function ThemeToggle() {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [chosen, setTheme] = useState<"light" | "dark" | null>(null);
  // Until the user toggles, mirror what the inline <head> script applied
  const theme =
    chosen ?? (mounted ? (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "dark" : "dark");

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  if (!mounted) {
    return (
      <div className="w-[42px] h-[42px] rounded-full border border-border bg-card" />
    );
  }

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      className="p-2.5 rounded-full border border-border bg-card hover:bg-card-hover text-text-faint hover:text-text-main transition-colors flex items-center justify-center cursor-pointer"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="w-4.5 h-4.5 text-lime" />
      ) : (
        <Moon className="w-4.5 h-4.5 text-cobalt" />
      )}
    </motion.button>
  );
}
