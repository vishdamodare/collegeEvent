import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-archivo)]">
          Settings
        </h1>
        <p className="text-text-faint mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-5">
          <Settings className="w-7 h-7 text-text-faint" />
        </div>
        <h3 className="text-lg font-semibold text-text-main mb-2 font-[family-name:var(--font-archivo)]">
          Coming Soon
        </h3>
        <p className="text-sm text-text-faint max-w-sm">
          Account settings including password changes, notification preferences, and privacy controls will be available in a future update.
        </p>
      </div>
    </div>
  );
}
