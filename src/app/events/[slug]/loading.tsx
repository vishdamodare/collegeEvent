import { EventDetailSkeleton } from "@/components/shared/LoadingSkeleton";

export default function EventDetailLoading() {
  return (
    <div className="min-h-screen bg-background text-text-main">
      <div className="max-w-6xl mx-auto px-5 pt-28 pb-20">
        <EventDetailSkeleton />
      </div>
    </div>
  );
}
