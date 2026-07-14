"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  Share2,
  Globe,
  User,
  Tag,
  Info,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SaveButton } from "@/components/shared/SaveButton";
import { EventGridCard } from "@/components/events/EventGridCard";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface EventDetailClientProps {
  event: {
    id: string;
    slug: string;
    title: string;
    description: string;
    date: Date;
    location: string;
    capacity: number;
    isClosed: boolean;
    status: string;
    category: { id: string; name: string; slug: string; color?: string | null };
    images: Array<{ id: string; url: string; isHero: boolean }>;
    organizer: {
      id: string;
      name: string;
      image: string | null;
      organizerProfile?: {
        college: string;
        department: string;
        position: string;
      } | null;
    };
    _count: { registrations: number; savedBy: number };
  };
  relatedEvents: Array<{
    id: string;
    slug: string;
    title: string;
    description: string;
    date: Date;
    location: string;
    capacity: number;
    status: string;
    category: { id: string; name: string; slug: string; color?: string | null };
    images: Array<{ url: string }>;
    _count: { registrations: number };
  }>;
}

export function EventDetailClient({ event, relatedEvents }: EventDetailClientProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const heroImage = event.images.find((i) => i.isHero)?.url || event.images[0]?.url;
  const gallery = event.images.filter((i) => !i.isHero);
  const seatsLeft = event.capacity - event._count.registrations;
  const isSoldOut = seatsLeft <= 0;

  const handleLogout = async () => {
    await authClient.signOut();
    router.refresh();
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: event.title,
        text: event.description.slice(0, 100),
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <main className="min-h-screen bg-background text-text-main">
      <Navbar isAuthenticated={!!session} onLogout={handleLogout} />

      {/* Hero banner */}
      <div className="relative w-full aspect-[21/9] max-h-[480px] overflow-hidden">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={event.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cobalt/20 to-card" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-5 -mt-24 relative z-10 pb-20">
        {/* Back link */}
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm text-text-faint hover:text-lime transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
                  style={{
                    backgroundColor: event.category.color ? `${event.category.color}20` : "rgba(255,255,255,.08)",
                    borderColor: event.category.color ? `${event.category.color}30` : "rgba(255,255,255,.1)",
                    color: event.category.color || "#fff",
                  }}
                >
                  {event.category.name}
                </span>
                <StatusBadge status={event.status} size="md" />
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                {event.title}
              </h1>

              {/* Quick info row */}
              <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-lime" />
                  {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-coral" />
                  {event.location}
                </span>
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cobalt" />
                  {event.capacity.toLocaleString()} capacity
                </span>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="prose prose-invert max-w-none"
            >
              <h2 className="text-xl font-semibold mb-3 font-[family-name:var(--font-archivo)] normal-case">
                About This Event
              </h2>
              <p className="text-text-muted leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </motion.div>

            {/* Gallery */}
            {gallery.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-semibold mb-4 font-[family-name:var(--font-archivo)] normal-case">
                  Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {gallery.map((img) => (
                    <div key={img.id} className="relative aspect-[4/3] rounded-xl overflow-hidden">
                      <Image
                        src={img.url}
                        alt={event.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Organizer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="text-lg font-semibold mb-4 font-[family-name:var(--font-archivo)] normal-case">
                Organized By
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-card-hover flex items-center justify-center border border-border overflow-hidden">
                  {event.organizer.image ? (
                    <Image
                      src={event.organizer.image}
                      alt={event.organizer.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-text-faint" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-text-main">{event.organizer.name}</p>
                  {event.organizer.organizerProfile && (
                    <p className="text-sm text-text-faint">
                      {event.organizer.organizerProfile.position} · {event.organizer.organizerProfile.college}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl border border-border bg-card p-6 sticky top-28"
            >
              <div className="space-y-4">
                {/* Seats info */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-faint">Seats remaining</span>
                  <span className={`text-lg font-bold ${isSoldOut ? "text-red-400" : "text-lime"}`}>
                    {isSoldOut ? "Sold Out" : seatsLeft.toLocaleString()}
                  </span>
                </div>

                {/* Capacity bar */}
                <div className="w-full h-2 rounded-full bg-card-hover overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isSoldOut ? "bg-red-500" : "bg-lime"
                    }`}
                    style={{
                      width: `${Math.min(100, (event._count.registrations / event.capacity) * 100)}%`,
                    }}
                  />
                </div>

                <div className="text-xs text-text-faint text-center">
                  {event._count.registrations.toLocaleString()} / {event.capacity.toLocaleString()} registered
                </div>

                {/* Registration button placeholder */}
                <div className="pt-2">
                  <button
                    disabled
                    className="w-full btn btn-primary opacity-60 cursor-not-allowed"
                  >
                    Registration opens in Phase 4
                  </button>
                  <p className="text-[11px] text-text-faint text-center mt-2">
                    Registration system coming soon
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-border">
                  <SaveButton eventId={event.id} size="md" className="flex-1 justify-center" />
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 p-2 rounded-xl border border-border bg-card text-text-faint hover:text-text-main hover:border-border-bright transition-all text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>

              {/* Event info */}
              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <InfoRow icon={Calendar} label="Date" value={format(new Date(event.date), "MMM d, yyyy")} />
                <InfoRow icon={Clock} label="Time" value={format(new Date(event.date), "h:mm a")} />
                <InfoRow icon={MapPin} label="Venue" value={event.location} />
                <InfoRow icon={Tag} label="Category" value={event.category.name} />
                <InfoRow icon={Users} label="Capacity" value={event.capacity.toLocaleString()} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related events */}
        {relatedEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold mb-6 font-[family-name:var(--font-archivo)] normal-case">
              More by {event.organizer.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedEvents.map((re, i) => (
                <EventGridCard
                  key={re.id}
                  id={re.id}
                  slug={re.slug}
                  title={re.title}
                  description={re.description}
                  date={re.date}
                  location={re.location}
                  capacity={re.capacity}
                  status={re.status}
                  categoryName={re.category.name}
                  categoryColor={re.category.color}
                  imageUrl={re.images[0]?.url}
                  organizerName={event.organizer.name}
                  registrationCount={re._count.registrations}
                  savedCount={0}
                  index={i}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </main>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-text-faint mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-text-faint">{label}</p>
        <p className="text-sm text-text-muted">{value}</p>
      </div>
    </div>
  );
}
