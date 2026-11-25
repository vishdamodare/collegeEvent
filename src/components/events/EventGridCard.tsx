"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SaveButton } from "@/components/shared/SaveButton";

interface EventGridCardProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  capacity: number;
  status: string;
  categoryName: string;
  categoryColor?: string | null;
  imageUrl?: string;
  organizerName: string;
  registrationCount: number;
  savedCount: number;
  isSaved?: boolean;
  index?: number;
}

export function EventGridCard({
  id,
  slug,
  title,
  date,
  location,
  capacity,
  status,
  categoryName,
  categoryColor,
  imageUrl,
  organizerName,
  registrationCount,
  isSaved = false,
  index = 0,
}: EventGridCardProps) {
  const seatsLeft = capacity - registrationCount;
  const isSoldOut = seatsLeft <= 0;
  const d = new Date(date);

  return (
    <Link
      href={`/events/${slug}`}
      className="group flex flex-col h-full rounded-2xl border border-border bg-card overflow-hidden hover:border-border-bright transition-colors"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-card-hover">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            priority={index < 3} // first row is above the fold on desktop
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-10 h-10 text-text-faint" />
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span
            className="px-2.5 py-1 rounded-lg text-[13px] font-semibold backdrop-blur-md bg-black/55 text-white"
            style={categoryColor ? { color: categoryColor } : undefined}
          >
            {categoryName}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <SaveButton eventId={id} initialSaved={isSaved} size="sm" />
        </div>

        {status !== "PUBLISHED" && (
          <div className="absolute bottom-3 left-3">
            <StatusBadge status={status} />
          </div>
        )}
        {isSoldOut && status === "PUBLISHED" && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-1 rounded-lg text-[13px] font-semibold bg-red-600 text-white">Sold out</span>
          </div>
        )}
      </div>

      <div className="p-5 flex gap-4 flex-1">
        <div className="shrink-0 w-[52px] text-center leading-none">
          <div className="text-[13px] font-semibold text-lime">{format(d, "MMM")}</div>
          <div className="mt-1 font-anton text-[32px] tracking-tight">{format(d, "d")}</div>
        </div>
        <div className="min-w-0">
          <h3 className="text-[18px] font-semibold leading-snug line-clamp-2 group-hover:text-lime transition-colors">{title}</h3>
          <p className="mt-1 text-[14px] text-text-muted truncate">{location}</p>
          <p className="mt-3 text-[13px] text-text-faint">
            {organizerName}
            {!isSoldOut && status === "PUBLISHED" && <> &middot; {seatsLeft} seats left</>}
          </p>
        </div>
      </div>
    </Link>
  );
}
