// Shown instantly on tap while the (DB-backed, force-dynamic) college page renders on the server.
export default function CollegeLoading() {
  return (
    <div className="min-h-screen bg-background text-text-main">
      <div className="max-w-7xl mx-auto px-5 pt-28 pb-20 animate-pulse space-y-6">
        <div className="h-64 w-full rounded-2xl bg-card-hover" />
        <div className="h-10 w-2/3 rounded-lg bg-card-hover" />
        <div className="h-5 w-1/3 rounded bg-card-hover" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 rounded-2xl bg-card-hover" />
          ))}
        </div>
      </div>
    </div>
  );
}
