export function EventCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-card-hover" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 rounded bg-card-hover" />
        <div className="h-5 w-3/4 rounded bg-card-hover" />
        <div className="h-3 w-full rounded bg-card-hover" />
        <div className="flex gap-3 pt-2">
          <div className="h-3 w-24 rounded bg-card-hover" />
          <div className="h-3 w-16 rounded bg-card-hover" />
        </div>
      </div>
    </div>
  );
}

export function EventGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function EventDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="aspect-[21/9] rounded-2xl bg-card-hover" />
      <div className="space-y-4 max-w-3xl">
        <div className="h-4 w-28 rounded bg-card-hover" />
        <div className="h-10 w-3/4 rounded bg-card-hover" />
        <div className="h-4 w-full rounded bg-card-hover" />
        <div className="h-4 w-5/6 rounded bg-card-hover" />
        <div className="h-4 w-2/3 rounded bg-card-hover" />
      </div>
    </div>
  );
}

export function DashboardCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 animate-pulse">
      <div className="h-3 w-24 rounded bg-card-hover mb-3" />
      <div className="h-8 w-16 rounded bg-card-hover" />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-card-hover" />
        <div className="space-y-2">
          <div className="h-5 w-40 rounded bg-card-hover" />
          <div className="h-3 w-56 rounded bg-card-hover" />
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-card-hover" />
        ))}
      </div>
    </div>
  );
}
