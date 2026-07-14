import { EventGridSkeleton } from "@/components/shared/LoadingSkeleton";

export default function EventsLoading() {
  return (
    <div className="min-h-screen bg-background text-text-main">
      <div className="max-w-7xl mx-auto px-5 pt-28 pb-20">
        <div className="animate-pulse space-y-6">
          <div className="h-12 w-64 rounded-lg bg-card-hover" />
          <div className="h-5 w-96 rounded bg-card-hover" />
          <div className="flex gap-4">
            <div className="h-12 w-80 rounded-xl bg-card-hover" />
            <div className="h-12 w-36 rounded-xl bg-card-hover ml-auto" />
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 w-20 rounded-full bg-card-hover" />
            ))}
          </div>
        </div>
        <div className="mt-8">
          <EventGridSkeleton count={6} />
        </div>
      </div>
    </div>
  );
}
