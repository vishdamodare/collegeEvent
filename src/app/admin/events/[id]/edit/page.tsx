import { EventWizard } from "@/components/admin/EventWizard";
import { prisma } from "@/lib/prisma";
import { getAdminCategories } from "@/actions/admin";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { AdminEvent } from "@/types/admin";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params;

  const [event, categories] = await Promise.all([
    prisma.event.findUnique({
      where: { id },
      include: { category: true, images: true },
      omit: { details: false },
    }),
    getAdminCategories().catch(() => redirect("/login")),
  ]);

  const session = await auth.api.getSession({ headers: await headers() });
  if (!event || (session?.user.role !== "SUPER_ADMIN" && event.organizerId !== session?.user.id)) {
    notFound();
  }

  const hero = event.images.find((i) => i.isHero)?.url || "";
  const gallery = event.images.filter((i) => !i.isHero).map((i) => i.url);
  const saved = (event.details as Partial<AdminEvent> | null) ?? null;

  // Events saved by the wizard carry their full payload in `details`;
  // older events only have the core columns, so rebuild the minimum the wizard reads.
  const initialData = {
    ...(saved ?? {
      basic: { tags: [], seoKeywords: [] },
      schedule: {},
      venue: {},
      registration: {},
      pricing: { isFree: true },
      media: {},
      rules: {},
      contact: {},
      certificates: {},
      createdAt: event.createdAt.toISOString(),
    }),
    id: event.id,
    status: event.status,
    updatedAt: event.updatedAt.toISOString(),
    basic: {
      ...(saved?.basic ?? { tags: [], seoKeywords: [] }),
      title: event.title,
      slug: event.slug,
      category: event.categoryId,
      description: event.description,
    },
    schedule: { ...(saved?.schedule ?? {}), start: event.date.toISOString() },
    venue: { ...(saved?.venue ?? {}), venueLocation: event.location },
    registration: {
      ...(saved?.registration ?? {}),
      maxRegistrations: event.capacity,
      isTeam: event.eventType === "TEAM",
      minTeamSize: event.teamMinSize,
      maxTeamSize: event.teamMaxSize,
    },
    media: { ...(saved?.media ?? {}), banner: hero, gallery },
  } as unknown as AdminEvent;

  return <EventWizard initialData={initialData} categories={categories.filter((c) => !c.isArchived || c.id === event.categoryId)} />;
}
