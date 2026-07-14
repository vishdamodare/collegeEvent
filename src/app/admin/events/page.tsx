import { getAdminEvents, getAdminCategories } from "@/actions/admin";
import { EventsTableClient } from "./EventsTableClient";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    status?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export default async function AdminEventsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search || "";
  const category = params.category || "";
  const status = params.status || "";
  const sortBy = params.sortBy || "date";

  const [eventsData, categoriesData] = await Promise.all([
    getAdminEvents({
      search,
      category,
      status,
      sortBy,
      page,
      perPage: 10,
    }),
    getAdminCategories(),
  ]);

  // Extract non-archived categories for search filter selector
  const activeCategories = categoriesData.filter((c) => !c.isArchived);

  return (
    <EventsTableClient
      initialEvents={eventsData.events}
      totalCount={eventsData.total}
      categories={activeCategories}
      initialPage={page}
    />
  );
}
