import { BarChart3 } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-6">
        <BarChart3 className="w-7 h-7 text-lime" />
      </div>
      <h1 className="text-2xl font-bold font-[family-name:var(--font-archivo)] text-text-main mb-2">
        Analytics Console
      </h1>
      <p className="text-sm text-text-faint max-w-sm leading-relaxed mb-6">
        Track registrations conversion funnels, popular category breakdowns, and check-in timeline maps. Coming in Phase 4!
      </p>
      <div className="px-3 py-1 rounded-full border border-border bg-card text-[10px] uppercase font-bold tracking-widest text-text-faint">
        Coming Soon
      </div>
    </div>
  );
}
