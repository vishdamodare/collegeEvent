import { prisma } from "@/lib/prisma";
import { EventWizard } from "@/components/admin/EventWizard";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function EditEventPage({ params }: PageProps) {
  const resolvedParams = await params;
  
  const event = await prisma.event.findUnique({
    where: { id: resolvedParams.id },
    include: { category: true, images: true }
  });

  if (!event) {
    notFound();
  }

  // Map database format to expected initialData structure for EventWizard
  const initialData = {
    id: event.id,
    status: event.status,
    basic: {
      title: event.title,
      slug: event.slug,
      shortDescription: event.description.substring(0, 100),
      longDescription: event.description,
      category: event.categoryId,
      date: event.date.toISOString().split("T")[0],
      time: "10:00",
      venue: event.location,
      tags: []
    },
    capacity: event.capacity,
    media: {
      heroImage: event.images.find(img => img.isHero)?.url || ""
    }
  };

  return <EventWizard initialData={initialData as any} />;
}
