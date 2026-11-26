"use client";

import { useState, useTransition } from "react";
import { EventExtraDetails, priceLabel, type PublicEventDetails } from "@/components/events/EventExtraDetails";
import Image from "next/image";
import Link from "next/link";
import { campusFor } from "@/lib/campuses";
import { motion, MotionConfig } from "framer-motion";
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
import { authClient, signInWithGoogle } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { cancelRegistration } from "@/actions/registrations";
import { RegistrationWizard, type WizardProfile } from "@/components/shared/RegistrationWizard";
import { toast } from "sonner";
import { CheckInWatcher } from "@/components/dashboard/CheckInWatcher";
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
      totalEvents?: number;
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
  initialProfile?: WizardProfile | null;
  details?: PublicEventDetails | null;
}

export function EventDetailClient({
  event,
  relatedEvents,
  isRegistered: initialIsRegistered = false,
  registrationDetails: initialRegDetails = null,
  initialProfile = null,
  details = null,
}: EventDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = authClient.useSession();
  const [heroFailed, setHeroFailed] = useState(false);
  const [registered, setRegistered] = useState(initialIsRegistered);
  const [regDetails, setRegDetails] = useState(initialRegDetails);
  const [isPending, startTransition] = useTransition();
  const [wizardOpened, setIsWizardOpen] = useState(false);
  // ?register=true (back from login) opens the wizard once the student session is known
  const autoOpen =
    searchParams.get("register") === "true" &&
    (session?.user as { role?: string } | undefined)?.role === "STUDENT" &&
    !registered;
  const isWizardOpen = wizardOpened || autoOpen;

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
    if (!session) {
      // Straight to Google; /auth-callback brings them back here with ?register=true so the wizard opens
      signInWithGoogle(`/events/${event.slug}?register=true`).then(({ error }) => {
        if (error) toast.error(error.message || "Couldn't reach Google sign-in. Please try again.");
      });
      return;
    }
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
    <MotionConfig reducedMotion="user">
    <main className="min-h-screen bg-background text-text-main">
      <Navbar isAuthenticated={!!session} onLogout={handleLogout} />

      {/* Mobile / tablet: photo up top, then title, host and key facts as an icon list */}
      <div className="lg:hidden pt-[72px]">
        <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full overflow-hidden rounded-b-[28px] bg-card">
          {heroImage && !heroFailed ? (
            <Image
              onError={() => setHeroFailed(true)}
              src={heroImage}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-cobalt/30 to-card" />
          )}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent" aria-hidden />
          <Link
            href="/events"
            aria-label="Back to events"
            className="absolute top-3 left-4 w-10 h-10 rounded-full bg-black/45 backdrop-blur flex items-center justify-center text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share this event"
            className="absolute top-3 right-4 w-10 h-10 rounded-full bg-black/45 backdrop-blur flex items-center justify-center text-white cursor-pointer touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Share2 className="w-[18px] h-[18px]" aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border border-border bg-card text-text-main">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: event.category.color || "var(--color-lime)" }} />
              {event.category.name}
            </span>
            <StatusBadge status={event.status} />
          </div>
          <h1 className="mt-3 text-[28px] leading-[1.12] font-anton tracking-tight text-text-main text-balance">{event.title}</h1>

          {(() => {
            const campus = campusFor(event.organizer.organizerProfile?.college);
            const hostName = campus?.name ?? event.organizer.organizerProfile?.college ?? event.organizer.name;
            const inner = (
              <>
                <span className="relative w-9 h-9 rounded-lg bg-white overflow-hidden shrink-0 flex items-center justify-center text-black font-bold text-sm">
                  {campus?.logo ? <Image src={campus.logo} alt="" fill className="object-contain p-1" sizes="36px" /> : hostName.charAt(0)}
                </span>
                <span className="min-w-0 text-sm leading-tight">
                  <span className="block text-text-faint">Hosted by</span>
                  <span className="block font-semibold text-text-main truncate">{hostName}</span>
                </span>
              </>
            );
            return campus ? (
              <Link href={`/colleges/${campus.slug}`} className="mt-4 flex items-center gap-3 min-w-0">{inner}</Link>
            ) : (
              <div className="mt-4 flex items-center gap-3 min-w-0">{inner}</div>
            );
          })()}

          <ul className="mt-6 space-y-5">
            {[
              {
                icon: Calendar,
                title: format(new Date(event.date), "EEE, MMM d, yyyy"),
                sub: `Starts ${format(new Date(event.date), "h:mm a")}`,
              },
              {
                icon: MapPin,
                title: event.location,
                sub: (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lime font-medium"
                  >
                    Open in Google Maps
                  </a>
                ),
              },
              {
                icon: Users,
                title: `${priceLabel(details)} entry`,
                sub: (
                  <>
                    <span>{isSoldOut ? "Sold out" : `${seatsLeft.toLocaleString()} of ${event.capacity.toLocaleString()} seats left`}</span>
                    <span className="mt-2 block h-1.5 rounded-full bg-card-hover overflow-hidden" aria-hidden="true">
                      <span
                        className="block h-full rounded-full bg-lime"
                        style={{ width: `${Math.min(100, (event._count.registrations / event.capacity) * 100)}%` }}
                      />
                    </span>
                  </>
                ),
              },
            ].map(({ icon: Icon, title, sub }, i) => (
              <li key={i} className="flex items-start gap-3.5">
                <span className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center text-lime bg-[color-mix(in_srgb,var(--color-lime)_14%,transparent)]">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 pt-0.5">
                  <span className="block font-semibold text-text-main leading-snug">{title}</span>
                  <span className="block text-sm text-text-muted mt-0.5">{sub}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Desktop hero: photo with the title on a dark scrim (works in light and dark), then a ticket-stub fact bar */}
      <div className="hidden lg:block max-w-6xl mx-auto px-5 pt-28">
        <div className="relative w-full min-h-[320px] sm:min-h-[400px] rounded-[22px] sm:rounded-[28px] overflow-hidden border border-border bg-card">
          {heroImage && !heroFailed ? (
            <Image
              onError={() => setHeroFailed(true)}
              src={heroImage}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1152px) 100vw, 1152px"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-cobalt/30 to-card" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" aria-hidden />

          <Link
            href="/events"
            className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-black/45 backdrop-blur px-3.5 py-1.5 text-sm text-white/90 hover:bg-black/65 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            All events
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-0 inset-x-0 p-5 sm:p-9 pb-12 sm:pb-14"
          >
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-white/15 backdrop-blur text-white">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: event.category.color || "var(--color-lime)" }} />
                {event.category.name}
              </span>
              <StatusBadge status={event.status} />
            </div>
            <h1 className="text-3xl sm:text-5xl font-anton tracking-tight text-white leading-[1.05] max-w-3xl text-balance">
              {event.title}
            </h1>
          </motion.div>
        </div>

        {/* Fact bar: the four things a student checks first. It overlaps the hero like a ticket stub. */}
        <dl className="relative z-10 -mt-7 mx-3 sm:mx-8 grid grid-cols-2 lg:grid-cols-4 rounded-2xl border border-border bg-[color-mix(in_srgb,var(--color-text-main)_6%,var(--color-background))] shadow-[0_18px_40px_-20px_rgba(0,0,0,.5)] overflow-hidden">
          {[
            { icon: Calendar, label: "Date", value: format(new Date(event.date), "EEE, MMM d, yyyy"), cls: "" },
            { icon: Clock, label: "Starts", value: format(new Date(event.date), "h:mm a"), cls: "border-l" },
            { icon: MapPin, label: "Venue", value: event.location, cls: "col-span-2 border-t lg:col-span-1 lg:border-t-0 lg:border-l" },
            {
              icon: Users,
              label: "Entry",
              value: `${priceLabel(details)} · ${isSoldOut ? "sold out" : `${seatsLeft.toLocaleString()} seats left`}`,
              cls: "col-span-2 border-t lg:col-span-1 lg:border-t-0 lg:border-l",
            },
          ].map(({ icon: Icon, label, value, cls }) => (
            <div key={label} className={cn("p-4 sm:p-5 border-dashed border-border", cls)}>
              <dt className="flex items-center gap-1.5 text-xs text-text-faint">
                <Icon className="w-3.5 h-3.5" aria-hidden="true" /> {label}
              </dt>
              <dd className="mt-1 text-sm sm:text-[15px] font-semibold text-text-main leading-snug lg:line-clamp-2">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="max-w-6xl mx-auto px-5 pt-8 lg:pt-10 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-bold font-[family-name:var(--font-archivo)] normal-case text-text-main">
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
                <h2 className="text-xl font-bold font-[family-name:var(--font-archivo)] normal-case text-text-main">
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

            {details && <EventExtraDetails details={details} />}

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
                  {/* College logo when we have it, otherwise initials */}
                  {(() => {
                    const logo = campusFor(event.organizer.organizerProfile?.college)?.logo;
                    if (logo) {
                      return (
                        <div className="relative w-14 h-14 rounded-xl bg-white shrink-0 overflow-hidden">
                          <Image src={logo} alt="" fill className="object-contain p-1.5" sizes="56px" />
                        </div>
                      );
                    }
                    const college = event.organizer.organizerProfile?.college || "College";
                    const words = college
                      .replace(/\b(of|and|the|engineering|technology|college|institute|university)\b/gi, "")
                      .trim()
                      .split(/\s+/);
                    const initials = words.length >= 2 ? words[0][0] + words[1][0] : words[0].substring(0, 3);
                    return (
                      <div className="w-12 h-12 rounded-xl bg-[var(--color-cobalt)]/10 border border-[var(--color-cobalt)]/20 flex items-center justify-center font-bold text-[var(--color-cobalt)] text-[15px] shrink-0">
                        {initials.toUpperCase()}
                      </div>
                    );
                  })()}

                  <div>
                    <span className="text-[10px] text-text-faint block uppercase font-bold tracking-wider leading-none mb-1">Hosted by</span>
                    {(() => {
                      // Link only to real campus pages (same mapping /colleges uses); free-typed names stay plain text
                      const campus = campusFor(event.organizer.organizerProfile?.college);
                      return campus ? (
                        <Link
                          href={`/colleges/${campus.slug}`}
                          className="text-base font-bold text-text-main hover:text-[var(--color-lime)] hover:underline leading-tight transition-colors"
                        >
                          {campus.name}
                        </Link>
                      ) : (
                        <span className="text-base font-bold text-text-main leading-tight">
                          {event.organizer.organizerProfile?.college || "College Campus"}
                        </span>
                      );
                    })()}
                    <span className="text-xs text-text-muted mt-1.5 block">
                      Organized by <span className="text-text-main font-semibold">{event.organizer.name}</span> • {event.organizer.organizerProfile?.position || "Coordinator"}
                    </span>
                  </div>
                </div>

                {/* Organizer Profile Pic */}
                <div className="w-10 h-10 rounded-full overflow-hidden bg-card border border-border relative shrink-0">
                  {event.organizer.image ? (
                    <Image src={event.organizer.image} alt={event.organizer.name} fill className="object-cover" sizes="40px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-card-hover text-text-faint">
                      {event.organizer.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              {/* Host description if available */}
              {event.organizer.organizerProfile?.description && (
                <p className="text-xs text-text-muted leading-relaxed font-archivo italic border-l-2 border-border pl-3">
                  &quot;{event.organizer.organizerProfile.description}&quot;
                </p>
              )}

              {/* Only the real number: no invented ratings or response times */}
              {(() => {
                const totalPublished = event.organizer.totalEvents || 1;
                return (
                  <p className="text-sm text-text-muted border-y border-border/50 py-4">
                    <span className="font-bold text-text-main">{totalPublished}</span>{" "}
                    {totalPublished === 1 ? "event" : "events"} hosted on CollegeEvent
                  </p>
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
                      className="px-3 py-2 rounded-lg bg-card-hover border border-border hover:border-border-bright text-center font-bold transition-all text-[11px] flex items-center gap-1 flex-1 sm:flex-initial"
                    >
                      <Globe className="w-3.5 h-3.5 text-text-faint" /> Website
                    </a>
                  )}
                  {event.organizer.organizerProfile?.instagram && (
                    <a
                      href={`https://instagram.com/${event.organizer.organizerProfile.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-card-hover border border-border hover:border-border-bright flex items-center justify-center text-text-muted hover:text-text-main transition-all shrink-0"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {event.organizer.organizerProfile?.linkedin && (
                    <a
                      href={event.organizer.organizerProfile.linkedin.startsWith("http") ? event.organizer.organizerProfile.linkedin : `https://linkedin.com/in/${event.organizer.organizerProfile.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-card-hover border border-border hover:border-border-bright flex items-center justify-center text-text-muted hover:text-text-main transition-all shrink-0"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar: right under the fact bar on mobile, beside the content on desktop */}
          <div className={cn("space-y-6 lg:order-2", registered ? "order-1" : "order-3")}>
            {/* Registration card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              id="register-card" className="rounded-2xl border border-border bg-card p-6 sticky top-28 scroll-mt-24"
            >
              <div className="space-y-4">
                <div className="hidden lg:flex items-center justify-between">
                  <span className="text-sm text-text-faint">Entry fee</span>
                  <span className="text-lg font-bold text-text-main">{priceLabel(details)}</span>
                </div>

                {/* Seats info */}
                <div className="hidden lg:flex items-center justify-between">
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
                    <button
                      onClick={handleRegister}
                      className="w-full btn btn-primary text-center block py-2.5 rounded-xl font-semibold text-sm cursor-pointer"
                    >
                      Register Now
                    </button>
                  ) : (session.user as { role?: string }).role !== "STUDENT" ? (
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
                                className="w-56 h-56 bg-white p-1.5 rounded-lg"
                              />
                              <p className="text-[10px] text-text-faint mt-1.5">Scan at venue for check-in</p>
                            </div>
                          )}

                          <CheckInWatcher
                            ticketId={regDetails.ticket.id}
                            eventTitle={event.title}
                            initialCheckedIn={regDetails.checkedIn}
                          />
                          
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
                      disabled={isPending || priceLabel(details) !== "Free"}
                      className="w-full btn btn-primary flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {priceLabel(details) === "Free" ? "Register Now (Free)" : "Online payment coming soon"}
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-border">
                  <SaveButton eventId={event.id} size="md" showLabel className="flex-1 rounded-xl" />
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 p-2 rounded-xl border border-border bg-card text-text-faint hover:text-text-main hover:border-border-bright transition-all text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
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
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-5 -mx-5 px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0 sm:pb-0 sm:overflow-visible sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
              {relatedEvents.map((re, i) => (
                <div key={re.id} className="snap-start shrink-0 w-[78%] sm:w-auto">
                <EventGridCard
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
                </div>
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

      {/* Mobile: pinned bar with the price and the one action that matters */}
      {(() => {
        const role = (session?.user as { role?: string } | undefined)?.role;
        const ended = event.isClosed || new Date(event.date) < new Date();
        const free = priceLabel(details) === "Free";
        const base = "ml-auto shrink-0 rounded-xl px-7 py-3.5 text-[15px] font-semibold touch-manipulation";
        let action: React.ReactNode;
        if (registered) {
          action = <a href="#register-card" className={`btn btn-primary ${base}`}>My ticket</a>;
        } else if (ended || isSoldOut || !free || (session && role !== "STUDENT")) {
          const label = ended ? "Closed" : isSoldOut ? "Sold out" : !free ? "Payment soon" : "Students only";
          action = <span className={`${base} bg-card-hover border border-border text-text-faint`}>{label}</span>;
        } else {
          action = <button type="button" onClick={handleRegister} className={`btn btn-primary cursor-pointer ${base}`}>Register</button>;
        }
        return (
          <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 px-5 pt-3 pb-[max(14px,env(safe-area-inset-bottom))] bg-[color-mix(in_srgb,var(--color-background)_92%,transparent)] backdrop-blur-md border-t border-border flex items-center gap-4">
            <div className="min-w-0">
              <div className="text-lg font-bold leading-tight">{priceLabel(details)}</div>
              <div className="text-xs text-text-faint">
                {isSoldOut ? "Sold out" : `${seatsLeft.toLocaleString()} seats left`}
              </div>
            </div>
            {action}
          </div>
        );
      })()}
      {/* Space so the pinned bar never covers the footer's last line */}
      <div className="h-20 lg:hidden" aria-hidden />
    </main>
    </MotionConfig>
  );
}
