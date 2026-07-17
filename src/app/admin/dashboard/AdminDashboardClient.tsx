"use client";

import Link from "next/link";
import {
  Calendar,
  Users,
  CreditCard,
  Clock,
  Plus,
  ChevronRight,
  Inbox,
} from "lucide-react";

interface AdminDashboardClientProps {
  initialData: {
    quickStats: {
      totalEvents: number;
      totalRegistrations: number;
      revenue: number;
      certificates: number;
      pendingCheckIns: number;
    };
    recentRegistrations: Array<{
      id: string;
      participantName: string;
      college: string;
      eventName: string;
    }>;
    recentPayments: any[];
    pendingTasks: any[];
  };
}

export function AdminDashboardClient({ initialData }: AdminDashboardClientProps) {
  const { quickStats, recentRegistrations } = initialData;

  const kpis = [
    { label: "Total Events", value: quickStats.totalEvents, icon: Calendar },
    { label: "Total Signups", value: quickStats.totalRegistrations, icon: Users },
    { label: "Revenue", value: `₹${quickStats.revenue.toLocaleString()}`, icon: CreditCard },
    { label: "Pending Check-ins", value: quickStats.pendingCheckIns, icon: Clock },
  ];

  return (
    <div className="space-y-8 font-archivo text-white">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-white/5 bg-[#121212]/50 p-5 backdrop-blur-md hover:border-white/10 transition-all"
          >
            <div className="flex justify-between items-center text-white/40 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider">{kpi.label}</span>
              <kpi.icon className="w-4 h-4" />
            </div>
            <p className="text-[28px] font-anton text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/events/create"
          className="flex items-center gap-3 p-5 rounded-2xl border border-white/5 bg-[#121212]/40 hover:border-[var(--color-lime)]/30 hover:bg-[var(--color-lime)]/5 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--color-lime)]/10 border border-[var(--color-lime)]/20 flex items-center justify-center">
            <Plus className="w-5 h-5 text-[var(--color-lime)]" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-white">Create New Event</p>
            <p className="text-[12px] text-white/40">Draft and launch event registrations</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/20 ml-auto group-hover:text-white/60 transition-colors" />
        </Link>

        <Link
          href="/admin/participants"
          className="flex items-center gap-3 p-5 rounded-2xl border border-white/5 bg-[#121212]/40 hover:border-white/10 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-white/50" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-white">Manage Participants</p>
            <p className="text-[12px] text-white/40">View check-in and registration logs</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/20 ml-auto group-hover:text-white/60 transition-colors" />
        </Link>
      </div>

      {/* Recent Registrations */}
      <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-[15px] font-bold uppercase tracking-wider">Recent Registrations</h3>
          <Link
            href="/admin/participants"
            className="text-[12px] text-[var(--color-lime)] font-bold hover:underline flex items-center gap-0.5"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentRegistrations.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-center text-white/30 space-y-3">
            <Inbox className="w-8 h-8 text-white/20" />
            <div>
              <p className="text-sm font-bold uppercase tracking-wider">No registrations yet</p>
              <p className="text-xs text-white/20 mt-0.5">
                Create your first event to start accepting registrations.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {recentRegistrations.map((reg) => (
              <div
                key={reg.id}
                className="flex justify-between items-start pb-4 border-b border-white/5 last:border-0 last:pb-0"
              >
                <div>
                  <h4 className="text-[13px] font-bold text-white leading-tight">
                    {reg.participantName}
                  </h4>
                  <p className="text-[11px] text-white/40 mt-1 truncate max-w-[200px]">
                    {reg.college}
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-[var(--color-lime)] bg-[var(--color-lime)]/5 px-2 py-0.5 rounded-lg border border-[var(--color-lime)]/10 truncate max-w-[120px] inline-block">
                  {reg.eventName.split(" ").slice(0, 2).join(" ")}…
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
