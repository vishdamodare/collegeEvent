"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Bell,
  Search,
  Trash2,
  Check,
  Users,
  CreditCard,
  Award,
  AlertCircle,
  Inbox,
  Loader2,
} from "lucide-react";
import {
  getAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "@/actions/admin";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnread, setShowUnread] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadNotifications = async () => {
    const res = await getAdminNotifications();
    setNotifications(res);
  };

  useEffect(() => {
    startTransition(async () => {
      await loadNotifications();
    });
  }, []);

  const filtered = notifications.filter((n) => {
    const matchesSearch = n.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRead = showUnread ? !n.read : true;
    return matchesSearch && matchesRead;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = (id: string) => {
    startTransition(async () => {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    });
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read.");
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    });
  };

  // Infer icon from message content
  const getIcon = (message: string) => {
    const m = message.toLowerCase();
    if (m.includes("registered") || m.includes("registration"))
      return <Users className="w-4 h-4 text-[var(--color-cobalt)]" />;
    if (m.includes("payment") || m.includes("₹"))
      return <CreditCard className="w-4 h-4 text-[var(--color-lime)]" />;
    if (m.includes("check") || m.includes("checkin") || m.includes("checked"))
      return <Award className="w-4 h-4 text-orange-400" />;
    return <AlertCircle className="w-4 h-4 text-white/50" />;
  };

  return (
    <div className="space-y-6 font-archivo">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-anton uppercase tracking-wider text-white">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-3 text-[14px] font-archivo font-bold text-[var(--color-lime)] bg-[var(--color-lime)]/10 border border-[var(--color-lime)]/20 px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-[13px] text-white/40">
            Live alerts for registrations, check-ins, and platform events.
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          disabled={isPending || unreadCount === 0}
          className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-white/5 bg-[#141414] hover:bg-white/5 text-white font-bold text-[13px] cursor-pointer transition-colors disabled:opacity-40"
        >
          <Check className="w-4 h-4" /> Mark All as Read
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141414] border border-white/5 text-white text-[13px] outline-none placeholder:text-white/30 focus:border-white/10"
          />
        </div>
        <button
          onClick={() => setShowUnread((v) => !v)}
          className={`px-4 py-2.5 rounded-xl border text-[13px] font-bold transition-colors cursor-pointer ${
            showUnread
              ? "border-[var(--color-lime)]/40 bg-[var(--color-lime)]/10 text-[var(--color-lime)]"
              : "border-white/5 bg-[#141414] text-white/60 hover:text-white"
          }`}
        >
          {showUnread ? "Showing Unread" : "All Notifications"}
        </button>
      </div>

      {/* Feed */}
      {isPending && notifications.length === 0 ? (
        <div className="py-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-lime)]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-[#121212]/30 p-14 text-center">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 opacity-50">
            <Inbox className="w-5 h-5 text-white/40" />
          </div>
          <h3 className="text-white font-bold text-[16px] mb-1">Inbox Clear</h3>
          <p className="text-white/40 text-[13px]">
            {showUnread
              ? "No unread notifications. You're all caught up!"
              : "No notifications yet. They'll appear here as activity happens on your events."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-2xl border p-4 flex gap-4 transition-all relative group ${
                notif.read
                  ? "bg-[#121212]/30 border-white/5"
                  : "bg-[#121212]/60 border-white/10 shadow-sm"
              }`}
            >
              {/* Unread dot indicator */}
              {!notif.read && (
                <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-[var(--color-lime)]" />
              )}

              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  notif.read ? "bg-white/[0.03] border border-white/5" : "bg-white/5 border border-white/10"
                }`}
              >
                {getIcon(notif.message)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pr-20">
                <p
                  className={`text-[13px] leading-relaxed ${
                    notif.read ? "text-white/50" : "text-white font-medium"
                  }`}
                >
                  {notif.message}
                </p>
                <span className="text-[10px] text-white/25 block mt-1.5 font-mono">
                  {new Date(notif.createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Action buttons — appear on hover */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notif.read && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    title="Mark as read"
                    className="p-1.5 rounded-lg border border-white/10 bg-[#141414] hover:bg-white/5 text-white cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notif.id)}
                  title="Delete notification"
                  className="p-1.5 rounded-lg border border-transparent hover:border-red-500/20 hover:bg-red-500/10 text-white/40 hover:text-red-400 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
