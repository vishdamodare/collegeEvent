"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-sm opacity-70 mb-6 max-w-sm">We couldn&apos;t load this page. Please try again.</p>
      <button onClick={() => reset()} className="px-5 py-2.5 rounded-xl border border-current font-semibold text-sm cursor-pointer">
        Try again
      </button>
    </main>
  );
}
