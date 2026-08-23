"use client";

import { useState, useTransition } from "react";
import {
  Users,
  Search,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  Unlock,
  Mail,
  Phone,
  GraduationCap,
  Ticket,
  Calendar,
  Eye,
  FileSpreadsheet,
  Loader2,
  Inbox,
  UserCheck,
  ChevronDown,
  X,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  getAdminRegistrationsAction,
  toggleEventRegistrationStatusAction,
  toggleParticipantAttendance,
} from "@/actions/admin";
import Link from "next/link";

interface RegistrationsClientProps {
  initialData: {
    registrations: any[];
    stats: {
      totalCount: number;
      confirmedCount: number;
      checkedInCount: number;
      cancelledCount: number;
    };
    events: Array<{
      id: string;
      title: string;
      slug: string;
      capacity: number;
      isClosed: boolean;
      registeredCount: number;
    }>;
  };
}

export function RegistrationsClient({ initialData }: RegistrationsClientProps) {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [isPending, startTransition] = useTransition();
  const [selectedRegistration, setSelectedRegistration] = useState<any | null>(null);

  const selectedEvent = data.events.find((e) => e.id === selectedEventId);

  const handleFilter = (eventId?: string, searchQuery?: string, status?: string) => {
    const eId = eventId !== undefined ? eventId : selectedEventId;
    const q = searchQuery !== undefined ? searchQuery : search;
    const st = status !== undefined ? status : selectedStatus;

    startTransition(async () => {
      const res = await getAdminRegistrationsAction({
        eventId: eId || undefined,
        search: q || undefined,
        status: st !== "ALL" ? st : undefined,
      });
      setData(res);
    });
  };

  const handleToggleEventLock = async () => {
    if (!selectedEvent) {
      toast.error("Please select a specific event first.");
      return;
    }

    const newStatus = !selectedEvent.isClosed;
    const actionLabel = newStatus ? "Closing & freezing" : "Reopening";

    toast.promise(toggleEventRegistrationStatusAction(selectedEvent.id, newStatus), {
      loading: `${actionLabel} event registrations...`,
      success: (res) => {
        if (res.error) throw new Error(res.error);
        setData((prev) => ({
          ...prev,
          events: prev.events.map((e) =>
            e.id === selectedEvent.id ? { ...e, isClosed: newStatus } : e
          ),
          registrations: prev.registrations.map((r) =>
            r.eventId === selectedEvent.id ? { ...r, eventIsClosed: newStatus } : r
          ),
        }));
        return newStatus
          ? "Event registrations closed successfully."
          : "Event registrations opened successfully.";
      },
      error: (err: any) => err.message || "Failed to update registration status.",
    });
  };

  const handleToggleAttendance = (id: string) => {
    startTransition(async () => {
      const res = await toggleParticipantAttendance(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.checkedIn ? "Attendee marked as Present!" : "Check-in removed.");
        // Refresh
        const refreshed = await getAdminRegistrationsAction({
          eventId: selectedEventId || undefined,
          search: search || undefined,
          status: selectedStatus !== "ALL" ? selectedStatus : undefined,
        });
        setData(refreshed);
      }
    });
  };

  const handleExportCSV = () => {
    if (data.registrations.length === 0) {
      toast.error("No registrations available to export.");
      return;
    }

    const headers = [
      "Student Name",
      "Email Address",
      "Phone Number",
      "College Name",
      "Branch",
      "Academic Year",
      "Roll Number",
      "Event Title",
      "Ticket Number",
      "Registration Type",
      "Team Name",
      "Registration Status",
      "Check-in Status",
      "Checked-in Timestamp",
      "Registered Date",
    ];

    const rows = data.registrations.map((r) => [
      `"${r.participantName.replace(/"/g, '""')}"`,
      `"${r.email}"`,
      `"${r.phone}"`,
      `"${r.college.replace(/"/g, '""')}"`,
      `"${r.branch.replace(/"/g, '""')}"`,
      `"${r.academicYear}"`,
      `"${r.rollNumber}"`,
      `"${r.eventName.replace(/"/g, '""')}"`,
      `"${r.ticketNumber}"`,
      `"${r.registrationType}"`,
      `"${(r.teamName || "").replace(/"/g, '""')}"`,
      `"${r.status}"`,
      `"${r.checkedIn ? "PRESENT" : "ABSENT"}"`,
      `"${r.checkedInAt ? new Date(r.checkedInAt).toISOString() : "N/A"}"`,
      `"${new Date(r.registeredAt).toISOString()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const dateStr = format(new Date(), "yyyy-MM-dd");
    link.setAttribute("download", `event-registrations-roster-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Roster exported to CSV successfully!");
  };

  return (
    <div className="space-y-8 font-archivo">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-lime)]/10 border border-[var(--color-lime)]/30 flex items-center justify-center text-[var(--color-lime)]">
              <Users className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-[28px] font-anton uppercase tracking-wider text-white">
              Student Registration Log Tracker
            </h1>
          </div>
          <p className="text-[13px] text-white/40">
            Monitor attendee rosters, audit student registrations, freeze enrollment gates, and export CSV reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 py-2.5 px-4.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-[12.5px] cursor-pointer transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export CSV Roster
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-4.5">
          <div className="flex items-center justify-between text-white/40 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Signups</span>
            <Users className="w-4 h-4 text-[var(--color-lime)]" />
          </div>
          <p className="text-2xl font-anton text-white">{data.stats.totalCount}</p>
          <span className="text-[10.5px] text-white/30 block mt-0.5">Across all monitored events</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-4.5">
          <div className="flex items-center justify-between text-white/40 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Confirmed</span>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-anton text-white">{data.stats.confirmedCount}</p>
          <span className="text-[10.5px] text-green-400/60 block mt-0.5">Valid active passes</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-4.5">
          <div className="flex items-center justify-between text-white/40 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Checked In</span>
            <UserCheck className="w-4 h-4 text-[var(--color-cobalt)]" />
          </div>
          <p className="text-2xl font-anton text-white">{data.stats.checkedInCount}</p>
          <span className="text-[10.5px] text-white/30 block mt-0.5">
            {data.stats.totalCount > 0
              ? `${Math.round((data.stats.checkedInCount / data.stats.totalCount) * 100)}% attendance rate`
              : "0% attendance"}
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-4.5">
          <div className="flex items-center justify-between text-white/40 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cancelled</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-anton text-white">{data.stats.cancelledCount}</p>
          <span className="text-[10.5px] text-red-400/60 block mt-0.5">Voided seats</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-4.5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search by student name, email, roll number, ticket pass or college..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                handleFilter(undefined, e.target.value, undefined);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181818] border border-white/10 text-white text-[13px] outline-none focus:border-[var(--color-lime)]/50 transition-colors placeholder:text-white/20"
            />
          </div>

          {/* Event selector */}
          <div className="w-full lg:w-72">
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                handleFilter(e.target.value, undefined, undefined);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-white/10 text-white text-[13px] outline-none focus:border-[var(--color-lime)]/50 cursor-pointer"
            >
              <option value="">All Managed Events</option>
              {data.events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.registeredCount}/{ev.capacity})
                  {ev.isClosed ? " [CLOSED]" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Status selector */}
          <div className="w-full lg:w-44">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                handleFilter(undefined, undefined, e.target.value);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-white/10 text-white text-[13px] outline-none focus:border-[var(--color-lime)]/50 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Freeze / Lock Registration button (when event selected) */}
          {selectedEvent && (
            <button
              onClick={handleToggleEventLock}
              className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-[12px] uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                selectedEvent.isClosed
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                  : "bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
              }`}
              title={
                selectedEvent.isClosed
                  ? "Reopen public registration for this event"
                  : "Freeze / close public registration for this event"
              }
            >
              {selectedEvent.isClosed ? (
                <>
                  <Unlock className="w-3.5 h-3.5" /> Reopen Registration
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" /> Close Registration
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Roster Table */}
      <div className="rounded-2xl border border-white/10 bg-[#121212]/40 overflow-hidden">
        {isPending ? (
          <div className="py-24 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-lime)]" />
          </div>
        ) : data.registrations.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Inbox className="w-10 h-10 mx-auto text-white/20" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              No Registrations Found
            </h3>
            <p className="text-xs text-white/40 max-w-sm mx-auto">
              No attendee entries match your current search filters or registrations have not started yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-white/40 text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Participant Details</th>
                  <th className="px-6 py-4">Academic Record</th>
                  <th className="px-6 py-4">Event & Pass</th>
                  <th className="px-6 py-4">Type / Team</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[13px] text-white/80">
                {data.registrations.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.015] transition-colors group">
                    {/* Participant Details */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-[14px] leading-snug">
                        {r.participantName}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-white/40 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-white/20" /> {r.email}
                        </span>
                        {r.phone !== "N/A" && (
                          <span className="flex items-center gap-1">
                            <span className="text-white/10">•</span>
                            <Phone className="w-3 h-3 text-white/20" /> {r.phone}
                          </span>
                        )}
                      </div>
                      <div className="text-[10.5px] text-white/30 mt-0.5">
                        Registered: {format(new Date(r.registeredAt), "MMM d, yyyy · h:mm a")}
                      </div>
                    </td>

                    {/* Academic Record */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white/90 text-[12.5px]">{r.college}</div>
                      <div className="text-[11px] text-white/40 mt-0.5">
                        {r.branch} • {r.academicYear}
                      </div>
                      {r.rollNumber !== "N/A" && (
                        <div className="text-[10px] text-white/30 font-mono mt-0.5">
                          ID: {r.rollNumber}
                        </div>
                      )}
                    </td>

                    {/* Event & Pass ID */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white/90 leading-snug">{r.eventName}</div>
                      <div className="text-[11px] font-mono font-bold text-[var(--color-lime)] mt-1 flex items-center gap-1.5">
                        <Ticket className="w-3 h-3" />
                        {r.ticketNumber}
                      </div>
                    </td>

                    {/* Type / Team */}
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-white/70">
                        {r.registrationType}
                      </span>
                      {r.teamName && (
                        <div className="text-[11px] text-white/60 font-semibold mt-1">
                          Team: {r.teamName}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                            r.checkedIn
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : r.status === "CONFIRMED"
                              ? "bg-[var(--color-lime)]/10 text-[var(--color-lime)] border border-[var(--color-lime)]/20"
                              : r.status === "CANCELLED"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-white/5 text-white/40 border border-white/10"
                          }`}
                        >
                          {r.checkedIn
                            ? "Checked In"
                            : r.status === "CONFIRMED"
                            ? "Confirmed"
                            : r.status}
                        </span>
                        {r.checkedInAt && (
                          <div className="text-[10px] text-white/30 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {format(new Date(r.checkedInAt), "h:mm a")}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {r.status !== "CANCELLED" && (
                          <button
                            onClick={() => handleToggleAttendance(r.id)}
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                              r.checkedIn
                                ? "bg-white/5 hover:bg-white/10 text-white/60 border-white/10"
                                : "bg-[var(--color-lime)]/10 hover:bg-[var(--color-lime)]/20 text-[var(--color-lime)] border-[var(--color-lime)]/30"
                            }`}
                          >
                            {r.checkedIn ? "Undo Check-in" : "Check-in"}
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedRegistration(r)}
                          className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                          title="View Full Registration Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Registration Details Modal */}
      {selectedRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#121212] border border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedRegistration(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-lime)]">
                Registration Audit Card
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                {selectedRegistration.participantName}
              </h3>
              <p className="text-xs text-white/40 font-mono mt-0.5">
                Pass ID: {selectedRegistration.ticketNumber}
              </p>
            </div>

            <div className="space-y-4 text-xs font-archivo divide-y divide-white/5">
              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-white/80 uppercase text-[11px]">Event Information</h4>
                <p className="text-white font-semibold">{selectedRegistration.eventName}</p>
                <p className="text-white/40">
                  Date: {format(new Date(selectedRegistration.eventDate), "EEEE, MMMM d, yyyy")}
                </p>
              </div>

              <div className="space-y-2 pt-3">
                <h4 className="font-bold text-white/80 uppercase text-[11px]">Academic Profile</h4>
                <div className="grid grid-cols-2 gap-2 text-white/70">
                  <div>
                    <span className="text-white/30 block text-[10px]">College:</span>
                    {selectedRegistration.college}
                  </div>
                  <div>
                    <span className="text-white/30 block text-[10px]">Branch & Year:</span>
                    {selectedRegistration.branch} ({selectedRegistration.academicYear})
                  </div>
                  <div>
                    <span className="text-white/30 block text-[10px]">Email:</span>
                    {selectedRegistration.email}
                  </div>
                  <div>
                    <span className="text-white/30 block text-[10px]">Phone:</span>
                    {selectedRegistration.phone}
                  </div>
                </div>
              </div>

              {selectedRegistration.teamName && (
                <div className="space-y-2 pt-3">
                  <h4 className="font-bold text-white/80 uppercase text-[11px]">Team Details</h4>
                  <p className="text-white">
                    Team Name: <span className="font-bold">{selectedRegistration.teamName}</span>
                  </p>
                </div>
              )}

              {selectedRegistration.answers &&
                Object.keys(selectedRegistration.answers).length > 0 && (
                  <div className="space-y-2 pt-3">
                    <h4 className="font-bold text-white/80 uppercase text-[11px]">
                      Custom Form Responses
                    </h4>
                    <div className="space-y-1.5 bg-white/5 p-3 rounded-xl">
                      {Object.entries(selectedRegistration.answers).map(([key, val]) => (
                        <div key={key} className="flex justify-between items-center text-xs">
                          <span className="text-white/40 capitalize">{key}:</span>
                          <span className="text-white font-medium">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRegistration(null)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                Close Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
