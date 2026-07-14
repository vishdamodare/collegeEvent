import { getAdminCategories, createEvent } from "@/actions/admin";
import { EventForm } from "@/components/admin/EventForm";

export default async function CreateEventPage() {
  const categories = await getAdminCategories();
  const activeCategories = categories.filter((c) => !c.isArchived);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-archivo)]">Create Event</h1>
        <p className="text-text-faint mt-1">Publish a new campus event or save it as a draft.</p>
      </div>

      <EventForm
        categories={activeCategories}
        onSubmit={createEvent}
      />
    </div>
  );
}
