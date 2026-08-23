"use client";

import { useState, useTransition } from "react";
import { 
  CheckSquare, Search, Download, Filter, UserCheck, Clock, 
  Users, CheckCircle2, XCircle, RefreshCw 
} from "lucide-react";
import { getAdminAttendanceAction, toggleParticipantAttendance } from "@/actions/admin";
import { format } from "date-fns";
import { toast } from "sonner";

interface AttendanceClientProps {
  initialData: {
    registrations: any[];
    stats: {
      totalCount: number;
      checkedInCount: number;
      pendingCount: number;
      percentage: number;
    };
    events: { id: string; title: string }[];
  };
}

export function AttendanceClient({ initialData }: AttendanceClientProps) {
  const [data, setData] = useState(initialData);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "CHECKED_IN" | "PENDING">("ALL");
  const [isPending, startTransition] = useTransition();

  const handleFilter = (eventId?: string, searchQuery?: string, status?: "ALL" | "CHECKED_IN" | "PENDING") => {
    const eId = eventId !== undefined ? eventId : selectedEventId;
    const q = searchQuery !== undefined ? searchQuery : search;
    const s = status !== undefined ? status : statusFilter;

    startTransition(async () => {
      const res = await getAdminAttendanceAction({
        eventId: eId || undefined,
        search: q || undefined,
        status: s,
      });
      setData(res);
    });
  };

  const handleToggleCheckIn = async (registrationId: string) => {
    try {
      const res = await toggleParticipantAttendance(registrationId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Attendance status updated!");
        handleFilter();
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update attendance");
    }
  };

  const handleExportCSV = () => {
    if (data.registrations.length === 0) {
      toast.error("No records to export.");
      return;
    }
    const headers = ["Ticket Number", "Student Name", "Email", "College", "Branch", "Year", "Phone", "Event", "Check-In Status", "Check-In Time", "Method"];
    const rows = data.registrations.map(r => [
      `"${r.ticketNumber}"`,
      `"${r.participantName}"`,
      `"${r.email}"`,
      `"${r.college}"`,
      `"${r.branch}"`,
      `"${r.academicYear}"`,
      `"${r.phone}"`,
      `"${r.eventName}"`,
      r.checkedIn ? "CHECKED_IN" : "PENDING",
      r.checkedInAt ? `"${new Date(r.checkedInAt).toLocaleString()}"` : "N/A",
      `"${r.checkInMethod}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance_report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Attendance CSV report downloaded!");
  };

  return (
    <div className="space-y-6 font-archivo">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-anton uppercase tracking-wider text-white flex items-center gap-3">
            <CheckSquare className="w-7 h-7 text-[var(--color-lime)]" />
            Attendance Tracker
          </h1>
          <p className="text-[13px] text-white/40 mt-1">
            Real-time event check-in compliance logs, participant search, and attendance metrics.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-[13px] flex items-center gap-2 cursor-pointer transition-all self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-[var(--color-lime)]" /> Export Attendance CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#121212]/50 p-5">
          <div className="flex justify-between items-center text-white/40 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Registrations</span>
            <Users className="w-4 h-4 text-white/60" />
          </div>
          <span className="text-[28px] font-anton text-white">{data.stats.totalCount}</span>
        </div>

        <div className="rounded-2xl border border border-emerald-500/20 bg-emerald-500/5 p-5">
          <div className="flex justify-between items-center text-emerald-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Checked In</span>
            <UserCheck className="w-4 h-4" />
          </div>
          <span className="text-[28px] font-anton text-emerald-400">{data.stats.checkedInCount}</span>
        </div>

        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
          <div className="flex justify-between items-center text-orange-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Check-In</span>
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-[28px] font-anton text-orange-400">{data.stats.pendingCount}</span>
        </div>

        <div className="rounded-2xl border border-[var(--color-lime)]/20 bg-[var(--color-lime)]/5 p-5">
          <div className="flex justify-between items-center text-[var(--color-lime)] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Turnout Rate</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-[28px] font-anton text-[var(--color-lime)]">{data.stats.percentage}%</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-4 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search student, email, college or ticket..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleFilter(undefined, e.target.value, undefined);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181818] border border-white/10 text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-lime)]/50 transition-colors"
          />
        </div>

        {/* Event Select */}
        <div className="w-full md:w-64">
          <select
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              handleFilter(e.target.value, undefined, undefined);
            }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-white/10 text-[13px] text-white focus:outline-none focus:border-[var(--color-lime)]/50 cursor-pointer"
          >
            <option value="">All Events</option>
            {data.events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter Pills */}
        <div className="flex gap-1.5 p-1 bg-[#181818] rounded-xl border border-white/5">
          {(["ALL", "CHECKED_IN", "PENDING"] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                handleFilter(undefined, undefined, st);
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase cursor-pointer transition-all ${
                statusFilter === st
                  ? "bg-[var(--color-lime)] text-black"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {st === "ALL" ? "All" : st === "CHECKED_IN" ? "Checked In" : "Pending"}
            </button>
          ))}
        </div>
      </div>

      {/* Attendance List Table */}
      <div className="rounded-2xl border border-white/10 bg-[#121212]/40 overflow-hidden">
        {data.registrations.length === 0 ? (
          <div className="py-16 text-center text-white/30 space-y-3">
            <Users className="w-10 h-10 mx-auto text-white/20" />
            <p className="text-sm font-bold uppercase tracking-wider">No matching attendance records</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-wider text-white/50">
                  <th className="py-3.5 px-4">Participant</th>
                  <th className="py-3.5 px-4">Event</th>
                  <th className="py-3.5 px-4">Ticket Number</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Check-In Details</th>
                  <th className="py-3.5 px-4 text-right">Toggle Check-In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[13px]">
                {data.registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white leading-tight">{reg.participantName}</p>
                      <p className="text-[11px] text-white/40 mt-0.5">{reg.email}</p>
                      <p className="text-[10.5px] text-white/30">{reg.college} ({reg.branch})</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-white/90">{reg.eventName}</p>
                      {reg.teamName && (
                        <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/50">
                          Team: {reg.teamName}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[12px] text-[var(--color-lime)]">
                      {reg.ticketNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      {reg.checkedIn ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-bold">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[11.5px] text-white/50">
                      {reg.checkedIn ? (
                        <div>
                          <p className="text-white/80">
                            {format(new Date(reg.checkedInAt), "MMM dd, hh:mm a")}
                          </p>
                          <p className="text-[10px] text-white/30">
                            Method: {reg.checkInMethod}
                          </p>
                        </div>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleCheckIn(reg.id)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all border ${
                          reg.checkedIn
                            ? "border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400"
                            : "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {reg.checkedIn ? "Undo Check-In" : "Mark Checked In"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
