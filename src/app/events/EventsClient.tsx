"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EventGridCard } from "@/components/events/EventGridCard";
import { FilterPanel } from "@/components/events/FilterPanel";
import { SearchBar } from "@/components/shared/SearchBar";
import { SortDropdown } from "@/components/shared/SortDropdown";
import { Pagination } from "@/components/shared/Pagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { authClient } from "@/lib/auth-client";

const SORT_OPTIONS = [
  { label: "Event Date", value: "date" },
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "A–Z", value: "alphabetical" },
];

interface EventsClientProps {
  events: Array<{
    id: string;
    slug: string;
    title: string;
    description: string;
    date: Date;
    location: string;
    capacity: number;
    status: string;
    category: { id: string; name: string; slug: string; color: string | null };
    images: Array<{ url: string }>;
    organizer: { id: string; name: string; image: string | null };
    _count: { registrations: number; savedBy: number };
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    color: string | null;
    _count: { events: number };
  }>;
  totalPages: number;
  totalItems: number;
  currentPage: number;
  perPage: number;
  currentSort: string;
  currentSearch: string;
  currentCategory: string;
  currentStatus: string;
  currentTimeframe: string;
}

export function EventsClient({
  events,
  categories,
  totalPages,
  totalItems,
  currentPage,
  perPage,
  currentSort,
  currentSearch,
  currentCategory,
  currentStatus,
  currentTimeframe,
}: EventsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = authClient.useSession();

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      // Reset to page 1 when filters change
      if (!("page" in updates)) {
        params.delete("page");
      }
      router.push(`/events?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleLogout = async () => {
    await authClient.signOut();
    router.refresh();
  };

  const categoryOptions = categories.map((c) => ({
    label: c.name,
    value: c.slug,
    count: c._count.events,
    color: c.color,
  }));

  return (
    <main className="min-h-screen bg-background text-text-main">
      <Navbar isAuthenticated={!!session} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-5 pt-28 pb-20">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Discover Events
          </h1>
          <p className="text-text-faint text-lg max-w-xl">
            Find hackathons, festivals, workshops, and more happening across campuses.
          </p>
        </div>

        {/* Search + Sort row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <SearchBar
            defaultValue={currentSearch}
            placeholder="Search by title, venue, or description..."
            onSearch={(q) => updateParams({ q })}
          />
          <div className="ml-auto">
            <SortDropdown
              options={SORT_OPTIONS}
              value={currentSort}
              onChange={(sort) => updateParams({ sort })}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <FilterPanel
            categories={categoryOptions}
            selectedCategory={currentCategory}
            onCategoryChange={(category) => updateParams({ category })}
            selectedStatus={currentStatus}
            onStatusChange={(status) => updateParams({ status })}
            selectedTimeframe={currentTimeframe}
            onTimeframeChange={(time) => updateParams({ time })}
          />
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-sm text-text-faint">
            {totalItems} event{totalItems !== 1 ? "s" : ""} found
            {currentSearch && (
              <span>
                {" "}for &ldquo;<span className="text-text-muted">{currentSearch}</span>&rdquo;
              </span>
            )}
          </p>
        </div>

        {/* Event grid */}
        {events.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, i) => (
                <EventGridCard
                  key={event.id}
                  id={event.id}
                  slug={event.slug}
                  title={event.title}
                  description={event.description}
                  date={event.date}
                  location={event.location}
                  capacity={event.capacity}
                  status={event.status}
                  categoryName={event.category.name}
                  categoryColor={event.category.color}
                  imageUrl={event.images[0]?.url}
                  organizerName={event.organizer.name}
                  registrationCount={event._count.registrations}
                  savedCount={event._count.savedBy}
                  index={i}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              perPage={perPage}
              onPageChange={(page) => updateParams({ page: String(page) })}
              onPerPageChange={(pp) => updateParams({ perPage: String(pp) })}
            />
          </>
        ) : (
          <EmptyState
            title="No events found"
            description={
              currentSearch
                ? "Try adjusting your search or clearing filters."
                : "There are no published events matching your criteria."
            }
            action={
              currentSearch || currentCategory
                ? {
                    label: "Clear filters",
                    onClick: () => router.push("/events"),
                  }
                : undefined
            }
          />
        )}
      </div>

      <Footer />
    </main>
  );
}
