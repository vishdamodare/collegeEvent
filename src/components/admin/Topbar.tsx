"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Menu, 
  CheckCircle2, 
  PlusCircle, 
  User, 
  Settings, 
  LogOut 
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { MOCK_SETTINGS } from "@/data/admin";

function getCollegeInitials(college: string): string {
  if (!college) return "ORG";
  const cleanName = college
    .replace(/\b(of|and|the|engineering|technology|college|institute|university)\b/gi, "")
    .trim();
  const words = cleanName.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return cleanName.substring(0, 3).toUpperCase();
}

interface TopbarProps {
  onToggleSidebar: () => void;
  profile: {
    name: string;
    email: string;
    college: string;
    department: string;
    position: string;
  };
}

export function Topbar({ onToggleSidebar, profile }: TopbarProps) {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <header className="h-20 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
      {/* Left Area: Mobile Menu Toggle & College Branding */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg border border-white/10 hover:bg-white/5 text-white/80 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Institution Branding */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-cobalt)]/20 border border-[var(--color-cobalt)]/30 flex items-center justify-center font-bold text-white text-[15px] shadow-[0_0_10px_rgba(36,81,255,0.2)]">
            {getCollegeInitials(profile.college)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-archivo text-[14px] font-bold text-white leading-none">
                {profile.college}
              </span>
              <span className="text-[var(--color-lime)] group relative" title="Verified College">
                <CheckCircle2 className="w-3.5 h-3.5 fill-[var(--color-lime)] text-[#0B0B08]" />
              </span>
            </div>
            <span className="font-archivo text-[11px] text-white/40 font-medium">
              {profile.department}
            </span>
          </div>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
        <Search className="w-4 h-4 text-white/40 absolute left-3.5 pointer-events-none" />
        <input 
          type="text" 
          placeholder="Search registrations, events, settings..." 
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#121212] border border-white/5 text-white text-[13px] outline-none placeholder:text-white/30 focus:border-white/20 transition-all font-archivo"
        />
      </div>

      {/* Right Area: Actions, Alerts, User Profile */}
      <div className="flex items-center gap-4">
        {/* Quick Actions Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsActionsOpen(!isActionsOpen)}
            onBlur={() => setTimeout(() => setIsActionsOpen(false), 200)}
            className="hidden lg:flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-[var(--color-lime)] text-[#0B0B08] font-archivo text-[13px] font-bold hover:shadow-[0_0_15px_rgba(215,255,61,0.25)] transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Quick Actions
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          
          {isActionsOpen && (
            <div className="absolute right-0 mt-2.5 w-48 rounded-xl bg-[#141414] border border-white/10 p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <Link 
                href="/admin/events/create" 
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/5 font-archivo text-[13px] transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-[var(--color-lime)]" />
                Create New Event
              </Link>
              <Link 
                href="/admin/participants" 
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/5 font-archivo text-[13px] transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-[var(--color-cobalt)]" />
                Approve Participants
              </Link>
            </div>
          )}
        </div>

        {/* Notifications Icon Link */}
        <Link 
          href="/admin/notifications"
          className="p-2.5 rounded-xl border border-white/5 bg-[#121212] hover:bg-white/5 text-white/60 hover:text-white transition-colors relative cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
        </Link>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            onBlur={() => setTimeout(() => setIsProfileOpen(false), 200)}
            className="flex items-center gap-2.5 p-1 pr-3 rounded-xl border border-white/5 bg-[#121212] hover:bg-white/5 transition-all text-white/60 hover:text-white cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--color-lime)]/10 text-[var(--color-lime)] flex items-center justify-center font-bold text-sm font-archivo">
              {profile.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[12px] font-bold text-white leading-none font-archivo">{profile.name}</p>
              <span className="text-[10px] text-white/40 font-archivo">Organizer</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2.5 w-48 rounded-xl bg-[#141414] border border-white/10 p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <Link 
                href="/admin/profile" 
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/5 font-archivo text-[13px] transition-colors"
              >
                <User className="w-4 h-4" />
                My Profile
              </Link>
              <Link 
                href="/admin/settings" 
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/5 font-archivo text-[13px] transition-colors"
              >
                <Settings className="w-4 h-4" />
                Account Settings
              </Link>
              <div className="h-[1px] bg-white/5 my-1"></div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 font-archivo text-[13px] font-semibold transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
