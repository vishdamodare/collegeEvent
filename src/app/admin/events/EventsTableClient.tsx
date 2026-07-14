"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Copy,
  Archive,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { duplicateEvent, archiveEvent, deleteEvent } from "@/actions/admin";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/utils/cn";

interface EventsTableClientProps {
  initialEvents: Array<{
    id: string;
    title: string;
    slug: string;
    date: Date;
    location: string;
    capacity: number;
    status: string;
    category: { name: string; color: string | null };
    _count: { registrations: number };
  }>;
  totalCount: number;
  categories: Array<{ id: string; name: string }>;
  initialPage: number;
}

export function EventsTableClient({
  initialEvents,
  totalCount,
  categories,
  initialPage,
}: EventsTableClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchVal, setSearchVal] = useState(searchParams.get("search") || "");
  const [selectedCat, setSelectedCat] = useState(searchParams.get("category") || "");
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "date");

  const totalPages = Math.ceil(totalCount / 10);

  const updateQueryParams = (updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "") {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    });
    // Reset page back to 1 on filter/search change unless page is explicitly updated
    if (!updates.page) {
      params.delete("page");
    }

    startTransition(() => {
      router.push(`/admin/events?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams({ search: searchVal });
  };

  const handleDuplicate = async (id: string) => {
    toast.promise(duplicateEvent(id), {
      loading: "Duplicating event...",
      success: (res) => {
        if (res.error) throw new Error(res.error);
        router.refresh();
        return "Event duplicated successfully! Opened in draft.";
      },
      error: (err: any) => err.message || "Failed to duplicate event.",
    });
  };

  const handleArchive = async (id: string) => {
    toast.promise(archiveEvent(id), {
      loading: "Archiving event...",
      success: (res) => {
        if (res.error) throw new Error(res.error);
        router.refresh();
        return "Event archived successfully!";
      },
      error: (err: any) => err.message || "Failed to archive event.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-archivo)]">Events console</h1>
          <p className="text-text-faint mt-1">Manage event listings, review registrations, and audit status.</p>
        </div>
        <Link href="/admin/events/create" className="btn btn-primary w-full sm:w-auto shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Create Event
        </Link>
      </div>

      {/* Filters Dashboard */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
            <input
              type="text"
              placeholder="Search by title, location..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="form-input pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <select
              value={selectedCat}
              onChange={(e) => {
                setSelectedCat(e.target.value);
                updateQueryParams({ category: e.target.value });
              }}
              className="form-input w-full sm:w-40"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                updateQueryParams({ status: e.target.value });
              }}
              className="form-input w-full sm:w-40"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                updateQueryParams({ sortBy: e.target.value });
              }}
              className="form-input w-full sm:w-40"
            >
              <option value="date">Date: Soonest</option>
              <option value="newest">Created: Newest</option>
              <option value="oldest">Created: Oldest</option>
              <option value="alphabetical">Title: A-Z</option>
            </select>

            <button type="submit" className="btn btn-glass px-4">
              Apply
            </button>
          </div>
        </form>
      </div>

      {/* Events Table / List view */}
      <div className={cn("overflow-hidden rounded-xl border border-border bg-card transition-opacity", isPending && "opacity-60")}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg-elevated/40 text-xs font-bold text-text-faint uppercase tracking-wider">
                <th className="py-4 px-4 font-archivo">Event Title</th>
                <th className="py-4 px-4 font-archivo">Category</th>
                <th className="py-4 px-4 font-archivo">Date & Time</th>
                <th className="py-4 px-4 font-archivo">Venue</th>
                <th className="py-4 px-4 font-archivo">Capacity</th>
                <th className="py-4 px-4 font-archivo text-center">Status</th>
                <th className="py-4 px-4 font-archivo text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {initialEvents.length > 0 ? (
                initialEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-card-hover/40 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-text-main group-hover:text-lime transition-colors">
                        {ev.title}
                      </div>
                      <div className="text-[10px] text-text-faint font-mono mt-0.5">/{ev.slug}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                        style={{
                          backgroundColor: ev.category.color ? `${ev.category.color}15` : "rgba(255,255,255,.05)",
                          borderColor: ev.category.color ? `${ev.category.color}25` : "rgba(255,255,255,.1)",
                          color: ev.category.color || "#fff",
                        }}
                      >
                        {ev.category.name}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-text-muted">
                      {format(new Date(ev.date), "MMM d, yyyy · h:mm a")}
                    </td>
                    <td className="py-4 px-4 text-text-muted truncate max-w-[150px]">{ev.location}</td>
                    <td className="py-4 px-4 text-text-muted">
                      {ev._count.registrations} / {ev.capacity}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <StatusBadge status={ev.status} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/events/${ev.id}`}
                          className="p-2 rounded-lg border border-border bg-card hover:bg-card-hover text-text-faint hover:text-text-main transition-colors"
                          title="View preview"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/events/${ev.id}/edit`}
                          className="p-2 rounded-lg border border-border bg-card hover:bg-card-hover text-text-faint hover:text-text-main transition-colors"
                          title="Edit event"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(ev.id)}
                          className="p-2 rounded-lg border border-border bg-card hover:bg-card-hover text-text-faint hover:text-text-main transition-colors cursor-pointer"
                          title="Duplicate event"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {ev.status !== "ARCHIVED" && (
                          <button
                            onClick={() => handleArchive(ev.id)}
                            className="p-2 rounded-lg border border-border bg-card hover:bg-card-hover text-text-faint hover:text-coral transition-colors cursor-pointer"
                            title="Archive event"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-faint">
                    No matching events found. Try editing filters or search text.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-bg-elevated/20 border-t border-border/80">
            <span className="text-xs text-text-faint">
              Showing page {initialPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={initialPage <= 1}
                onClick={() => updateQueryParams({ page: initialPage - 1 })}
                className="p-2 rounded-lg border border-border hover:bg-card-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={initialPage >= totalPages}
                onClick={() => updateQueryParams({ page: initialPage + 1 })}
                className="p-2 rounded-lg border border-border hover:bg-card-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
