"use client";

import * as React from "react";
import { cn } from "@/utils/cn";
import { Button } from "../ui/Button";

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-6 py-4 md:px-12",
        isScrolled
          ? "bg-black/50 backdrop-blur-lg border-b border-white/10"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-black text-xl">
            C
          </div>
          <span className="text-white font-bold text-xl tracking-tight hidden md:block">
            CollegeEvents
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-white/80 text-sm font-medium">
          <a href="#" className="hover:text-white transition-colors">Home</a>
          <a href="#" className="hover:text-white transition-colors">Events</a>
          <a href="#" className="hover:text-white transition-colors">Colleges</a>
          <a href="#" className="hover:text-white transition-colors">About</a>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10 hidden md:inline-flex">
            Login
          </Button>
          <Button variant="glass" size="sm">
            Sign Up
          </Button>
        </div>
      </div>
    </nav>
  );
}
