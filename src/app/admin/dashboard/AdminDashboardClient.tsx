"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  Layers,
  FileText,
  Clock,
  UserCheck,
  TrendingUp,
  Plus,
  Compass,
  ArrowUpRight,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface AdminDashboardClientProps {
  initialData: {
    stats: {
      totalEvents: number;
      publishedEvents: number;
      draftEvents: number;
      upcomingEvents: number;
      todayRegistrations: number;
      todayCheckIns: number;
    };
    recentEvents: Array<{
      id: string;
      title: string;
      slug: string;
      date: Date;
      location: string;
      status: string;
      category: { name: string; color: string | null };
      _count: { registrations: number };
    }>;
    activities: Array<{
      id: string;
      title: string;
      type: string;
      timestamp: Date;
    }>;
  };
}

export function AdminDashboardClient({ initialData }: AdminDashboardClientProps) {
  const { stats, recentEvents, activities } = initialData;

  const kpis = [
    { label: "Total Events", value: stats.totalEvents, icon: Calendar, color: "lime" },
    { label: "Published Events", value: stats.publishedEvents, icon: FileText, color: "cobalt" },
    { label: "Draft Events", value: stats.draftEvents, icon: Layers, color: "coral" },
    { label: "Upcoming Events", value: stats.upcomingEvents, icon: Clock, color: "lime" },
    { label: "Today's Sign-ups", value: stats.todayRegistrations, icon: TrendingUp, color: "cobalt" },
    { label: "Check-ins Today", value: stats.todayCheckIns, icon: UserCheck, color: "lime" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-archivo)]">Console</h1>
        <p className="text-text-faint mt-1">Here is a quick snapshot of your organizer desk today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.04 }}
            className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between hover:border-border-bright transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-text-faint uppercase tracking-wider">
                {kpi.label}
              </span>
              <kpi.icon className={`w-4 h-4 text-text-faint`} />
            </div>
            <p className="text-2xl font-bold font-archivo text-text-main mt-1">
              {kpi.value.toLocaleString()}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <QuickActionCard
          title="Create New Event"
          description="Draft, customize details, upload gallery banners, and launch registration fests."
          href="/admin/events/create"
          icon={Plus}
          color="lime"
          actionLabel="Open Creator"
        />
        <QuickActionCard
          title="Manage Categories"
          description="Create inline filters, modify colors, or edit active category grids."
          href="/admin/categories"
          icon={Layers}
          color="cobalt"
          actionLabel="Manage"
        />
        <QuickActionCard
          title="Verify Check-ins"
          description="Open barcode verification scanner and validate tickets (Coming Phase 4)."
          href="/admin/scanner"
          icon={Compass}
          color="coral"
          actionLabel="Scanner"
        />
      </div>

      {/* Main Grid: Events & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming events table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-[family-name:var(--font-archivo)]">
              Recently Listed
            </h2>
            <Link
              href="/admin/events"
              className="text-xs text-text-faint hover:text-lime transition-colors flex items-center gap-1 font-medium"
            >
              See all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentEvents.length > 0 ? (
            <div className="space-y-3">
              {recentEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-border-bright transition-all group"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border"
                        style={{
                          backgroundColor: ev.category.color ? `${ev.category.color}15` : "rgba(255,255,255,.05)",
                          borderColor: ev.category.color ? `${ev.category.color}25` : "rgba(255,255,255,.1)",
                          color: ev.category.color || "#fff",
                        }}
                      >
                        {ev.category.name}
                      </span>
                      <StatusBadge status={ev.status} />
                    </div>
                    <h3 className="font-semibold text-text-main text-sm truncate group-hover:text-lime transition-colors">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-text-faint mt-1">
                      {format(new Date(ev.date), "MMM d, yyyy")} · {ev.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-text-faint hidden sm:block">
                      {ev._count.registrations} sign-ups
                    </span>
                    <Link
                      href={`/admin/events/${ev.id}`}
                      className="p-1.5 rounded-lg border border-border bg-card-hover hover:border-border-bright text-text-muted hover:text-text-main transition-colors text-xs font-semibold"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-12 text-center text-text-faint">
              <Calendar className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No events listed yet</p>
              <Link href="/admin/events/create" className="text-sm text-lime hover:underline mt-1 inline-block">
                Create first event →
              </Link>
            </div>
          )}
        </div>

        {/* Recent logs */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-[family-name:var(--font-archivo)]">
            Activity Stream
          </h2>

          <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            {activities.length > 0 ? (
              <div className="space-y-4 relative pl-3 border-l border-border">
                {activities.map((act) => (
                  <div key={act.id} className="relative space-y-1">
                    {/* Tiny bullet */}
                    <div className="absolute -left-[16.5px] top-1 w-2 h-2 rounded-full bg-lime border border-background shadow-[0_0_8px_rgba(215,255,61,0.5)]" />
                    <p className="text-xs font-medium text-text-main line-clamp-2">
                      Event <span className="text-lime">{act.title}</span> status changed to{" "}
                      <span className="text-text-muted uppercase text-[10px] tracking-wider font-bold">
                        {act.type}
                      </span>
                    </p>
                    <p className="text-[10px] text-text-faint">
                      {format(new Date(act.timestamp), "MMM d, h:mm a")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-faint text-xs">
                <Clock className="w-6 h-6 mx-auto mb-2 opacity-30" />
                No logs recorded today.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
  color,
  actionLabel,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  actionLabel: string;
}) {
  const colorMap: Record<string, string> = {
    lime: "bg-lime/10 text-lime border-lime/25 group-hover:bg-lime/20",
    cobalt: "bg-cobalt/10 text-cobalt border-cobalt/25 group-hover:bg-cobalt/20",
    coral: "bg-coral/10 text-coral border-coral/25 group-hover:bg-coral/20",
  };

  return (
    <Link
      href={href}
      className="block rounded-2xl border border-border bg-card p-5 hover:border-border-bright hover:shadow-lg transition-all group"
    >
      <div className={`w-9 h-9 rounded-xl ${colorMap[color]} flex items-center justify-center mb-4 border transition-colors`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <h3 className="text-base font-semibold text-text-main mb-1.5 flex items-center gap-1.5 font-[family-name:var(--font-archivo)]">
        {title} <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </h3>
      <p className="text-xs text-text-faint leading-relaxed mb-4">{description}</p>
      <span className="text-xs font-semibold text-lime underline decoration-lime/20 group-hover:decoration-lime transition-all">
        {actionLabel}
      </span>
    </Link>
  );
}
