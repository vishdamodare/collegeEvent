export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="space-y-6 animate-pulse">
      <div className="h-10 w-72 rounded-lg bg-white/5" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-white/5" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-white/5" />
    </div>
  );
}
