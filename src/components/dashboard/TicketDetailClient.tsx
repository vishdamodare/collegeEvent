"use client";

import { useRef, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  Share2,
  Printer,
  CalendarCheck,
  User,
  GraduationCap,
  Copy,
  MessageCircle,
  FileDown,
  Smartphone,
  ShieldCheck,
} from "lucide-react";
import { RegistrationStatusBadge } from "@/components/shared/RegistrationStatusBadge";
import { toast } from "sonner";
import { incrementTicketDownloadCount, recordTicketShared } from "@/actions/registrations";
import { EventGridCard } from "@/components/events/EventGridCard";

interface TicketDetailClientProps {
  ticket: {
    id: string;
    ticketNumber: string;
    qrCode: string | null;
    status: string;
    issuedAt: Date;
    event: {
      id: string;
      title: string;
      date: Date | string;
      location: string;
      description: string;
      category: { name: string; color?: string | null };
      images: Array<{ url: string }>;
    };
    student: {
      college: string;
      branch: string;
      academicYear: string;
      user: {
        name: string;
        email: string;
      };
    };
    registration: {
      status: string;
      checkedIn: boolean;
      checkedInAt: Date | string | null;
      timeline: any;
      teamName?: string | null;
    };
  };
  moreEvents?: any[];
}

export function TicketDetailClient({ ticket, moreEvents = [] }: TicketDetailClientProps) {
  const [isPending, startTransition] = useTransition();
  const ticketRef = useRef<HTMLDivElement>(null);
  const heroImage = ticket.event.images[0]?.url;
  const eventOrganizerName = (ticket.event as any).organizer?.name || "Host";
  const eventOrganizerCollege = (ticket.event as any).organizer?.organizerProfile?.college || "Campus";

  const eventDate = new Date(ticket.event.date);

  const googleCalendarUrl = () => {
    const title = encodeURIComponent(ticket.event.title);
    const details = encodeURIComponent(ticket.event.description || "");
    const location = encodeURIComponent(ticket.event.location);
    const startDate = eventDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endDate = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
  };

  const handlePrint = () => {
    startTransition(async () => {
      await incrementTicketDownloadCount(ticket.id);
      window.print();
    });
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/dashboard/tickets/${ticket.id}`;
    await navigator.clipboard.writeText(url);
    toast.success("Ticket link copied to clipboard!");
    recordTicketShared(ticket.id);
  };

  const handleWhatsAppShare = () => {
    const message = `🎉 I'm registered for ${ticket.event.title}! \n\n🎫 Ticket Number: ${ticket.ticketNumber}\n📍 Venue: ${ticket.event.location}\n📅 Date: ${format(eventDate, "eeee, MMMM d, yyyy")}\n\nView Ticket: ${window.location.origin}/dashboard/tickets/${ticket.id}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    recordTicketShared(ticket.id);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ticket: ${ticket.event.title}`,
          text: `Here is my ticket for ${ticket.event.title}`,
          url: `${window.location.origin}/dashboard/tickets/${ticket.id}`,
        });
        recordTicketShared(ticket.id);
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between no-print">
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center gap-2 text-sm text-text-faint hover:text-lime transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>
        <span className="text-xs text-text-faint">
          Issued on {format(new Date(ticket.issuedAt), "MMM d, yyyy 'at' h:mm a")}
        </span>
      </div>

      {/* Printable Ticket Card wrapper */}
      <div
        ref={ticketRef}
        className="rounded-3xl border border-border bg-card overflow-hidden shadow-2xl relative print-card"
        style={{ contentVisibility: "auto" }}
      >
        {/* Print Only Title */}
        <div className="hidden print:block text-center py-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-black uppercase">CollegeEvents Entry Ticket</h1>
          <p className="text-xs text-gray-500">Present this QR code at the registration desk</p>
        </div>

        {/* Hero image header */}
        <div className="relative aspect-[21/9] w-full no-print">
          {heroImage ? (
            <Image
              src={heroImage}
              alt={ticket.event.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cobalt/20 to-card-hover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          <div className="absolute bottom-4 left-6">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
              style={{
                backgroundColor: ticket.event.category.color ? `${ticket.event.category.color}20` : "rgba(255,255,255,.08)",
                borderColor: ticket.event.category.color ? `${ticket.event.category.color}30` : "rgba(255,255,255,.1)",
                color: ticket.event.category.color || "#fff",
              }}
            >
              {ticket.event.category.name}
            </span>
          </div>
        </div>

        {/* Ticket content body */}
        <div className="p-6 md:p-8 space-y-6 bg-card print:bg-white print:text-black">
          {/* Main info row */}
          <div className="flex flex-col md:flex-row justify-between gap-6 pb-6 border-b border-border/60 print:border-gray-200">
            <div className="space-y-3 flex-1">
              <h2 className="text-2xl md:text-3xl font-bold leading-tight print:text-black">
                {ticket.event.title}
              </h2>
              <div className="flex flex-col gap-2 text-sm text-text-muted print:text-gray-700">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-lime shrink-0 print:text-black" />
                  {format(eventDate, "eeee, MMMM d, yyyy")}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cobalt shrink-0 print:text-black" />
                  {format(eventDate, "h:mm a")}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-coral shrink-0 print:text-black" />
                  {ticket.event.location}
                </span>
              </div>
            </div>

            {/* QR block */}
            <div className="flex flex-col items-center justify-center shrink-0 border border-border/50 bg-card-hover p-4 rounded-2xl print:border-gray-200 print:bg-white">
              {ticket.qrCode ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ticket.qrCode}
                  alt="Entry QR Code"
                  className="w-36 h-36 bg-white p-2 rounded-xl"
                />
              ) : (
                <div className="w-36 h-36 bg-card-hover flex items-center justify-center rounded-xl">
                  <span className="text-[10px] text-text-faint">No QR Available</span>
                </div>
              )}
              <div className="text-center mt-3 space-y-1">
                <span className="text-[10px] uppercase font-bold text-text-faint tracking-wider print:text-gray-500 block">
                  Ticket Code
                </span>
                <span className="font-mono font-bold text-sm text-text-main print:text-black block">
                  {ticket.ticketNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Attendee details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-bold tracking-wider text-text-faint print:text-gray-500">
                Attendee & Host Information
              </h4>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-lime/10 flex items-center justify-center text-lime shrink-0 print:bg-gray-100 print:text-black">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-text-faint print:text-gray-500 leading-none">Attendee Name</p>
                    <p className="text-sm font-semibold text-text-main print:text-black mt-0.5">
                      {ticket.student.user.name} {ticket.registration.teamName ? `(Team: ${ticket.registration.teamName})` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cobalt/10 flex items-center justify-center text-cobalt shrink-0 print:bg-gray-100 print:text-black">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-text-faint print:text-gray-500 leading-none">College & Department</p>
                    <p className="text-sm font-semibold text-text-main print:text-black mt-0.5">
                      {ticket.student.college} • {ticket.student.branch} ({ticket.student.academicYear})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-t border-white/5 pt-2.5">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0 print:bg-gray-100 print:text-black">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-text-faint print:text-gray-500 leading-none">Host Institution</p>
                    <p className="text-sm font-semibold text-text-main print:text-black mt-0.5">
                      {eventOrganizerCollege} (Organized by {eventOrganizerName})
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs uppercase font-bold tracking-wider text-text-faint print:text-gray-500">
                Registration Status
              </h4>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card-hover print:border-gray-200 print:bg-white print:text-black">
                  <span className="text-xs text-text-muted print:text-gray-700">Ticket Status:</span>
                  <RegistrationStatusBadge status={ticket.registration.status} size="sm" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card-hover print:border-gray-200 print:bg-white print:text-black">
                  <span className="text-xs text-text-muted print:text-gray-700">Attendance:</span>
                  <span
                    className={`text-xs font-bold ${
                      ticket.registration.checkedIn ? "text-lime" : "text-text-faint print:text-gray-600"
                    }`}
                  >
                    {ticket.registration.checkedIn ? "Checked In (Present)" : "Pending Check-In"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Timeline Step Indicator */}
          {ticket.registration.timeline && (
            <div className="pt-6 border-t border-border/60 print:border-gray-200 space-y-4">
              <h4 className="text-xs uppercase font-bold tracking-wider text-text-faint print:text-gray-500">
                Registration History & Progress
              </h4>
              <div className="relative flex flex-col sm:flex-row justify-between gap-4 py-2">
                {/* Horizontal line for desktop stepper */}
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-border/40 hidden sm:block z-0" />
                
                {(() => {
                  let timeline = [];
                  try {
                    timeline = typeof ticket.registration.timeline === 'string'
                      ? JSON.parse(ticket.registration.timeline)
                      : ticket.registration.timeline;
                  } catch(e) {
                    timeline = [];
                  }
                  
                  if (!Array.isArray(timeline)) timeline = [];
                  
                  return timeline.map((item: any, idx: number) => (
                    <div key={idx} className="flex sm:flex-col items-center text-center gap-3 relative z-10 flex-1">
                      <div className="w-8 h-8 rounded-full bg-lime text-black font-bold flex items-center justify-center text-xs shrink-0 shadow-lg shadow-lime/20">
                        {idx + 1}
                      </div>
                      <div className="text-left sm:text-center">
                        <p className="text-xs font-bold text-white leading-tight">{item.label}</p>
                        <p className="text-[10px] text-text-faint mt-0.5 font-medium">
                          {format(new Date(item.time), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* Event Instructions / Rules */}
          <div className="pt-6 border-t border-border/60 print:border-gray-200 space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-text-faint print:text-gray-500">
              Entry Guidelines & Instructions
            </h4>
            <ul className="list-disc pl-4 text-xs text-text-faint space-y-1.5 print:text-gray-700">
              <li>Please keep this digital ticket ready on your device or bring a printed copy.</li>
              <li>Present the QR code at the event entrance for verification.</li>
              <li>Carry a valid college ID along with this ticket for confirmation.</li>
              <li>Registration is non-transferable. Duplicate entries are strictly prohibited.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 no-print">
        <button
          onClick={handlePrint}
          disabled={isPending}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-card border border-border text-text-muted hover:text-text-main hover:border-border-bright transition-all font-semibold text-sm cursor-pointer disabled:opacity-50"
        >
          <Printer className="w-4.5 h-4.5" />
          Print / Save PDF
        </button>

        <button
          onClick={handleWhatsAppShare}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all font-semibold text-sm cursor-pointer"
        >
          <MessageCircle className="w-4.5 h-4.5" />
          Share WhatsApp
        </button>

        <button
          onClick={handleNativeShare}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-lime/10 border border-lime/20 text-lime hover:bg-lime/20 transition-all font-semibold text-sm cursor-pointer"
        >
          <Share2 className="w-4.5 h-4.5" />
          Share Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 no-print">
        <a
          href={googleCalendarUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-card border border-border text-text-muted hover:text-text-main hover:border-border-bright transition-all font-semibold text-sm text-center"
        >
          <CalendarCheck className="w-4.5 h-4.5" />
          Add to Calendar
        </a>
        
        <button
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-card border border-border text-text-muted hover:text-text-main hover:border-border-bright transition-all font-semibold text-sm cursor-pointer"
        >
          <Copy className="w-4.5 h-4.5" />
          Copy Ticket Link
        </button>

        <button
          onClick={() => {
            toast.info("Apple Wallet integration is ready. Mobile pass generation will be enabled when production keys are active.", { duration: 5000 });
          }}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-card border border-border text-text-muted hover:text-text-main hover:border-border-bright transition-all font-semibold text-sm cursor-pointer"
        >
          <Smartphone className="w-4.5 h-4.5 text-orange-400" />
          Add to Apple Wallet
        </button>
      </div>

      {/* More by same Event Owner */}
      {moreEvents && moreEvents.length > 0 && (
        <div className="mt-16 pt-10 border-t border-white/10 no-print space-y-6">
          <div>
            <h3 className="text-xl font-bold font-anton uppercase tracking-wider text-white">
              More by {eventOrganizerCollege}
            </h3>
            <p className="text-xs text-text-muted mt-1">Discover other exciting events hosted by this organizer</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {moreEvents.map((re: any, i: number) => {
              const heroImg = re.images.find((img: any) => img.isHero)?.url || re.images[0]?.url || "";
              const locationParts = re.location.split(",");
              const venue = locationParts[0]?.trim() || re.location;
              const college = locationParts.length > 1 ? locationParts.slice(1).join(",").trim() : "Campus";
              
              return (
                <EventGridCard
                  key={re.id}
                  id={re.id}
                  slug={re.slug}
                  title={re.title}
                  description={re.description}
                  date={new Date(re.date)}
                  location={re.location}
                  capacity={re.capacity}
                  status={re.status}
                  categoryName={re.category.name}
                  categoryColor={re.category.color}
                  imageUrl={heroImg}
                  organizerName={eventOrganizerName}
                  registrationCount={re._count?.registrations || 0}
                  savedCount={0}
                  index={i}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Global CSS Inject to support prints nicely */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card {
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}
