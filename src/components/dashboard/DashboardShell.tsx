"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  LayoutDashboard,
  User,
  Bookmark,
  Calendar,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Saved Events", href: "/dashboard/saved", icon: Bookmark },
  { label: "My Events", href: "/dashboard/events", icon: Calendar },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface DashboardShellProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background text-text-main">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-50 h-16 bg-bg-elevated/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4">
        <button onClick={() => setMobileOpen(true)} className="p-2 text-text-faint hover:text-text-main transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/" className="font-[family-name:var(--font-archivo)] font-bold text-lg text-lime">
          CollegeEvents
        </Link>
        <div className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-sm font-semibold text-text-main">
          {user.name.charAt(0)}
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-bg-elevated z-50 border-r border-border p-5 flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <Link href="/" className="font-[family-name:var(--font-archivo)] font-bold text-lg text-lime">
                  CollegeEvents
                </Link>
                <button onClick={() => setMobileOpen(false)} className="p-1 text-text-faint">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarNav pathname={pathname} onItemClick={() => setMobileOpen(false)} />
              <div className="mt-auto pt-4 border-t border-border">
                <UserInfo user={user} onLogout={handleLogout} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-[260px] bg-bg-elevated border-r border-border flex-col p-5 z-40">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 text-sm text-text-faint hover:text-lime transition-colors mb-4">
            <ChevronLeft className="w-4 h-4" />
            Back to site
          </Link>
          <Link href="/" className="font-[family-name:var(--font-archivo)] font-bold text-xl text-lime">
            CollegeEvents
          </Link>
        </div>
        <SidebarNav pathname={pathname} />
        <div className="mt-auto pt-4 border-t border-border">
          <UserInfo user={user} onLogout={handleLogout} />
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-[260px] pt-16 lg:pt-0 min-h-screen">
        <div className="max-w-5xl mx-auto p-6 lg:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarNav({ pathname, onItemClick }: { pathname: string; onItemClick?: () => void }) {
  return (
    <nav className="space-y-1 flex-1">
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? "bg-lime/10 text-lime"
                : "text-text-faint hover:text-text-main hover:bg-card"
            }`}
          >
            <item.icon className="w-4.5 h-4.5" />
            {item.label}
            {item.label === "Notifications" && (
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-card text-text-faint">
                Soon
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function UserInfo({ user, onLogout }: { user: { name: string; email: string }; onLogout: () => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-lime/15 border border-lime/20 flex items-center justify-center text-sm font-bold text-lime">
          {user.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-main truncate">{user.name}</p>
          <p className="text-xs text-text-faint truncate">{user.email}</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-text-faint hover:text-red-400 hover:bg-red-500/10 transition-all"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </div>
  );
}
