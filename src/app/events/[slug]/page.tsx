import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventBySlug, getEventsByOrganizer } from "@/actions/events";
import { EventDetailClient } from "./EventDetailClient";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return { title: "Event Not Found — CollegeEvents" };
  }

  const heroImage = event.images.find((i) => i.isHero)?.url || event.images[0]?.url;

  return {
    title: `${event.title} — CollegeEvents`,
    description: event.description.slice(0, 160),
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
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const relatedEvents = await getEventsByOrganizer(event.organizerId, event.id);

  // Check student registration details
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user;

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
      },
    });
    if (profile) {
      const registration = await prisma.registration.findFirst({
        where: {
          eventId: event.id,
          studentId: profile.id,
        },
        include: {
          ticket: true,
        },
      });
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

  return (
    <EventDetailClient
      event={event}
      relatedEvents={relatedEvents}
      isRegistered={isRegistered}
      registrationDetails={registrationDetails}
      initialProfile={profile}
    />
  );
}
