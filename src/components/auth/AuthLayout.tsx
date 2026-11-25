"use client";

import { AuthHero } from "./AuthHero";

interface AuthLayoutProps {
  children: React.ReactNode;
}

// Brand panel on the left (a slim logo bar on phones), the form on the right
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[var(--color-background)] text-[var(--color-text-main)]">
      <AuthHero />
      <main className="flex-1 flex items-start lg:items-center justify-center px-5 pt-8 pb-14 sm:px-12 sm:py-14">
        <div className="w-full max-w-[460px]">{children}</div>
      </main>
    </div>
  );
}
