"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

// Real routes where a page exists; homepage sections otherwise
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Colleges", href: "/colleges" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

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
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const pathname = usePathname();
  // "/" only matches exactly; section anchors (/#about) are never "current"
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : !href.includes("#") && pathname.startsWith(href);

  // Lock page scroll and allow Esc while the drawer is open
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 border-b",
          scrolled
            ? "bg-[color-mix(in_srgb,var(--color-background)_88%,transparent)] backdrop-blur-[18px] backdrop-saturate-[160%] py-[14px] border-[var(--color-border)]"
            : "py-[22px] border-transparent"
        )}
      >
        <div className="max-w-[1360px] mx-auto px-5 sm:px-10">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-[10px] font-archivo font-bold text-[19px]">
              <svg viewBox="0 0 40 40" fill="none" className="w-[34px] h-[34px]">
                <defs>
                  <linearGradient id="lg1" x1="0" y1="0" x2="40" y2="40">
                    <stop offset="0%" style={{ stopColor: "var(--color-lime)" }} />
                    <stop offset="100%" style={{ stopColor: "var(--color-coral)" }} />
                  </linearGradient>
                </defs>
                <path
                  d="M28 6C17 6 8 14.5 8 25c0 3 .6 5.7 1.8 8.2.3.6-.1 1.3-.8 1.3H6"
                  stroke="url(#lg1)"
                  strokeWidth="4.2"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="30" cy="9" r="3.4" style={{ fill: "var(--color-butter)" }} />
              </svg>
              CollegeEvents
            </Link>

            <div className="hidden lg:flex items-center gap-[38px]">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    "text-[14.5px] font-medium relative py-1 transition-colors duration-300 hover:text-[var(--color-text-main)] group",
                    isActive(href) ? "text-[var(--color-text-main)]" : "text-[var(--color-text-muted)]"
                  )}
                >
                  {label}
                  <span className={cn(
                    "absolute left-0 -bottom-[2px] h-[1.5px] bg-[var(--color-lime)] transition-all duration-350 ease-[var(--ease-custom)] group-hover:w-full",
                    isActive(href) ? "w-full" : "w-0"
                  )}></span>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-[24px]">
              <ThemeToggle />
              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-4">
                  {(session?.user as any)?.role === "ORGANIZER" || (session?.user as any)?.role === "SUPER_ADMIN" ? (
                    <Link href="/admin" className="text-[13.5px] font-bold text-[var(--color-lime)] hover:text-[var(--color-text-main)] transition-colors duration-350 mr-1">
                      Admin Panel
                    </Link>
                  ) : (
                    <Link href="/dashboard" className="text-[13.5px] font-bold text-[var(--color-lime)] hover:text-[var(--color-text-main)] transition-colors duration-350 mr-1">
                      Dashboard
                    </Link>
                  )}
                  <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)]">
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
                    className="text-[13.5px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors duration-300 cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-[24px]">
                  <Link
                    href="/login"
                    className="text-[16px] font-medium text-[var(--color-text-main)] hover:text-[var(--color-lime)] transition-colors duration-300 font-archivo"
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
                    "absolute block w-4 h-[1.5px] bg-[var(--color-text-main)] transition-all duration-300 top-[19.3px] left-[11px]",
                    menuOpen && "opacity-0"
                  )}
                ></span>
                <span
                  className={cn(
                    "absolute block w-4 h-[1.5px] bg-[var(--color-text-main)] transition-all duration-300 left-[11px]",
                    menuOpen ? "top-[19.3px] rotate-45" : "top-[14px]"
                  )}
                ></span>
                <span
                  className={cn(
                    "absolute block w-4 h-[1.5px] bg-[var(--color-text-main)] transition-all duration-300 left-[11px]",
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
          "fixed inset-0 bg-black/40 backdrop-blur-[3px] z-[1100] transition-opacity duration-400",
          menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={closeMenu}
      ></div>

      {/* Mobile Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={cn(
          "fixed top-0 right-0 h-[100dvh] w-[86%] max-w-[360px] z-[1200] bg-[var(--color-background)] border-l border-[var(--color-border)] shadow-[-20px_0_60px_-20px_rgba(0,0,0,.35)] px-6 pt-5 pb-[max(24px,env(safe-area-inset-bottom))] flex flex-col transition-transform duration-500 ease-[var(--ease-custom)]",
          menuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between mb-6">
          <span className="text-[12px] font-semibold tracking-[.14em] uppercase text-[var(--color-text-faint)]">Menu</span>
          <button
            onClick={closeMenu}
            aria-label="Close menu"
            className="w-10 h-10 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-main)]"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={closeMenu}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "flex items-center justify-between px-4 py-3.5 rounded-2xl text-[17px] font-semibold font-archivo transition-colors",
                isActive(href)
                  ? "bg-[var(--color-lime)] text-[#0B0B08]"
                  : "text-[var(--color-text-main)] active:bg-[var(--color-bg-elevated)]"
              )}
            >
              {label}
              <ArrowUpRight className={cn("w-[18px] h-[18px]", isActive(href) ? "opacity-80" : "opacity-35")} />
            </Link>
          ))}
        </nav>

        {/* Account actions sit at the bottom, within thumb reach */}
        <div className="mt-auto pt-6 border-t border-[var(--color-border)] flex flex-col gap-3">
        {isAuthenticated ? (
          <>
            {(session?.user as any)?.role === "ORGANIZER" || (session?.user as any)?.role === "SUPER_ADMIN" ? (
              <Link href="/admin" onClick={closeMenu} className="text-[17px] font-bold text-[var(--color-lime)] hover:text-[var(--color-text-main)]">
                Admin Panel
              </Link>
            ) : (
              <Link href="/dashboard" onClick={closeMenu} className="text-[17px] font-bold text-[var(--color-lime)] hover:text-[var(--color-text-main)]">
                Dashboard
              </Link>
            )}
            <div className="flex items-center gap-3 px-3 py-2 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] w-fit">
              {avatar ? (
                <img src={avatar} alt={name} className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[var(--color-lime)] to-[var(--color-coral)] flex items-center justify-center text-black font-bold text-[12px]">
                  {initial}
                </div>
              )}
              <span className="text-[14px] font-medium text-[var(--color-text-main)]">{name}</span>
            </div>
            <button 
              onClick={() => { closeMenu(); handleLogout(); }}
              className="w-full flex items-center justify-center gap-2 px-[28px] py-[15px] rounded-full font-semibold text-[15px] bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text-main)] transition-all duration-350 cursor-pointer"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/signup"
              onClick={closeMenu}
              className="w-full flex items-center justify-center gap-2 px-[28px] py-[15px] rounded-full font-bold text-[15px] font-archivo bg-[var(--color-lime)] text-[#0B0B08] shadow-[4px_4px_0_var(--color-coral)] transition-all duration-350 ease-[var(--ease-custom)] whitespace-nowrap text-center"
            >
              Sign up free
            </Link>
            <Link
              href="/login"
              onClick={closeMenu}
              className="w-full flex items-center justify-center px-[28px] py-[14px] rounded-full font-semibold text-[15px] bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text-main)]"
            >
              Log in
            </Link>
          </>
        )}
        </div>
      </div>
    </>
  );
}
