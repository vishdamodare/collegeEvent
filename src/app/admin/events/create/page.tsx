import { EventWizard } from "@/components/admin/EventWizard";
import { QuickEventForm } from "@/components/admin/QuickEventForm";
import { getAdminCategories } from "@/actions/admin";
import { redirect } from "next/navigation";

// Default = short single-page form. The full 15-step wizard stays available via ?mode=advanced.
export default async function CreateEventPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const categories = (await getAdminCategories().catch(() => redirect("/login"))).filter((c) => !c.isArchived);

  return mode === "advanced" ? <EventWizard categories={categories} /> : <QuickEventForm categories={categories} />;
}
