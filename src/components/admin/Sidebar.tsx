"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Award, CalendarDays, HelpCircle, Home, LogOut, ScanLine, Settings, ShieldCheck, Users, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";

// Organizers do five things; the nav is those five verbs plus settings. Other admin pages
// (analytics, payments, notifications, support) stay reachable from links where they matter.
const NAV = [
  { href: "/admin", label: "Home", icon: Home },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/check-in", label: "Check-in", icon: ScanLine },
  { href: "/admin/participants", label: "Participants", icon: Users },
  { href: "/admin/certificates", label: "Certificates", icon: Award },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  profile: { name: string; college: string };
}

export function Sidebar({ isOpen, setIsOpen, profile }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const initials = (profile.college || profile.name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.replace("/login"); // hard nav: router.push keeps cached protected pages after logout
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setIsOpen(false)} aria-hidden />}

      <aside
        aria-label="Organizer navigation"
        className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col bg-[var(--desk)] border-r border-[var(--desk-line)] transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5">
          <Link href="/admin" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
            <Image src="/logo-mark.png" alt="" width={28} height={28} className="logo-mark-on-dark w-7 h-7 shrink-0" priority />
            <span className="font-anton text-[17px] font-bold tracking-tight text-[var(--ink)]">
              College<span className="text-[var(--color-lime)]">Events</span>
            </span>
          </Link>
          <button onClick={() => setIsOpen(false)} aria-label="Close menu" className="lg:hidden p-2 -mr-2 rounded-lg text-[var(--ink-3)] hover:text-[var(--ink)] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 pt-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-3 h-10 px-3 rounded-lg text-[14px] transition-colors ${
                  active ? "bg-[var(--desk-raised)] text-[var(--ink)] font-semibold" : "text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--desk-raised)]/60 font-medium"
                }`}
              >
                {active && <span aria-hidden className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-[var(--color-lime)]" />}
                <Icon className={`w-[18px] h-[18px] ${active ? "text-[var(--color-lime)]" : "text-[var(--ink-3)]"}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 space-y-0.5">
          {(session?.user as { role?: string } | undefined)?.role === "SUPER_ADMIN" && (
            <Link href="/superadmin" className="flex items-center gap-3 h-10 px-3 rounded-lg text-[14px] font-medium text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--desk-raised)]">
              <ShieldCheck className="w-[18px] h-[18px] text-[var(--ink-3)]" /> Super admin
            </Link>
          )}
          <Link href="/admin/support" onClick={() => setIsOpen(false)} className="flex items-center gap-3 h-10 px-3 rounded-lg text-[14px] font-medium text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--desk-raised)]">
            <HelpCircle className="w-[18px] h-[18px] text-[var(--ink-3)]" /> Help
          </Link>

          {/* Who you're organizing for */}
          <div className="mt-2 pt-3 border-t border-[var(--desk-line)] flex items-center gap-3 px-2">
            <Link href="/admin/college" onClick={() => setIsOpen(false)} title="College profile" className="w-9 h-9 shrink-0 rounded-lg bg-[var(--desk-raised)] border border-[var(--desk-line)] flex items-center justify-center text-[12px] font-bold text-[var(--ink)]">
              {initials}
            </Link>
            <Link href="/admin/college" onClick={() => setIsOpen(false)} className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[var(--ink)] truncate">{profile.college || "Your college"}</p>
              <p className="text-[12px] text-[var(--ink-3)] truncate">{profile.name}</p>
            </Link>
            <button onClick={handleLogout} aria-label="Log out" title="Log out" className="p-2 rounded-lg text-[var(--ink-3)] hover:text-red-400 hover:bg-red-500/10 cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
