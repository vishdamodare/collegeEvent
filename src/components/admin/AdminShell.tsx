"use client";

import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { cn } from "@/utils/cn";

interface AdminShellProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  children: React.ReactNode;
}

export function AdminShell({ user, children }: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text-main">
      {/* Sidebar navigation */}
      <AdminSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main panel layout */}
      <div
        className={cn(
          "min-h-screen flex flex-col transition-all duration-350 ease-[var(--ease-custom)]",
          collapsed ? "lg:pl-[80px]" : "lg:pl-[260px]"
        )}
      >
        {/* Sticky top navigation header */}
        <AdminHeader user={user} onOpenMobile={() => setMobileOpen(true)} />

        {/* Content area */}
        <main className="flex-1 p-5 lg:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
