import { EventWizard } from "@/components/admin/EventWizard";
import { getAdminCategories } from "@/actions/admin";
import { redirect } from "next/navigation";

export default async function CreateEventPage() {
  const categories = await getAdminCategories().catch(() => redirect("/login"));
  return <EventWizard categories={categories.filter((c) => !c.isArchived)} />;
}
