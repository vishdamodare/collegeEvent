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
    <div className="admin-ui min-h-screen font-archivo">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} profile={profile} />
      <div className="lg:pl-60 min-w-0 flex flex-col min-h-screen">
        <Topbar onToggleSidebar={() => setIsSidebarOpen(true)} />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
