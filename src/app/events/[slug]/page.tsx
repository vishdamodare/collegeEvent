import type { ComponentProps } from "react";
import type { AdminEvent } from "@/types/admin";
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
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl, breadcrumbLd, clip, istDate } from "@/lib/seo";
import { campusFor } from "@/lib/campuses";

// generateMetadata and the page both need the event — fetch it once per request
const getEvent = cache(getEventBySlug);

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    return { title: "Event not found — CollegeEvent", robots: { index: false, follow: true } };
  }

  const heroImage = event.images.find((i) => i.isHero)?.url || event.images[0]?.url;
  const college = campusFor(event.organizer.organizerProfile?.college)?.name ?? event.organizer.organizerProfile?.college;
  const isPublic = event.status === "PUBLISHED" || event.status === "COMPLETED";
  // e.g. "Tue, 15 Dec 2026 at IIT Bombay. Perceptron is Techfest's flagship AI hackathon…"
  const description = clip(`${istDate(event.date)}${college ? ` at ${college}` : ""}. ${event.description}`);
  const path = `/events/${event.slug}`;

  return {
    title: `${event.title}${college && !event.title.toLowerCase().includes(college.toLowerCase().split(" ")[0]) ? ` — ${college}` : ""} | CollegeEvent`,
    description,
    alternates: { canonical: path },
    // Drafts / cancelled / archived are organizer-only previews: never index them
    robots: isPublic ? undefined : { index: false, follow: false },
    openGraph: {
      title: event.title,
      description,
      url: path,
      type: "website",
      images: heroImage ? [{ url: heroImage, alt: event.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description,
      images: heroImage ? [heroImage] : undefined,
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
  let registrationDetails: ComponentProps<typeof EventDetailClient>["registrationDetails"] = null;

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

  const jsonLd = eventJsonLd(event, row?.details ?? null);

  return (
    <>
    {isPublic && <JsonLd data={jsonLd} />}
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
  // Stored by the admin EventWizard in AdminEvent shape; any field may be missing on older events
  const d = raw as Partial<AdminEvent>;
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
      ? (d.pricing?.tickets || []).map((t) => ({ name: t.name, price: Number(t.price) || 0, description: t.description || "" }))
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
    prizes: (d.rules?.prizes || []).filter((p) => p?.title),
    faqs: (d.rules?.faqs || []).filter((f) => f?.question),
    contact: {
      name: d.contact?.coordinatorName || "",
      email: d.contact?.coordinatorEmail || "",
      phone: d.contact?.coordinatorPhone || "",
    },
    sponsors: (d.sponsors || [])
      .filter((s) => s?.name && s.visibility !== false)
      .map((s) => ({ name: s.name, category: s.category, logoUrl: s.logoUrl || "", websiteUrl: s.websiteUrl || "" })),
    links: {
      promoVideo: d.media?.promoVideoUrl || "",
      brochure: d.media?.brochurePdfUrl || "",
      rulebook: d.media?.rulebookPdfUrl || "",
    },
  };
}

type EventForLd = NonNullable<Awaited<ReturnType<typeof getEventBySlug>>>;

/** schema.org Event + breadcrumbs, built only from real data the page also shows. */
function eventJsonLd(event: EventForLd, details: unknown) {
  // schema.org Event, built only from real data the page also shows (Google event results: date, venue, image)
  const heroImage = event.images.find((i) => i.isHero)?.url || event.images[0]?.url;
  const raw = details as {
    schedule?: { end?: string; registrationOpens?: string; registrationCloses?: string };
    venue?: { address?: string };
    rules?: { prizes?: unknown[] };
  } | null;
  const campus = campusFor(event.organizer.organizerProfile?.college);
  const url = absoluteUrl(`/events/${event.slug}`);
  const upcoming = event.status === "PUBLISHED" && event.date.getTime() > Date.now();
  const closes = raw?.schedule?.registrationCloses;
  const regOpen = upcoming && !event.isClosed && (!closes || new Date(closes).getTime() > Date.now());
  return [
    {
      "@context": "https://schema.org",
      "@type": "Event",
      name: event.title,
      description: event.description.slice(0, 500),
      url,
      startDate: event.date.toISOString(),
      ...(raw?.schedule?.end ? { endDate: new Date(raw.schedule.end).toISOString() } : {}),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: event.location,
        address: {
          "@type": "PostalAddress",
          streetAddress: raw?.venue?.address || event.location,
          ...(campus ? { addressLocality: campus.city, addressRegion: campus.state } : {}),
          addressCountry: "IN",
        },
      },
      ...(heroImage ? { image: [heroImage] } : {}),
      organizer: {
        "@type": "Organization",
        name: campus?.name ?? event.organizer.organizerProfile?.college ?? event.organizer.name,
        ...(campus ? { url: absoluteUrl(`/colleges/${campus.slug}`) } : {}),
      },
      isAccessibleForFree: true,
      // Registration on CollegeEvent is free; only advertise an offer while it can actually be used
      ...(upcoming
        ? {
            offers: {
              "@type": "Offer",
              url,
              price: 0,
              priceCurrency: "INR",
              availability: regOpen && event._count.registrations < event.capacity ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
              ...(raw?.schedule?.registrationOpens ? { validFrom: new Date(raw.schedule.registrationOpens).toISOString() } : {}),
            },
          }
        : {}),
    },
    breadcrumbLd([["Home", "/"], ["Events", "/events"], [event.title, `/events/${event.slug}`]]),
  ];

}
