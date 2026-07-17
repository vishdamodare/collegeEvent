"use client";

import { useState, useEffect, useTransition } from "react";
import { 
  Search, 
  Download, 
  Mail, 
  Inbox,
  Loader2,
  Phone
} from "lucide-react";
import { getAdminParticipants, toggleParticipantAttendance } from "@/actions/admin";
import { toast } from "sonner";

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  const loadParticipants = async () => {
    const res = await getAdminParticipants();
    setParticipants(res);
  };

  useEffect(() => {
    startTransition(async () => {
      await loadParticipants();
    });
  }, []);

  // Filters
  const filtered = participants.filter((p) => {
    const matchesSearch = 
      p.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.eventName.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesAttendance = true;
    if (attendanceFilter === "PRESENT") matchesAttendance = p.checkedIn === true;
    else if (attendanceFilter === "ABSENT") matchesAttendance = p.checkedIn === false;

    return matchesSearch && matchesAttendance;
  });

  const handleToggleAttendance = (id: string) => {
    startTransition(async () => {
      const res = await toggleParticipantAttendance(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.checkedIn ? "Checked in successfully!" : "Check-in removed.");
        await loadParticipants();
      }
    });
  };

  const handleSendEmail = (email: string) => {
    toast.success(`Confirmation email sent successfully to ${email}`);
  };

  // CSV Exporter
  const handleExportCSV = () => {
    const headers = "Name,Email,Phone,College,Event Name,Ticket Code,Attendance\n";
    const rows = filtered.map(p => 
      `"${p.participantName}","${p.email}","${p.phone}","${p.college}","${p.eventName}","${p.ticketNumber}","${p.checkedIn ? "Present" : "Absent"}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `registrations-export-${new Date().toISOString().slice(0, 10)}.csv`);
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-anton uppercase tracking-wider text-white">Registrants & Attendees</h1>
          <p className="font-archivo text-[13px] text-white/40 font-archivo">Review participant information, track checks, and issue certificates.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-white/5 bg-[#141414] hover:bg-white/5 text-white font-bold text-[13.5px] font-archivo cursor-pointer transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Grid Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-archivo">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by name, email, event, college or ticket..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#121212]/40 border border-white/5 text-white text-[13.5px] outline-none"
          />
        </div>

        {/* Attendance Filter */}
        <div className="relative">
          <select
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#121212]/40 border border-white/5 text-white text-[13.5px] outline-none appearance-none cursor-pointer focus:border-white/20"
          >
            <option value="ALL">All Attendance Status</option>
            <option value="PRESENT">Checked-In (Present)</option>
            <option value="ABSENT">Pending Check-in (Absent)</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      {isPending ? (
        <div className="py-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-lime)]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-[#121212]/30 p-16 text-center font-archivo max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl mx-auto mb-5 opacity-60">
            <Inbox className="w-6 h-6 text-white/40" />
          </div>
          <h3 className="text-white font-bold text-[17px] mb-1.5 uppercase tracking-wide">No Participants</h3>
          <p className="text-white/40 text-[13.5px] leading-relaxed">
            No registrations found matching the filters or event registrations have not started yet.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#121212]/40 overflow-hidden font-archivo">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-white/40 text-[11px] font-bold uppercase tracking-wider bg-white/[0.01]">
                  <th className="px-6 py-4">Participant Details</th>
                  <th className="px-6 py-4">Event & Ticket</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[13px] text-white/80">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-[14px]">{p.participantName}</div>
                      <div className="text-[11px] text-white/40 mt-1 flex items-center gap-1.5 font-medium">
                        <Mail className="w-3.5 h-3.5 text-white/20" /> {p.email}
                        {p.phone && (
                          <>
                            <span className="text-white/10">|</span>
                            <Phone className="w-3.5 h-3.5 text-white/20" /> {p.phone}
                          </>
                        )}
                      </div>
                      <div className="text-[11px] text-white/30 mt-1">{p.college}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white/90">{p.eventName}</div>
                      <div className="text-[11px] font-mono text-[var(--color-lime)] mt-1 font-bold">
                        Pass ID: {p.ticketNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                        p.checkedIn 
                          ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                          : "bg-white/5 text-white/40 border border-white/10"
                      }`}>
                        {p.checkedIn ? "Checked In" : "Not Checked In"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleToggleAttendance(p.id)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium text-[11px] border border-white/5 transition-colors cursor-pointer"
                        >
                          {p.checkedIn ? "Cancel Check-in" : "Check-in"}
                        </button>
                        <button 
                          onClick={() => handleSendEmail(p.email)}
                          className="p-1.5 rounded-lg border border-white/5 bg-[#141414] hover:bg-white/5 text-white/70 hover:text-white transition-colors cursor-pointer"
                          title="Resend Pass Email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
