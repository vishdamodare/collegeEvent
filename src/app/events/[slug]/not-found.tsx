import Link from "next/link";
import { SearchX } from "lucide-react";

export default function EventNotFound() {
  return (
    <div className="min-h-screen bg-background text-text-main flex items-center justify-center px-5">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-6 mx-auto">
          <SearchX className="w-9 h-9 text-text-faint" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Event Not Found</h1>
        <p className="text-text-faint mb-8">
          The event you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/events" className="btn btn-primary">
            Browse Events
          </Link>
          <Link href="/" className="btn btn-glass">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
