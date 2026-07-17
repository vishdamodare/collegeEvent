"use client";

import { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  UserPlus, 
  Settings, 
  Trash2, 
  Lock, 
  Bell, 
  Mail, 
  Shield 
} from "lucide-react";
import { MOCK_SETTINGS } from "@/data/admin";
import { TeamMember } from "@/types/admin";
import { getOrganizerProfile } from "@/actions/admin";

export default function SettingsPage() {
  const [team, setTeam] = useState<TeamMember[]>(MOCK_SETTINGS.team);
  const [emailAlerts, setEmailAlerts] = useState(MOCK_SETTINGS.notifications.emailAlerts);
  const [weeklyDigest, setWeeklyDigest] = useState(MOCK_SETTINGS.notifications.weeklyDigest);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"ADMIN" | "EDITOR" | "VIEWER">("EDITOR");
  const [collegeName, setCollegeName] = useState("college");

  useEffect(() => {
    getOrganizerProfile()
      .then((res) => {
        if (res?.college) {
          setCollegeName(res.college);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail) return;

    const newMember: TeamMember = {
      id: `team-${Math.random().toString(36).substr(2, 9)}`,
      name: newMemberEmail.split("@")[0],
      email: newMemberEmail,
      role: newMemberRole,
      status: "PENDING",
      addedAt: new Date().toISOString(),
    };

    setTeam([...team, newMember]);
    setNewMemberEmail("");
    alert("Invitation successfully sent to " + newMemberEmail);
  };

  const handleRemoveMember = (id: string) => {
    if (confirm("Are you sure you want to remove this team member?")) {
      setTeam(team.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-8 font-archivo">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-anton uppercase tracking-wider text-white">System Settings</h1>
        <p className="text-[13px] text-white/40">Manage security credentials, configure email notifications, and invite team members.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Security & Notification Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notification toggles */}
          <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-6 space-y-4">
            <h3 className="text-[16px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-5 h-5 text-[var(--color-lime)]" /> Notification Preferences
            </h3>
            <div className="space-y-4 pt-2">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
                <div>
                  <p className="text-[13px] font-bold text-white">Email Alerts</p>
                  <span className="text-[11px] text-white/40 block mt-0.5">Receive immediate emails on student registrations.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-[var(--color-lime)] focus:ring-[var(--color-lime)] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
                <div>
                  <p className="text-[13px] font-bold text-white">Weekly Performance Digest</p>
                  <span className="text-[11px] text-white/40 block mt-0.5">Summary of weekly revenues, attendance, and chart reports.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={weeklyDigest}
                  onChange={(e) => setWeeklyDigest(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-[var(--color-lime)] focus:ring-[var(--color-lime)] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Change Password Panel */}
          <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-6 space-y-4">
            <h3 className="text-[16px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-5 h-5 text-[var(--color-lime)]" /> Security Credentials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[12px] font-bold mb-2 text-white/60">Current Password</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-white/5 text-white text-[13px] outline-none" 
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold mb-2 text-white/60">New Password</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-white/5 text-white text-[13px] outline-none" 
                  placeholder="Minimum 8 characters"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button 
                onClick={() => alert("Password successfully updated!")}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[12px] font-bold cursor-pointer transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 space-y-4">
            <h3 className="text-[16px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Danger Zone
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-[13px] font-bold text-white">Delete Organizer Account</h4>
                <p className="text-[11px] text-white/55 mt-1">Permanently remove your {collegeName} organizer access and cancel all active fests.</p>
              </div>
              <button 
                onClick={() => {
                  if (confirm("CRITICAL WARNING: This will permanently delete your organizer profile. Are you sure?")) {
                    alert("Account deletion request submitted to CampusEvents admin.");
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-400 font-bold text-[12.5px] cursor-pointer transition-colors whitespace-nowrap"
              >
                Request Deletion
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Team Members & invites */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-6 space-y-6">
            <h3 className="text-[16px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--color-lime)]" /> Team Members
            </h3>

            {/* Invite Form */}
            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold mb-1.5 text-white/50">Invite Email Address</label>
                <input 
                  type="email" 
                  placeholder="co-lead@college.edu"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-4.5 py-2.5 rounded-xl bg-[#141414] border border-white/5 text-white text-[12.5px] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold mb-1.5 text-white/50">Access Role</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-white/5 text-white/70 text-[12.5px] outline-none cursor-pointer"
                >
                  <option value="ADMIN">Admin (Full Edit + Team)</option>
                  <option value="EDITOR">Editor (Edit Fests only)</option>
                  <option value="VIEWER">Viewer (Reports only)</option>
                </select>
              </div>
              <button 
                type="submit" 
                className="w-full py-2.5 rounded-xl bg-[var(--color-lime)] hover:bg-[var(--color-lime)]/90 text-[#0b0b0b] font-bold text-[12.5px] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <UserPlus className="w-4 h-4" /> Send Invite
              </button>
            </form>

            <div className="h-[1px] bg-white/5"></div>

            {/* Member List */}
            <div className="space-y-3.5">
              {team.map((member) => (
                <div key={member.id} className="flex justify-between items-center pb-3 border-b border-white/5 last:border-0 last:pb-0">
                  <div>
                    <h4 className="text-[12.5px] font-bold text-white leading-none">{member.name}</h4>
                    <span className="text-[10px] text-white/40 mt-1 block font-mono">{member.email}</span>
                    <span className={`text-[9px] font-bold uppercase rounded px-1.5 py-0.25 mt-1.5 inline-block ${
                      member.status === "ACTIVE" ? "bg-green-500/10 text-green-400" : "bg-orange-500/10 text-orange-400"
                    }`}>
                      {member.status.toLowerCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-white/55 font-mono">{member.role}</span>
                    {member.role !== "OWNER" && (
                      <button 
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1 rounded text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
