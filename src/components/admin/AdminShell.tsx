"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AdminShellProps {
  children: React.ReactNode;
  profile: {
    name: string;
    email: string;
    college: string;
    department: string;
    position: string;
  };
}

export function AdminShell({ children, profile }: AdminShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // The organizer console is dark-only. Force it so the public site's saved light theme
  // doesn't leak in (it turns accent text dark-red on the dark background), then restore on exit.
  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute("data-theme", "dark");
    return () => {
      let saved = "dark";
      try {
        saved = localStorage.getItem("theme") || "dark";
      } catch {}
      el.setAttribute("data-theme", saved);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* Permanent Left Navigation Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Panel Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 transition-all duration-300">
        <Topbar profile={profile} onToggleSidebar={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
