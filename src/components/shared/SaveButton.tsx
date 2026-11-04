"use client";

import { Bookmark } from "lucide-react";
import { useState, useTransition } from "react";
import { saveEvent, removeSavedEvent } from "@/actions/saved";
import { cn } from "@/utils/cn";
import { toast } from "sonner";

interface SaveButtonProps {
  eventId: string;
  initialSaved?: boolean;
  size?: "sm" | "md";
  className?: string;
  /** Show "Save"/"Saved" next to the icon (for wide buttons) */
  showLabel?: boolean;
}

export function SaveButton({ eventId, initialSaved = false, size = "md", className, showLabel = false }: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        const res = saved ? await removeSavedEvent(eventId) : await saveEvent(eventId);
        if (res && typeof res === "object" && "error" in res && res.error) {
          toast.error(String(res.error));
          return;
        }
        setSaved(!saved);
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleToggle();
      }}
      disabled={isPending}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-full border backdrop-blur-sm transition-all",
        saved
          ? "bg-lime/15 border-lime/30 text-lime"
          : "bg-card/80 border-border text-text-faint hover:text-lime hover:border-lime/30",
        size === "sm" ? "p-1.5" : "p-2",
        isPending && "opacity-50",
        className
      )}
      aria-label={saved ? "Remove from saved" : "Save event"}
    >
      <Bookmark
        className={cn(
          "transition-all",
          size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4",
          saved && "fill-current"
        )}
      />
      {showLabel && <span className="text-sm font-medium">{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
