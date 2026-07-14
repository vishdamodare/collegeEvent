"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Tag,
  Users,
  Ticket,
  QrCode,
  CheckSquare,
  BarChart3,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { authClient } from "@/lib/auth-client";

const MENU_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Events", href: "/admin/events", icon: Calendar },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Registrations", href: "/admin/registrations", icon: Users, comingSoon: true },
  { label: "Tickets", href: "/admin/tickets", icon: Ticket, comingSoon: true },
  { label: "Scanner", href: "/admin/scanner", icon: QrCode, comingSoon: true },
  { label: "Attendance", href: "/admin/attendance", icon: CheckSquare, comingSoon: true },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3, comingSoon: true },
  { label: "Profile", href: "/admin/profile", icon: User },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AdminSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-bg-elevated border-r border-border p-4 relative">
      {/* Header logo */}
      <div className={cn("flex items-center mb-8 px-2", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <Link href="/" className="font-[family-name:var(--font-archivo)] font-bold text-lg text-lime">
            AdminPanel
          </Link>
        )}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 rounded-lg border border-border hover:bg-card-hover text-text-faint hover:text-text-main transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.comingSoon ? "#" : item.href}
              onClick={item.comingSoon ? undefined : onCloseMobile}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                isActive
                  ? "bg-lime/10 text-lime"
                  : "text-text-faint hover:text-text-main hover:bg-card",
                item.comingSoon && "opacity-50 cursor-not-allowed pointer-events-none"
              )}
            >
              <item.icon className="w-4.5 h-4.5 shrink-0" />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {item.comingSoon && !collapsed && (
                <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-card-hover text-text-faint scale-90">
                  Soon
                </span>
              )}
              
              {/* Tooltip on hover when collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2 py-1 rounded bg-black border border-border text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                  {item.label} {item.comingSoon ? "(Soon)" : ""}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout bottom */}
      <div className="pt-4 border-t border-border mt-auto">
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-faint hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer group relative",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          {!collapsed && <span>Logout</span>}
          
          {collapsed && (
            <div className="absolute left-full ml-3 px-2 py-1 rounded bg-black border border-border text-xs text-red-400 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 lg:hidden"
            onClick={onCloseMobile}
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer Content */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 w-[280px] z-50 lg:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (Collapsible) */}
      <aside
        className={cn(
          "hidden lg:block fixed top-0 left-0 bottom-0 z-40 transition-all duration-350 ease-[var(--ease-custom)]",
          collapsed ? "w-[80px]" : "w-[260px]"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
