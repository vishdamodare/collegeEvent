import { Lock, Settings, UserCircle, ShieldAlert } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-archivo)]">Settings</h1>
        <p className="text-text-faint mt-1">Configure account options, authorization policies, and security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation list */}
        <div className="md:col-span-1 space-y-1">
          <button className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold bg-lime/10 text-lime">
            Security & Password
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-text-faint hover:text-text-main hover:bg-card opacity-50 cursor-not-allowed" disabled>
            Account Settings
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-text-faint hover:text-text-main hover:bg-card opacity-50 cursor-not-allowed" disabled>
            Integrations
          </button>
        </div>

        {/* Setting Panel Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Password update form placeholder */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6">
            <h3 className="font-bold text-sm text-text-main uppercase tracking-wider font-[family-name:var(--font-archivo)]">
              Change Account Password
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-faint mb-1.5">
                  Current Password
                </label>
                <input type="password" placeholder="••••••••" className="form-input" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-faint mb-1.5">
                  New Password
                </label>
                <input type="password" placeholder="••••••••" className="form-input" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-faint mb-1.5">
                  Confirm Password
                </label>
                <input type="password" placeholder="••••••••" className="form-input" />
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <button className="btn btn-primary min-w-[120px] opacity-75 cursor-not-allowed" disabled>
                Update Password
              </button>
            </div>
          </div>

          {/* Danger zone panel */}
          <div className="bg-card border border-red-500/20 rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-400 text-sm uppercase tracking-wider font-archivo">
                  Danger Zone
                </h4>
                <p className="text-xs text-text-faint mt-1 leading-relaxed">
                  Permanently delete your organizer workspace, all registered event records, and sign-up metrics. This action is irreversible.
                </p>
              </div>
            </div>
            <button className="btn bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 w-full sm:w-auto font-bold text-xs py-2 px-4 rounded-xl cursor-not-allowed" disabled>
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
