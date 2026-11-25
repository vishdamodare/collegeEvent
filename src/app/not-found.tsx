import Link from "next/link";

export const metadata = { title: "Page not found — CollegeEvents" };

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-2xl font-bold mb-2">Page not found</h1>
      <p className="text-sm opacity-70 mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/events" className="px-5 py-2.5 rounded-xl border border-current font-semibold text-sm">
        Browse events
      </Link>
    </main>
  );
}
