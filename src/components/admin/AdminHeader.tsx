"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, Search, Bell, User } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { cn } from "@/utils/cn";

interface AdminHeaderProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  onOpenMobile: () => void;
}

export function AdminHeader({ user, onOpenMobile }: AdminHeaderProps) {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === segments.length - 1;

    return { href, label, isLast };
  });

  return (
    <header className="sticky top-0 right-0 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 lg:px-6">
      {/* Left side: mobile toggle & breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-lg border border-border hover:bg-card-hover text-text-faint hover:text-text-main transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav className="hidden sm:flex items-center gap-1.5 text-sm font-medium">
          {breadcrumbs.map((crumb, idx) => (
            <div key={crumb.href} className="flex items-center gap-1.5">
              {idx > 0 && <span className="text-text-faint">/</span>}
              {crumb.isLast ? (
                <span className="text-text-main font-semibold">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="text-text-faint hover:text-text-muted transition-colors">
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Right side: search, notify, theme toggle, user avatar */}
      <div className="flex items-center gap-3">
        {/* Global Search placeholder */}
        <div className="relative hidden md:block w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
          <input
            type="text"
            placeholder="Search console..."
            disabled
            className="w-full pl-9 pr-3 py-1.5 bg-card border border-border rounded-lg text-xs text-text-main placeholder:text-text-faint focus:outline-none opacity-50 cursor-not-allowed"
          />
        </div>

        {/* Notifications placeholder */}
        <button
          disabled
          className="p-2 rounded-lg border border-border bg-card text-text-faint hover:text-text-main transition-colors opacity-50 cursor-not-allowed"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User profile avatar dropdown wrapper */}
        <Link
          href="/admin/profile"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-card-hover hover:border-border-bright transition-all"
        >
          <div className="w-6 h-6 rounded-full bg-lime/20 border border-lime/30 flex items-center justify-center text-xs font-bold text-lime shrink-0 overflow-hidden">
            {user.image ? (
              <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <span className="hidden sm:inline text-xs font-semibold text-text-muted">{user.name.split(" ")[0]}</span>
        </Link>
      </div>
    </header>
  );
}
