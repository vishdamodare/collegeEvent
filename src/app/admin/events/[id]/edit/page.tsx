import { QuickEventForm, type EventFormInitial } from "@/components/admin/QuickEventForm";
import { prisma } from "@/lib/prisma";
import { getAdminCategories } from "@/actions/admin";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { FormField } from "@/types/admin/registration";

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
      include: { images: { where: { isHero: true }, take: 1 } },
      omit: { details: false },
    }),
    getAdminCategories().catch(() => redirect("/login")),
  ]);

  const session = await auth.api.getSession({ headers: await headers() });
  if (!event || (session?.user.role !== "SUPER_ADMIN" && event.organizerId !== session?.user.id)) {
    notFound();
  }

  // Legacy rows may store questions as a JSON string
  let questions: unknown = event.additionalQuestions;
  if (typeof questions === "string") {
    try {
      questions = JSON.parse(questions);
    } catch {
      questions = [];
    }
  }

  const initial: EventFormInitial = {
    id: event.id,
    status: event.status,
    title: event.title,
    categoryId: event.categoryId,
    description: event.description,
    date: event.date.toISOString(),
    location: event.location,
    capacity: event.capacity,
    eventType: event.eventType === "TEAM" ? "TEAM" : "INDIVIDUAL",
    teamMinSize: event.teamMinSize,
    teamMaxSize: event.teamMaxSize,
    banner: event.images[0]?.url ?? "",
    additionalQuestions: Array.isArray(questions) ? (questions as FormField[]) : [],
    details: (event.details as EventFormInitial["details"]) ?? null,
  };

  return <QuickEventForm initial={initial} categories={categories.filter((c) => !c.isArchived || c.id === event.categoryId)} />;
}
