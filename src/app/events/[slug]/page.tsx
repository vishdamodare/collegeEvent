import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventBySlug, getEventsByOrganizer } from "@/actions/events";
import { EventDetailClient } from "./EventDetailClient";

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

  return <EventDetailClient event={event} relatedEvents={relatedEvents} />;
}
