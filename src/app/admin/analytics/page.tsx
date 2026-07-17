"use client";

import { useState, useEffect, useTransition } from "react";
import { 
  Users, 
  Activity,
  TrendingUp,
  Loader2,
  Inbox
} from "lucide-react";
import { getAdminAnalytics, getAdminDashboardStats } from "@/actions/admin";
import { ChartsSection } from "@/components/admin/ChartsSection";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const analyticRes = await getAdminAnalytics();
      const statsRes = await getAdminDashboardStats();
      setAnalytics(analyticRes);
      setStats(statsRes.quickStats);
    });
  }, []);

  const totalRegs = stats?.totalRegistrations || 0;
  const pendingCheckins = stats?.pendingCheckIns || 0;
  const checkedInCount = totalRegs - pendingCheckins;
  const attendanceRate = totalRegs > 0 ? Math.round((checkedInCount / totalRegs) * 100) : 0;

  return (
    <div className="space-y-8 font-archivo text-white">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-anton uppercase tracking-wider text-white">Platform Analytics</h1>
        <p className="text-[13px] text-white/40">Monitor signups growth, category distributions, and check-in attendance rates.</p>
      </div>

      {isPending || !analytics || !stats ? (
        <div className="py-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-lime)]" />
        </div>
      ) : (
        <>
          {/* Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-white/5 bg-[#121212]/50 p-5 backdrop-blur-md relative overflow-hidden group">
              <div className="flex justify-between items-center text-white/40 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Signups</span>
                <Users className="w-4 h-4 text-[var(--color-cobalt)]" />
              </div>
              <span className="text-[28px] font-anton text-white">{totalRegs}</span>
              <p className="text-[10px] text-white/30 block mt-1">Across all active fests</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#121212]/50 p-5 backdrop-blur-md relative overflow-hidden group">
              <div className="flex justify-between items-center text-white/40 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider">Attendance Rate</span>
                <Activity className="w-4 h-4 text-[var(--color-lime)]" />
              </div>
              <span className="text-[28px] font-anton text-white">{attendanceRate}%</span>
              <p className="text-[10px] text-white/30 block mt-1">Checked-in ticket ratio</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#121212]/50 p-5 backdrop-blur-md relative overflow-hidden group">
              <div className="flex justify-between items-center text-white/40 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider">Conversion rate</span>
                <TrendingUp className="w-4 h-4 text-orange-400" />
              </div>
              <span className="text-[28px] font-anton text-white">{totalRegs > 0 ? "100%" : "0%"}</span>
              <p className="text-[10px] text-white/30 block mt-1">Free event signup ratio</p>
            </div>
          </div>

          {/* Charts container rendering line graph & donut breakdown */}
          <ChartsSection data={analytics} />

          {/* Top Events list details */}
          <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-6 backdrop-blur-xl">
            <h3 className="text-[16px] font-anton uppercase text-white tracking-wider mb-4">Top Events Breakdown</h3>
            {analytics.topEvents.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center text-white/30 space-y-2">
                <Inbox className="w-8 h-8 text-white/20" />
                <p className="text-xs font-bold uppercase tracking-wider">No events database logs available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.topEvents.map((evt: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center pb-4 border-b border-white/5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-white/40">#{idx + 1}</span>
                      <span className="text-sm font-semibold text-white">{evt.name}</span>
                    </div>
                    <span className="text-sm font-bold text-[var(--color-lime)]">{evt.value} Registrations</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
