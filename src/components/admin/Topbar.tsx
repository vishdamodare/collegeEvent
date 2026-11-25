"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus, ScanLine } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

// Page name for the bar; deeper routes fall back to their section
const TITLES: [string, string][] = [
  ["/admin/events/create", "New event"],
  ["/admin/events", "Events"],
  ["/admin/check-in", "Check-in"],
  ["/admin/participants", "Participants"],
  ["/admin/certificates", "Certificates"],
  ["/admin/settings", "Settings"],
  ["/admin/college", "College profile"],
  ["/admin/support", "Help"],
  ["/admin/analytics", "Analytics"],
  ["/admin/notifications", "Notifications"],
  ["/admin/profile", "Your profile"],
];

export function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const pathname = usePathname();
  const title = pathname === "/admin" ? "Home" : (TITLES.find(([p]) => pathname.startsWith(p))?.[1] ?? "Organizer");
  const onCheckIn = pathname.startsWith("/admin/check-in");
  const onCreate = pathname.startsWith("/admin/events/create");

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 sm:px-6 lg:px-8 bg-[var(--desk)]/90 backdrop-blur border-b border-[var(--desk-line)]">
      <button onClick={onToggleSidebar} aria-label="Open menu" className="lg:hidden p-2 -ml-2 rounded-lg text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--desk-raised)] cursor-pointer">
        <Menu className="w-5 h-5" />
      </button>
      <p className="text-[15px] font-semibold text-[var(--ink)] truncate">{title}</p>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        {!onCheckIn && (
          <Link
            href="/admin/check-in"
            className="inline-flex items-center gap-2 h-9 px-3 sm:px-3.5 rounded-lg border border-[var(--desk-line-strong)] text-[13.5px] font-semibold text-[var(--ink)] hover:bg-[var(--desk-raised)] transition-colors active:scale-[0.97]"
          >
            <ScanLine className="w-4 h-4" />
            <span className="hidden sm:inline">Check-in</span>
          </Link>
        )}
        {!onCreate && (
          <Link
            href="/admin/events/create"
            aria-label="New event"
            className="inline-flex items-center gap-1.5 h-9 px-3 sm:px-3.5 rounded-lg bg-[var(--color-lime)] text-white text-[13.5px] font-semibold hover:opacity-90 transition-opacity active:scale-[0.97]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden min-[400px]:inline">New event</span>
          </Link>
        )}
      </div>
    </header>
  );
}
