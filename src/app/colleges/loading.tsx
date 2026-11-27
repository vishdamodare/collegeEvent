// Instant fallback for the Colleges tab (page is force-dynamic with a DB query).
export default function CollegesLoading() {
  return (
    <div className="min-h-screen bg-background text-text-main">
      <div className="max-w-7xl mx-auto px-5 pt-28 pb-20 animate-pulse space-y-6">
        <div className="h-10 w-64 rounded-lg bg-card-hover" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[420px] rounded-2xl bg-card-hover" />
          ))}
        </div>
      </div>
    </div>
  );
}
