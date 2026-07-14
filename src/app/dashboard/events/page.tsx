import { Calendar } from "lucide-react";

export default function MyEventsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-archivo)]">
          My Events
        </h1>
        <p className="text-text-faint mt-1">Events you&apos;ve registered for will appear here.</p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-5">
          <Calendar className="w-7 h-7 text-text-faint" />
        </div>
        <h3 className="text-lg font-semibold text-text-main mb-2 font-[family-name:var(--font-archivo)]">
          Coming in Phase 4
        </h3>
        <p className="text-sm text-text-faint max-w-sm">
          Event registration is coming soon. Once available, you&apos;ll see your registered events, tickets, and attendance history here.
        </p>
      </div>
    </div>
  );
}
