"use client";

import { AuthBackground } from "./AuthBackground";
import { AuthHero } from "./AuthHero";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full flex flex-col lg:flex-row bg-[#0A0A0A] text-white overflow-hidden">
      <AuthBackground />
      
      {/* Left Pane - 60% on Desktop, Hero above on Mobile */}
      <div className="w-full lg:w-[60%] h-[40vh] lg:h-screen relative flex-none">
        <AuthHero />
      </div>

      {/* Right Pane - 40% on Desktop, Content below on Mobile */}
      <div className="w-full lg:w-[40%] min-h-[60vh] lg:h-screen relative flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-[480px] relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
