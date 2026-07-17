"use client";

import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Organizer Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-[400px] w-full flex flex-col items-center justify-center font-archivo text-center text-white">
      <ShieldAlert className="w-12 h-12 text-red-400 mb-4" />
      <h2 className="text-[22px] font-anton uppercase mb-2">Something Went Wrong</h2>
      <p className="text-[13px] text-white/50 mb-6 max-w-sm">
        An error occurred while loading this dashboard view. Try refreshing the panel.
      </p>
      <div className="flex gap-3">
        <button 
          onClick={() => reset()} 
          className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-[13px] cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
