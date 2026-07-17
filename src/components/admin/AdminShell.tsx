"use client";

import { useState } from "react";
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
