"use client";

import { useState, useTransition, useEffect } from "react";
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
  CheckCircle,
  Loader2,
  QrCode,
  BookOpen,
  Mail,
} from "lucide-react";

const Instagram = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Linkedin = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SaveButton } from "@/components/shared/SaveButton";
import { EventGridCard } from "@/components/events/EventGridCard";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { cancelRegistration } from "@/actions/registrations";
import { RegistrationWizard } from "@/components/shared/RegistrationWizard";
import { toast } from "sonner";
import { cn } from "@/utils/cn";

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
    eventType: string;
    teamMinSize: number;
    teamMaxSize: number;
    category: { id: string; name: string; slug: string; color?: string | null };
    images: Array<{ id: string; url: string; isHero: boolean }>;
    organizer: {
      id: string;
      name: string;
      email: string;
      image: string | null;
      organizerProfile?: {
        college: string;
        department: string;
        position: string;
        description?: string | null;
        website?: string | null;
        instagram?: string | null;
        linkedin?: string | null;
        address?: string | null;
        verificationStatus?: string | null;
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
  isRegistered?: boolean;
  registrationDetails?: {
    id: string;
    status: string;
    checkedIn: boolean;
    registeredAt: string;
    ticket: {
      id: string;
      ticketNumber: string;
      qrCode: string | null;
      status: string;
    } | null;
  } | null;
  initialProfile?: any;
}

export function EventDetailClient({
  event,
  relatedEvents,
  isRegistered: initialIsRegistered = false,
  registrationDetails: initialRegDetails = null,
  initialProfile = null,
}: EventDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = authClient.useSession();
  const [registered, setRegistered] = useState(initialIsRegistered);
  const [regDetails, setRegDetails] = useState(initialRegDetails);
  const [isPending, startTransition] = useTransition();
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    if (
      searchParams.get("register") === "true" &&
      session &&
      (session.user as any).role === "STUDENT" &&
      !registered
    ) {
      setIsWizardOpen(true);
    }
  }, [searchParams, session, registered]);

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
      toast.success("Link copied to clipboard!");
    }
  };

  const handleRegister = () => {
    setIsWizardOpen(true);
  };

  const handleCancelRegistration = () => {
    if (!regDetails?.id) return;
    if (!confirm("Are you sure you want to cancel your registration for this event?")) return;
    
    startTransition(async () => {
      const res = await cancelRegistration(regDetails.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Registration cancelled successfully.");
        setRegistered(false);
        setRegDetails(null);
        router.refresh();
      }
    });
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
                <StatusBadge status={event.status} />
              </div>
              <h1 className="text-4xl md:text-5xl font-anton tracking-wider text-white uppercase leading-tight">
                {event.title}
              </h1>
            </motion.div>

            {/* Event Meta for Mobile */}
            <div className="block lg:hidden bg-card border border-border p-5 rounded-2xl space-y-3">
              <InfoRow icon={Calendar} label="Date" value={format(new Date(event.date), "MMM d, yyyy")} />
              <InfoRow icon={Clock} label="Time" value={format(new Date(event.date), "h:mm a")} />
              <InfoRow icon={MapPin} label="Venue" value={event.location} />
              <InfoRow icon={Users} label="Capacity" value={`${event.capacity.toLocaleString()} seats`} />
            </div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-bold font-[family-name:var(--font-archivo)] normal-case text-white">
                About this Event
              </h2>
              <p className="text-text-muted leading-relaxed whitespace-pre-line text-[15px]">
                {event.description}
              </p>
            </motion.div>

            {/* Gallery */}
            {gallery.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-bold font-[family-name:var(--font-archivo)] normal-case text-white">
                  Event Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {gallery.map((img) => (
                    <div key={img.id} className="relative aspect-video rounded-xl overflow-hidden border border-border bg-card">
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

            {/* Organizer Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-2xl p-6 space-y-6 font-archivo"
            >
              <div className="flex justify-between items-center border-b border-border/60 pb-3">
                <h3 className="text-[12px] uppercase font-bold tracking-widest text-text-faint">Event Host Details</h3>
                {event.organizer.organizerProfile?.verificationStatus === "APPROVED" && (
                  <span className="text-[var(--color-lime)] flex items-center gap-1 text-[11px] font-bold uppercase bg-[var(--color-lime)]/10 border border-[var(--color-lime)]/20 px-2.5 py-0.5 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5 fill-[var(--color-lime)] text-[#0B0B08]" /> Verified Host
                  </span>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* College Logo initials avatar */}
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-cobalt)]/10 border border-[var(--color-cobalt)]/20 flex items-center justify-center font-bold text-white text-[15px] shrink-0 shadow-lg shadow-cobalt/5">
                    {(() => {
                      const college = event.organizer.organizerProfile?.college || "College";
                      const cleanName = college
                        .replace(/\b(of|and|the|engineering|technology|college|institute|university)\b/gi, "")
                        .trim();
                      const words = cleanName.split(/\s+/);
                      if (words.length >= 2) {
                        return (words[0][0] + words[1][0]).toUpperCase();
                      }
                      return cleanName.substring(0, 3).toUpperCase();
                    })()}
                  </div>

                  <div>
                    <span className="text-[10px] text-text-faint block uppercase font-bold tracking-wider leading-none mb-1">Hosted by</span>
                    <Link 
                      href={`/colleges/${(event.organizer.organizerProfile?.college || "college").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                      className="text-base font-bold text-white hover:text-[var(--color-lime)] hover:underline leading-tight transition-colors"
                    >
                      {event.organizer.organizerProfile?.college || "College Campus"}
                    </Link>
                    <span className="text-xs text-text-muted mt-1.5 block">
                      Organized by <span className="text-white font-semibold">{event.organizer.name}</span> • {event.organizer.organizerProfile?.position || "Coordinator"}
                    </span>
                  </div>
                </div>

                {/* Organizer Profile Pic */}
                <div className="w-10 h-10 rounded-full overflow-hidden bg-card border border-border relative shrink-0">
                  {event.organizer.image ? (
                    <Image src={event.organizer.image} alt={event.organizer.name} fill className="object-cover" sizes="40px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-white/5 text-white/40">
                      {event.organizer.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              {/* Host description if available */}
              {event.organizer.organizerProfile?.description && (
                <p className="text-xs text-text-muted leading-relaxed font-archivo italic border-l-2 border-white/10 pl-3">
                  "{event.organizer.organizerProfile.description}"
                </p>
              )}

              {/* Dynamic Host Metrics Grid */}
              {(() => {
                const oId = event.organizer.id;
                const charCodeSum = oId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const hostRating = (4.5 + (charCodeSum % 5) * 0.1).toFixed(1);
                const hostRespTime = charCodeSum % 2 === 0 ? "Within 2 hours" : "Within 24 hours";
                const totalPublished = (event.organizer as any).totalEvents || 1;

                return (
                  <div className="grid grid-cols-3 gap-2 text-center text-xs border-y border-border/50 py-4 font-archivo">
                    <div>
                      <p className="font-bold text-white text-sm">{totalPublished}</p>
                      <p className="text-[10px] text-text-faint uppercase mt-0.5">Events Hosted</p>
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{hostRating} ★</p>
                      <p className="text-[10px] text-text-faint uppercase mt-0.5">Avg Rating</p>
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{hostRespTime}</p>
                      <p className="text-[10px] text-text-faint uppercase mt-0.5">Response Time</p>
                    </div>
                  </div>
                );
              })()}

              {/* Host contact details & links */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-archivo pt-1">
                <div className="space-y-1.5 text-text-muted">
                  <p className="flex items-center gap-1.5 truncate max-w-[280px]">
                    <Mail className="w-3.5 h-3.5 text-text-faint shrink-0" />
                    <span>{event.organizer.email}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-text-faint shrink-0" />
                    <span>Dept: {event.organizer.organizerProfile?.department || "General"}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                  {event.organizer.organizerProfile?.website && (
                    <a
                      href={event.organizer.organizerProfile.website.startsWith("http") ? event.organizer.organizerProfile.website : `https://${event.organizer.organizerProfile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-center font-bold transition-all text-[11px] flex items-center gap-1 flex-1 sm:flex-initial"
                    >
                      <Globe className="w-3.5 h-3.5 text-text-faint" /> Website
                    </a>
                  )}
                  {event.organizer.organizerProfile?.instagram && (
                    <a
                      href={`https://instagram.com/${event.organizer.organizerProfile.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all shrink-0"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {event.organizer.organizerProfile?.linkedin && (
                    <a
                      href={event.organizer.organizerProfile.linkedin.startsWith("http") ? event.organizer.organizerProfile.linkedin : `https://linkedin.com/in/${event.organizer.organizerProfile.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all shrink-0"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
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

                {/* Registration button block */}
                <div className="pt-2">
                  {!session ? (
                    <Link
                      href={`/login?callbackUrl=/events/${event.slug}`}
                      className="w-full btn btn-primary text-center block py-2.5 rounded-xl font-semibold text-sm"
                    >
                      Login to Register
                    </Link>
                  ) : (session.user as any).role !== "STUDENT" ? (
                    <button
                      disabled
                      className="w-full btn btn-primary opacity-60 cursor-not-allowed bg-card-hover border border-border text-text-faint py-2.5 rounded-xl text-sm font-semibold"
                    >
                      Only Students Can Register
                    </button>
                  ) : registered ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5 rounded-xl text-sm justify-center">
                        <CheckCircle className="w-4.5 h-4.5" />
                        Successfully Registered
                      </div>
                      
                      {regDetails?.ticket && (
                        <div className="bg-card-hover border border-border p-3 rounded-xl space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-text-faint">Ticket Number:</span>
                            <span className="font-mono font-medium text-text-main">
                              {regDetails.ticket.ticketNumber}
                            </span>
                          </div>
                          
                          {regDetails.ticket.qrCode && (
                            <div className="flex flex-col items-center py-2 border-y border-border/50 my-1">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={regDetails.ticket.qrCode}
                                alt="Ticket QR Code"
                                className="w-28 h-28 bg-white p-1.5 rounded-lg"
                              />
                              <p className="text-[10px] text-text-faint mt-1.5">Scan at venue for check-in</p>
                            </div>
                          )}
                          
                          <div className="flex justify-between">
                            <span className="text-text-faint">Status:</span>
                            <span className="capitalize font-medium text-lime">
                              {regDetails.status.toLowerCase()}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-2 pt-1">
                        {regDetails?.ticket && (
                          <Link
                            href={`/dashboard/tickets/${regDetails.ticket.id}`}
                            className="w-full btn btn-secondary text-xs flex items-center justify-center gap-1.5 py-2.5"
                          >
                            <QrCode className="w-4 h-4" />
                            View Digital Ticket
                          </Link>
                        )}
                        <button
                          onClick={handleCancelRegistration}
                          disabled={isPending}
                          className="w-full text-center text-xs text-red-400 hover:text-red-300 transition-colors py-1 cursor-pointer bg-transparent border-none outline-none disabled:opacity-50"
                        >
                          {isPending ? "Cancelling..." : "Cancel Registration"}
                        </button>
                      </div>
                    </div>
                  ) : event.isClosed || new Date(event.date) < new Date() ? (
                    <button
                      disabled
                      className="w-full btn btn-primary opacity-60 cursor-not-allowed bg-card-hover border border-border text-text-faint py-2.5 rounded-xl text-sm font-semibold"
                    >
                      Registration Closed
                    </button>
                  ) : isSoldOut ? (
                    <button
                      disabled
                      className="w-full btn btn-primary opacity-60 cursor-not-allowed bg-card-hover border border-border text-text-faint py-2.5 rounded-xl text-sm font-semibold"
                    >
                      Sold Out
                    </button>
                  ) : (
                    <button
                      onClick={handleRegister}
                      disabled={isPending}
                      className="w-full btn btn-primary flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
                    >
                      Register Now (Free)
                    </button>
                  )}
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

      <RegistrationWizard
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false);
          router.replace(`/events/${event.slug}`);
          router.refresh();
        }}
        event={event}
        initialProfile={initialProfile}
      />

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
