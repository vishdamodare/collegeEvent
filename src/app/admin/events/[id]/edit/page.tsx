import { getAdminCategories, updateEvent } from "@/actions/admin";
import { EventForm } from "@/components/admin/EventForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params;

  const [event, categoriesData] = await Promise.all([
    prisma.event.findUnique({
      where: { id },
      include: { images: { where: { isHero: true }, take: 1 } },
    }),
    getAdminCategories(),
  ]);

  if (!event) {
    notFound();
  }

  const activeCategories = categoriesData.filter((c) => !c.isArchived);

  // Map values to initialData format
  const initialData = {
    id: event.id,
    title: event.title,
    description: event.description,
    categoryId: event.categoryId,
    date: event.date,
    location: event.location,
    capacity: event.capacity,
    status: event.status,
    imageUrl: event.images[0]?.url || "",
  };

  const handleUpdate = async (data: any) => {
    "use server";
    return updateEvent(id, data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-archivo)]">Edit Event</h1>
        <p className="text-text-faint mt-1">Modify dates, descriptions, category groupings, or statuses.</p>
      </div>

      <EventForm
        initialData={initialData}
        categories={activeCategories}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
