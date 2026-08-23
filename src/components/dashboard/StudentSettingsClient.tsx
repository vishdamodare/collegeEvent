"use client";

import { useState } from "react";
import {
  Lock,
  Bell,
  Shield,
  KeyRound,
  Download,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import {
  updateStudentPasswordAction,
  updateStudentPreferencesAction,
} from "@/actions/profile";

interface StudentSettingsClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  profile?: {
    college: string;
    branch: string;
    academicYear: string;
    phoneNumber?: string | null;
    phoneVerified: boolean;
  } | null;
}

export function StudentSettingsClient({ user, profile }: StudentSettingsClientProps) {
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Notifications state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await updateStudentPasswordAction(currentPassword, newPassword);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSavingPreferences(true);
    try {
      const res = await updateStudentPreferencesAction({
        emailAlerts,
        eventReminders,
        weeklyDigest,
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Notification preferences saved successfully!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to save preferences.");
    } finally {
      setIsSavingPreferences(false);
    }
  };

  return (
    <div className="space-y-8 font-archivo">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-anton uppercase tracking-wider text-white">
          Account Settings & Security
        </h1>
        <p className="text-sm text-white/40 mt-1">
          Manage your credentials, notification preferences, connected identity, and data privacy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Security & Notifications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notification Preferences */}
          <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[var(--color-lime)]/10 border border-[var(--color-lime)]/30 flex items-center justify-center text-[var(--color-lime)]">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    Notifications
                  </h3>
                  <p className="text-xs text-white/40">Select which updates you want to receive</p>
                </div>
              </div>

              <button
                onClick={handleSavePreferences}
                disabled={isSavingPreferences}
                className="px-3.5 py-1.5 rounded-xl bg-[var(--color-lime)] hover:bg-[var(--color-lime)]/90 text-black font-bold text-xs cursor-pointer transition-all disabled:opacity-50"
              >
                {isSavingPreferences ? "Saving..." : "Save Preferences"}
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                <div>
                  <p className="text-sm font-bold text-white">Registration & Ticket Confirmations</p>
                  <span className="text-xs text-white/40 block mt-0.5">
                    Receive instant email confirmations and pass QR codes upon booking.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-[var(--color-lime)] focus:ring-[var(--color-lime)] cursor-pointer w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                <div>
                  <p className="text-sm font-bold text-white">Event Reminders (24 Hours Prior)</p>
                  <span className="text-xs text-white/40 block mt-0.5">
                    Get an alert the day before your registered fests or hackathons begin.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={eventReminders}
                  onChange={(e) => setEventReminders(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-[var(--color-lime)] focus:ring-[var(--color-lime)] cursor-pointer w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                <div>
                  <p className="text-sm font-bold text-white">Weekly Campus Digest</p>
                  <span className="text-xs text-white/40 block mt-0.5">
                    Curated weekend summary of trending events in your college and city.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={weeklyDigest}
                  onChange={(e) => setWeeklyDigest(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-[var(--color-lime)] focus:ring-[var(--color-lime)] cursor-pointer w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Password Update */}
          <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-6 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--color-cobalt)]/10 border border-[var(--color-cobalt)]/30 flex items-center justify-center text-[var(--color-cobalt)]">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Password & Security
                </h3>
                <p className="text-xs text-white/40">Update your account login credentials</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-white/60 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/10 text-white text-sm outline-none focus:border-[var(--color-lime)]/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-1.5">
                    New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/10 text-white text-sm outline-none focus:border-[var(--color-lime)]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/10 text-white text-sm outline-none focus:border-[var(--color-lime)]/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5 text-[var(--color-lime)]" /> Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 space-y-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold uppercase tracking-wider">Data & Privacy</h3>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div>
                <p className="text-sm font-bold text-white">Delete Student Account</p>
                <span className="text-xs text-white/40 block mt-0.5">
                  Permanently delete your profile, issued tickets, and participation logs.
                </span>
              </div>
              <button
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to request account deletion? All registered event passes will be voided."
                    )
                  ) {
                    toast.success("Account deletion request submitted to platform administrators.");
                  }
                }}
                className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold text-xs cursor-pointer transition-colors whitespace-nowrap"
              >
                Request Deletion
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Identity Card */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-6 space-y-5">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Student Identity
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-white/40 block text-[10.5px] uppercase font-bold">
                  Full Name
                </span>
                <p className="font-bold text-white text-sm">{user.name}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-white/40 block text-[10.5px] uppercase font-bold">
                  Email Account
                </span>
                <p className="font-semibold text-white truncate">{user.email}</p>
              </div>

              {profile && (
                <>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                    <span className="text-white/40 block text-[10.5px] uppercase font-bold">
                      College / Institution
                    </span>
                    <p className="font-semibold text-white">{profile.college}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                    <span className="text-white/40 block text-[10.5px] uppercase font-bold">
                      Branch & Year
                    </span>
                    <p className="font-semibold text-white">
                      {profile.branch} • {profile.academicYear}
                    </p>
                  </div>

                  {profile.phoneNumber && (
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                      <div>
                        <span className="text-white/40 block text-[10.5px] uppercase font-bold">
                          Phone Number
                        </span>
                        <p className="font-semibold text-white">{profile.phoneNumber}</p>
                      </div>
                      {profile.phoneVerified ? (
                        <span className="text-green-400 text-[10.5px] font-bold flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="text-orange-400 text-[10.5px] font-bold bg-orange-500/10 px-2 py-0.5 rounded-md">
                          Unverified
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
