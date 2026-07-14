"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Calendar, MapPin, Trash2, Bookmark } from "lucide-react";
import { removeSavedEvent } from "@/actions/saved";
import { EmptyState } from "@/components/shared/EmptyState";

interface SavedEventsClientProps {
  events: Array<{
    id: string;
    createdAt: Date;
    event: {
      id: string;
      slug: string;
      title: string;
      description: string;
      date: Date;
      location: string;
      capacity: number;
      status: string;
      category: { name: string; slug: string; color?: string | null };
      images: Array<{ url: string }>;
      organizer: { name: string };
      _count: { registrations: number };
    };
  }>;
}

export function SavedEventsClient({ events }: SavedEventsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRemove = (eventId: string) => {
    startTransition(async () => {
      await removeSavedEvent(eventId);
      router.refresh();
    });
  };

  if (events.length === 0) {
    return (
      <EmptyState
        icon={Bookmark}
        title="No saved events yet"
        description="When you find events you're interested in, bookmark them to see them here."
        action={{
          label: "Discover Events",
          onClick: () => router.push("/events"),
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      {events.map(({ id, event }, i) => (
        <motion.div
          key={id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-border-bright transition-all group"
        >
          <Link href={`/events/${event.slug}`} className="w-16 h-16 rounded-lg overflow-hidden shrink-0 relative">
            {event.images[0]?.url ? (
              <Image src={event.images[0].url} alt={event.title} fill className="object-cover" sizes="64px" />
            ) : (
              <div className="w-full h-full bg-card-hover flex items-center justify-center">
                <Calendar className="w-5 h-5 text-text-faint" />
              </div>
            )}
          </Link>

          <Link href={`/events/${event.slug}`} className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-text-main truncate group-hover:text-lime transition-colors">
              {event.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-text-faint">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(event.date), "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[120px]">{event.location}</span>
              </span>
            </div>
          </Link>

          <span
            className="hidden sm:inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase shrink-0"
            style={{
              backgroundColor: event.category.color ? `${event.category.color}20` : "rgba(255,255,255,.08)",
              color: event.category.color || "#fff",
            }}
          >
            {event.category.name}
          </span>

          <button
            onClick={() => handleRemove(event.id)}
            disabled={isPending}
            className="p-2 rounded-lg text-text-faint hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
            aria-label="Remove from saved"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </motion.div>
      ))}
    </div>
  );
}
