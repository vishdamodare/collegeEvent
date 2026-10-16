"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthBackground } from "./AuthBackground";
import { AuthHero } from "./AuthHero";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full flex flex-col lg:flex-row bg-[var(--color-background)] text-[var(--color-text-main)] overflow-hidden">
      <AuthBackground />

      {/* Way back to the site; sits on the (always dark) hero photo */}
      <Link
        href="/"
        className="absolute top-5 left-5 lg:top-8 lg:left-10 z-30 inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/35 backdrop-blur-md border border-white/15 text-white text-[13px] font-semibold font-archivo hover:bg-black/50 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        CollegeEvents
      </Link>

      {/* Left Pane - 60% on Desktop, compact banner on Mobile */}
      <div className="w-full lg:w-[60%] h-[230px] sm:h-[300px] lg:h-screen relative flex-none">
        <AuthHero />
      </div>

      {/* Right Pane - 40% on Desktop, Content below on Mobile */}
      <div className="w-full lg:w-[40%] lg:h-screen relative flex items-start lg:items-center justify-center px-5 pt-7 pb-12 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-[480px] relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
