"use client";

import { useTransition } from "react";
import { Bell, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { clearNotifications } from "@/actions/registrations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/shared/EmptyState";

interface NotificationsClientProps {
  notifications: Array<{
    id: string;
    message: string;
    createdAt: Date | string;
  }>;
}

export function NotificationsClient({ notifications }: NotificationsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClear = () => {
    if (!confirm("Are you sure you want to clear all notifications?")) return;
    startTransition(async () => {
      const res = await clearNotifications();
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Notifications cleared.");
        router.refresh();
      }
    });
  };

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="All caught up!"
        description="No new notifications. You'll see booking confirmations and important event updates here."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex justify-end">
        <button
          onClick={handleClear}
          disabled={isPending}
          className="flex items-center gap-2 py-2 px-3.5 rounded-xl border border-red-500/10 text-red-400 hover:bg-red-500/10 transition-all text-xs font-semibold cursor-pointer disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          Clear All
        </button>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:border-border-bright transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-lime/10 flex items-center justify-center text-lime shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-xs text-text-main leading-relaxed">{notif.message}</p>
              <p className="text-[10px] text-text-faint">
                {format(new Date(notif.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
