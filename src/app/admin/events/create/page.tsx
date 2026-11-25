import { QuickEventForm } from "@/components/admin/QuickEventForm";
import { getAdminCategories } from "@/actions/admin";
import { redirect } from "next/navigation";

export default async function CreateEventPage() {
  const categories = (await getAdminCategories().catch(() => redirect("/login"))).filter((c) => !c.isArchived);
  return <QuickEventForm categories={categories} />;
}
