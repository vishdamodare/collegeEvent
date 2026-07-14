"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";
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
  description,
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        href={`/events/${slug}`}
        className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-border-bright transition-all duration-300 hover:shadow-lg hover:shadow-black/20"
      >
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-card-hover to-card flex items-center justify-center">
              <Calendar className="w-10 h-10 text-text-faint" />
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span
              className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/10"
              style={{
                backgroundColor: categoryColor ? `${categoryColor}25` : "rgba(255,255,255,.12)",
                color: categoryColor || "#fff",
              }}
            >
              {categoryName}
            </span>
          </div>

          {/* Save button */}
          <div className="absolute top-3 right-3">
            <SaveButton eventId={id} initialSaved={isSaved} size="sm" />
          </div>

          {/* Status if not published */}
          {status !== "PUBLISHED" && (
            <div className="absolute bottom-3 left-3">
              <StatusBadge status={status} />
            </div>
          )}

          {/* Sold out overlay */}
          {isSoldOut && status === "PUBLISHED" && (
            <div className="absolute bottom-3 left-3">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-red-500/80 text-white backdrop-blur-sm">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-base font-semibold text-text-main mb-1.5 line-clamp-1 group-hover:text-lime transition-colors font-[family-name:var(--font-archivo)]">
            {title}
          </h3>
          <p className="text-sm text-text-faint line-clamp-2 mb-3 leading-relaxed">
            {description}
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-text-faint">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(date), "MMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate max-w-[140px]">{location}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {isSoldOut ? "Full" : `${seatsLeft} seats left`}
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-text-faint">
              by <span className="text-text-muted">{organizerName}</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
