import Link from "next/link";
import { 
  Calendar, 
  Users, 
  CreditCard, 
  PlusCircle, 
  ChevronRight,
  Clock,
  Inbox
} from "lucide-react";
import { ChartsSection } from "@/components/admin/ChartsSection";
import { getOrganizerProfile, getAdminDashboardStats, getAdminAnalytics } from "@/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  let profile = {
    name: "Organizer",
    college: "your College"
  };

  try {
    profile = await getOrganizerProfile();
  } catch (e) {
    // Fallback if not logged in or during static builds
  }

  // Fetch metrics dynamically from the database
  const dashboardStats = await getAdminDashboardStats();
  const analyticsData = await getAdminAnalytics();

  const { quickStats, recentRegistrations, recentPayments } = dashboardStats;

  return (
    <div className="space-y-8 font-archivo text-white">
      {/* 1. Header / Welcome Banner */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#121212] via-[#0E0E0E] to-[#121212] p-6 md:p-8 relative overflow-hidden group shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-lime)]/5 rounded-full filter blur-[80px] pointer-events-none group-hover:bg-[var(--color-lime)]/10 transition-all duration-700"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[12px] font-bold text-[var(--color-lime)] bg-[var(--color-lime)]/10 border border-[var(--color-lime)]/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Official Organizer
              </span>
            </div>
            <h1 className="text-[32px] md:text-[40px] font-anton text-white tracking-tight uppercase leading-none">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">{profile.name}</span>
            </h1>
            <p className="text-[14px] text-white/50 mt-2 max-w-xl leading-relaxed">
              Manage schedules, coordinate student leads, and monitor payments for <span className="text-white font-semibold">{profile.college || "your College"}</span>.
            </p>
          </div>

          <Link
            href="/admin/events/create"
            className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[var(--color-lime)] hover:bg-[var(--color-lime)]/90 text-[#0b0b0b] font-bold text-[15px] shadow-[0_4px_20px_rgba(215,255,61,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-5 h-5" />
            Create Event
          </Link>
        </div>
      </div>

      {/* 2. Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Events */}
        <div className="rounded-xl border border-white/5 bg-[#121212]/50 p-5 backdrop-blur-md relative overflow-hidden group hover:border-white/10 transition-all">
          <div className="flex justify-between items-center text-white/40 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Events</span>
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-anton text-white">{quickStats.totalEvents}</span>
          </div>
          <span className="text-[10px] text-white/30 block mt-1">Across all categories</span>
        </div>

        {/* Total Registrations */}
        <div className="rounded-xl border border-white/5 bg-[#121212]/50 p-5 backdrop-blur-md relative overflow-hidden group hover:border-white/10 transition-all">
          <div className="flex justify-between items-center text-white/40 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Signups</span>
            <Users className="w-4 h-4 text-[var(--color-cobalt)]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-anton text-white">{quickStats.totalRegistrations}</span>
          </div>
          <span className="text-[10px] text-white/30 block mt-1">Verified registrations</span>
        </div>

        {/* Revenue */}
        <div className="rounded-xl border border-white/5 bg-[#121212]/50 p-5 backdrop-blur-md relative overflow-hidden group hover:border-white/10 transition-all">
          <div className="flex justify-between items-center text-white/40 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Revenue</span>
            <CreditCard className="w-4 h-4 text-[var(--color-lime)]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-anton text-white">₹{quickStats.revenue.toLocaleString()}</span>
          </div>
          <span className="text-[10px] text-white/30 block mt-1">Net ticket sales</span>
        </div>

        {/* Pending Check-ins */}
        <div className="rounded-xl border border-white/5 bg-[#121212]/50 p-5 backdrop-blur-md relative overflow-hidden group hover:border-white/10 transition-all">
          <div className="flex justify-between items-center text-white/40 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Checks</span>
            <Clock className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-anton text-white">{quickStats.pendingCheckIns}</span>
          </div>
          <span className="text-[10px] text-white/30 block mt-1">Awaiting scanner check-in</span>
        </div>
      </div>

      {/* 3. Graphical Analytics Section */}
      <ChartsSection data={analyticsData} />

      {/* 4. Dashboard Feeds & Task Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations Log */}
        <div className="rounded-xl border border-white/10 bg-[#121212]/40 backdrop-blur-md p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[15px] font-bold uppercase tracking-wider">Recent Registrations</h3>
              <Link href="/admin/participants" className="text-[12px] text-[var(--color-lime)] font-bold hover:underline flex items-center gap-0.5">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            {recentRegistrations.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center text-white/30 space-y-3">
                <Inbox className="w-10 h-10 text-white/20" />
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider">No registrations yet</p>
                  <p className="text-xs text-white/20 mt-0.5">Create your first event to start accepting registrations.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recentRegistrations.map((reg: any) => (
                  <div key={reg.id} className="flex justify-between items-start pb-4 border-b border-white/5 last:border-0 last:pb-0">
                    <div>
                      <h4 className="text-[13px] font-bold text-white leading-tight">{reg.participantName}</h4>
                      <p className="text-[11px] text-white/40 mt-1 truncate max-w-[200px]">{reg.college}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-semibold text-[var(--color-lime)] bg-[var(--color-lime)]/5 px-2 py-0.5 rounded-lg border border-[var(--color-lime)]/10 truncate max-w-[120px] inline-block">
                        {reg.eventName.split(" ")[0]}...
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Payments Log */}
        <div className="rounded-xl border border-white/10 bg-[#121212]/40 backdrop-blur-md p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[15px] font-bold uppercase tracking-wider">Recent Revenue</h3>
              <Link href="/admin/payments" className="text-[12px] text-[var(--color-lime)] font-bold hover:underline flex items-center gap-0.5">
                Transactions <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {recentPayments.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center text-white/30 space-y-3">
                <CreditCard className="w-10 h-10 text-white/20" />
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider">No payments yet</p>
                  <p className="text-xs text-white/20 mt-0.5">All current events are free. Revenue is ₹0.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPayments.map((pay: any) => (
                  <div key={pay.id} className="flex justify-between items-center pb-4 border-b border-white/5 last:border-0 last:pb-0">
                    <div>
                      <h4 className="text-[13px] font-bold text-white leading-tight">{pay.participantName}</h4>
                      <p className="text-[10px] text-white/40 mt-1">{pay.eventName.substring(0, 18)}...</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-bold text-white">₹{pay.amount}</p>
                      <span className={`text-[9px] font-bold rounded px-1.5 py-0.5 mt-1 inline-block ${
                        pay.status === "SUCCESS" ? "bg-green-500/10 text-green-400" : "bg-orange-500/10 text-orange-400"
                      }`}>
                        {pay.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
