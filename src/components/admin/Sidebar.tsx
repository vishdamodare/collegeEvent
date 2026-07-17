"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { 
  LayoutDashboard, 
  CalendarRange, 
  Users, 
  CreditCard, 
  Award, 
  BarChart3, 
  School, 
  Bell, 
  Settings, 
  HelpCircle, 
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  QrCode
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { SIDEBAR_ITEMS } from "@/data/admin";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getIcon = (name: string) => {
    switch (name) {
      case "LayoutDashboard": return <LayoutDashboard className="w-5 h-5" />;
      case "CalendarRange": return <CalendarRange className="w-5 h-5" />;
      case "Users": return <Users className="w-5 h-5" />;
      case "CreditCard": return <CreditCard className="w-5 h-5" />;
      case "Award": return <Award className="w-5 h-5" />;
      case "BarChart3": return <BarChart3 className="w-5 h-5" />;
      case "School": return <School className="w-5 h-5" />;
      case "Bell": return <Bell className="w-5 h-5" />;
      case "Settings": return <Settings className="w-5 h-5" />;
      case "QrCode": return <QrCode className="w-5 h-5" />;
      case "HelpCircle": return <HelpCircle className="w-5 h-5" />;
      default: return <HelpCircle className="w-5 h-5" />;
    }
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0E0E0E]/90 border-r border-white/10 backdrop-blur-md transition-all duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "w-20" : "w-64"}
        `}
      >
        {/* Brand Logo & Toggle */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[var(--color-lime)] text-[#0B0B08] flex items-center justify-center font-black text-lg shadow-[0_0_15px_rgba(215,255,61,0.4)]">
              C
            </span>
            {!isCollapsed && (
              <span className="font-anton text-lg tracking-wider text-white">
                COLLEGE<span className="text-[var(--color-lime)]">EVENTS</span>
              </span>
            )}
          </Link>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto scrollbar-thin">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 py-3 px-3.5 rounded-xl font-archivo text-[14px] font-medium transition-all group relative cursor-pointer
                  ${isActive 
                    ? "bg-[var(--color-lime)]/10 text-[var(--color-lime)] border border-[var(--color-lime)]/20 shadow-[inset_0_0_12px_rgba(215,255,61,0.05)]" 
                    : "text-white/60 hover:text-white border border-transparent hover:bg-white/5"
                  }
                `}
              >
                <span className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-[var(--color-lime)]" : "text-white/60 group-hover:text-white"}`}>
                  {getIcon(item.icon)}
                </span>
                
                {!isCollapsed && <span>{item.title}</span>}

                {/* Tooltip for Collapsed Sidebar */}
                {isCollapsed && (
                  <div className="absolute left-24 scale-0 group-hover:scale-100 transition-all bg-[#141414] border border-white/10 text-white text-[12px] font-archivo py-1.5 px-3 rounded-lg pointer-events-none whitespace-nowrap shadow-xl z-50">
                    {item.title}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout Button */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 py-3 px-3.5 rounded-xl font-archivo text-[14px] font-semibold text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer group`}
          >
            <LogOut className="w-5 h-5 text-red-400 transition-transform group-hover:translate-x-0.5" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
