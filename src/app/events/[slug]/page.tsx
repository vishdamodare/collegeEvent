import { appUrl } from "@/lib/app-url";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventBySlug, getEventsByOrganizer } from "@/actions/events";
import { EventDetailClient } from "./EventDetailClient";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { PublicEventDetails } from "@/components/events/EventExtraDetails";
import { cache } from "react";

// generateMetadata and the page both need the event — fetch it once per request
const getEvent = cache(getEventBySlug);

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    return { title: "Event Not Found — CollegeEvents" };
  }

  const heroImage = event.images.find((i) => i.isHero)?.url || event.images[0]?.url;

  return {
    title: `${event.title} — CollegeEvents`,
    description: event.description.slice(0, 160),
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: {
      title: event.title,
      description: event.description.slice(0, 160),
      type: "article",
      images: heroImage ? [{ url: heroImage, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description.slice(0, 160),
      images: heroImage ? [heroImage] : [],
    },
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    notFound();
  }

  // Independent lookups run in parallel — each Neon round trip is ~0.5s from here
  const [relatedEvents, session, row] = await Promise.all([
    getEventsByOrganizer(event.organizerId, event.id),
    auth.api.getSession({ headers: await headers() }),
    prisma.event.findUnique({
      where: { id: event.id },
      select: { details: true }, // explicit select overrides the global omit
    }),
  ]);
  const user = session?.user;

  // Drafts/archived/cancelled events are only visible to their organizer (preview) or a super admin
  const isPublic = event.status === "PUBLISHED" || event.status === "COMPLETED";
  if (!isPublic && user?.id !== event.organizerId && user?.role !== "SUPER_ADMIN") {
    notFound();
  }

  let isRegistered = false;
  let registrationDetails: any = null;

  let profile = null;
  if (user && user.role === "STUDENT") {
    profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: { name: true, email: true },
        },
        // Same round trip: this student's registration for this event, if any
        registrations: { where: { eventId: event.id }, include: { ticket: true }, take: 1 },
      },
    });
    if (profile) {
      const registration = profile.registrations[0];
      if (registration) {
        isRegistered = registration.status === "CONFIRMED" || registration.status === "CHECKED_IN";
        registrationDetails = {
          id: registration.id,
          status: registration.status,
          checkedIn: registration.checkedIn,
          registeredAt: registration.registeredAt.toISOString(),
          ticket: registration.ticket
            ? {
                id: registration.ticket.id,
                ticketNumber: registration.ticket.ticketNumber,
                qrCode: registration.ticket.qrCode,
                status: registration.ticket.status,
              }
            : null,
        };
      }
    }
  }

  const details = toPublicDetails(row?.details, isRegistered);

  // schema.org Event lets Google show this in event search results (date, venue, image)
  const heroImage = event.images.find((i) => i.isHero)?.url || event.images[0]?.url;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description.slice(0, 300),
    startDate: event.date.toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: event.location, address: event.location },
    ...(heroImage ? { image: [heroImage] } : {}),
    url: `${appUrl}/events/${event.slug}`,
  };

  return (
    <>
    <script
      type="application/ld+json"
      // Escape "<" so event text can't close the script tag
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
    <EventDetailClient
      event={event}
      details={details}
      relatedEvents={relatedEvents}
      isRegistered={isRegistered}
      registrationDetails={registrationDetails}
      initialProfile={profile}
    />
    </>
  );
}

// Only what students may see: coupon codes and admin settings never leave the server,
// online meeting link/password only for registered students.
function toPublicDetails(raw: unknown, isRegistered: boolean): PublicEventDetails | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as any;
  return {
    end: d.schedule?.end || null,
    registrationCloses: d.schedule?.registrationCloses || null,
    venueType: d.venue?.venueType || "OFFLINE",
    address: d.venue?.address || "",
    googleMapsLink: d.venue?.googleMapsLink || "",
    platform: d.venue?.venueType !== "OFFLINE" ? d.venue?.platform || "" : "",
    meetingLink: isRegistered ? d.venue?.meetingLink || "" : "",
    meetingPassword: isRegistered ? d.venue?.password || "" : "",
    isFree: d.pricing?.isFree ?? true,
    fee: Number(d.pricing?.fee) || 0,
    tickets: d.pricing?.ticketingEnabled
      ? (d.pricing?.tickets || []).map((t: any) => ({ name: t.name, price: Number(t.price) || 0, description: t.description || "" }))
      : [],
    refundPolicy: d.pricing?.refundPolicy || "",
    rules: {
      eligibility: d.rules?.eligibility || "",
      requirements: d.rules?.requirements || "",
      instructions: d.rules?.instructions || "",
      dressCode: d.rules?.dressCode || "",
      codeOfConduct: d.rules?.codeOfConduct || "",
      judgingCriteria: d.rules?.judgingCriteria || "",
    },
    prizes: (d.rules?.prizes || []).filter((p: any) => p?.title),
    faqs: (d.rules?.faqs || []).filter((f: any) => f?.question),
    contact: {
      name: d.contact?.coordinatorName || "",
      email: d.contact?.coordinatorEmail || "",
      phone: d.contact?.coordinatorPhone || "",
    },
    sponsors: (d.sponsors || [])
      .filter((s: any) => s?.name && s.visibility !== false)
      .map((s: any) => ({ name: s.name, category: s.category, logoUrl: s.logoUrl || "", websiteUrl: s.websiteUrl || "" })),
    links: {
      promoVideo: d.media?.promoVideoUrl || "",
      brochure: d.media?.brochurePdfUrl || "",
      rulebook: d.media?.rulebookPdfUrl || "",
    },
  };
}
