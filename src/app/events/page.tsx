import type { Metadata } from "next";
import { getPublishedEvents, getCategories } from "@/actions/events";
import { EventsClient } from "./EventsClient";

export const metadata: Metadata = {
  title: "Discover Events — CollegeEvents",
  description:
    "Browse, search, and filter college events across hackathons, sports, music, dance, startups, and more.",
};

interface EventsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
    perPage?: string;
    status?: string;
    time?: string;
  }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const perPage = Math.min(100, Math.max(10, parseInt(params.perPage ?? "12", 10)));
  const sort = params.sort ?? "date";
  const search = params.q ?? "";
  const categorySlug = params.category ?? "";

  const [{ events, total }, categories] = await Promise.all([
    getPublishedEvents({
      take: perPage,
      skip: (page - 1) * perPage,
      search: search || undefined,
      categorySlug: categorySlug || undefined,
      sortBy: sort as "date" | "newest" | "oldest" | "alphabetical",
    }),
    getCategories(),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <EventsClient
      events={events}
      categories={categories}
      totalPages={totalPages}
      totalItems={total}
      currentPage={page}
      perPage={perPage}
      currentSort={sort}
      currentSearch={search}
      currentCategory={categorySlug}
      currentStatus={params.status ?? ""}
      currentTimeframe={params.time ?? ""}
    />
  );
}
