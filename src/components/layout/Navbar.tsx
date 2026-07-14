"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

interface NavbarProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export function Navbar({ isAuthenticated: propIsAuthenticated, onLogout: propOnLogout }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: session } = authClient.useSession();
  const isAuthenticated = propIsAuthenticated !== undefined ? propIsAuthenticated : !!session;

  const handleLogout = async () => {
    if (propOnLogout) {
      propOnLogout();
    } else {
      await authClient.signOut();
      window.location.reload();
    }
  };

  const name = session?.user?.name || "User";
  const avatar = session?.user?.image;
  const initial = name[0]?.toUpperCase() || "U";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 border-b",
          scrolled
            ? "bg-[#050505a6] backdrop-blur-[18px] backdrop-saturate-[160%] py-[14px] border-[var(--color-border)]"
            : "py-[22px] border-transparent"
        )}
      >
        <div className="max-w-[1360px] mx-auto px-10">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-[10px] font-archivo font-bold text-[19px]">
              <svg viewBox="0 0 40 40" fill="none" className="w-[34px] h-[34px]">
                <defs>
                  <linearGradient id="lg1" x1="0" y1="0" x2="40" y2="40">
                    <stop offset="0%" stopColor="#D7FF3D" />
                    <stop offset="100%" stopColor="#FF4B33" />
                  </linearGradient>
                </defs>
                <path
                  d="M28 6C17 6 8 14.5 8 25c0 3 .6 5.7 1.8 8.2.3.6-.1 1.3-.8 1.3H6"
                  stroke="url(#lg1)"
                  strokeWidth="4.2"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="30" cy="9" r="3.4" fill="#FFD84D" />
              </svg>
              CollegeEvents
            </Link>

            <div className="hidden lg:flex items-center gap-[38px]">
              {["Home", "Events", "Colleges", "About", "Contact"].map((item) => (
                <Link
                  key={item}
                  href={`/#${item.toLowerCase()}`}
                  className="text-[14.5px] font-medium text-[var(--color-text-muted)] relative py-1 transition-colors duration-300 hover:text-white group"
                >
                  {item}
                  <span className="absolute left-0 -bottom-[2px] w-0 h-[1.5px] bg-[var(--color-lime)] transition-all duration-350 ease-[var(--ease-custom)] group-hover:w-full"></span>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-[24px]">
              <ThemeToggle />
              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-4">
                  <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    {avatar ? (
                      <img src={avatar} alt={name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[var(--color-lime)] to-[var(--color-coral)] flex items-center justify-center text-black font-bold text-[12px]">
                        {initial}
                      </div>
                    )}
                    <span className="text-[13px] font-medium mr-2">{name}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-[13.5px] font-medium text-[var(--color-text-muted)] hover:text-white transition-colors duration-300 cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-[24px]">
                  <Link
                    href="/login"
                    className="text-[16px] font-medium text-white hover:text-[var(--color-lime)] transition-colors duration-300 font-archivo"
                  >
                    Log in
                  </Link>
                  <Link 
                    href="/signup"
                    className="flex items-center justify-center px-[28px] py-[14px] rounded-full font-bold text-[16px] font-archivo bg-[var(--color-lime)] text-[#0B0B08] shadow-[4px_4px_0_var(--color-coral)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_var(--color-coral)] hover:bg-[var(--color-butter)] transition-all duration-350 ease-[var(--ease-custom)] whitespace-nowrap"
                  >
                    Sign up
                  </Link>
                </div>
              )}

              {/* Burger Menu for Mobile */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden relative w-10 h-10 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-center"
              >
                <span
                  className={cn(
                    "absolute block w-4 h-[1.5px] bg-white transition-all duration-300 top-[19.3px] left-[11px]",
                    menuOpen && "opacity-0"
                  )}
                ></span>
                <span
                  className={cn(
                    "absolute block w-4 h-[1.5px] bg-white transition-all duration-300 left-[11px]",
                    menuOpen ? "top-[19.3px] rotate-45" : "top-[14px]"
                  )}
                ></span>
                <span
                  className={cn(
                    "absolute block w-4 h-[1.5px] bg-white transition-all duration-300 left-[11px]",
                    menuOpen ? "top-[19.3px] -rotate-45" : "top-[24.6px]"
                  )}
                ></span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-[1100] transition-opacity duration-400",
          menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={closeMenu}
      ></div>

      {/* Mobile Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-[100vh] w-[78%] max-w-[340px] z-[1200] bg-[#0a0a0cfa] border-l border-[var(--color-border)] backdrop-blur-[20px] pt-[100px] px-8 pb-10 flex flex-col gap-[26px] transition-transform duration-500 ease-[var(--ease-custom)]",
          menuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {["Home", "Events", "Colleges", "About", "Contact"].map((item) => (
          <Link
            key={item}
            href={`#${item.toLowerCase()}`}
            onClick={closeMenu}
            className="text-[19px] font-medium"
          >
            {item}
          </Link>
        ))}
        <div className="h-[1px] bg-[var(--color-border)] my-[6px]"></div>
        {isAuthenticated ? (
          <>
            <div className="flex items-center gap-3 px-3 py-2 rounded-full bg-white/5 border border-white/10 w-fit">
              {avatar ? (
                <img src={avatar} alt={name} className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[var(--color-lime)] to-[var(--color-coral)] flex items-center justify-center text-black font-bold text-[12px]">
                  {initial}
                </div>
              )}
              <span className="text-[14px] font-medium text-white">{name}</span>
            </div>
            <button 
              onClick={() => { closeMenu(); handleLogout(); }}
              className="w-full flex items-center justify-center gap-2 px-[28px] py-[15px] rounded-full font-semibold text-[15px] bg-white/5 border border-white/10 text-white transition-all duration-350 cursor-pointer"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" onClick={closeMenu} className="text-[19px] font-medium">
              Log in
            </Link>
            <Link 
              href="/signup"
              onClick={closeMenu}
              className="w-full flex items-center justify-center gap-2 px-[28px] py-[15px] rounded-full font-semibold text-[15px] bg-[var(--color-lime)] text-[#0B0B08] shadow-[4px_4px_0_var(--color-coral)] transition-all duration-350 ease-[var(--ease-custom)] whitespace-nowrap text-center"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </>
  );
}
