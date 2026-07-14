import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-archivo)]">
          Notifications
        </h1>
        <p className="text-text-faint mt-1">Stay updated on events and announcements.</p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-5">
          <Bell className="w-7 h-7 text-text-faint" />
        </div>
        <h3 className="text-lg font-semibold text-text-main mb-2 font-[family-name:var(--font-archivo)]">
          Coming Soon
        </h3>
        <p className="text-sm text-text-faint max-w-sm">
          Notifications for event updates, registration confirmations, and reminders will be available in a future update.
        </p>
      </div>
    </div>
  );
}
