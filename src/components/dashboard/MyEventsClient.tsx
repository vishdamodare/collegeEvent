"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  QrCode,
  Search,
  ChevronDown,
  Trash2,
  CalendarCheck,
  ChevronRight,
  Clock,
  Tag,
} from "lucide-react";
import { RegistrationStatusBadge } from "@/components/shared/RegistrationStatusBadge";
import { cancelRegistration } from "@/actions/registrations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/shared/EmptyState";

interface MyEventsClientProps {
  registrations: Array<{
    id: string;
    status: string;
    registeredAt: Date | string;
    event: {
      id: string;
      title: string;
      slug: string;
      date: Date | string;
      location: string;
      category: { name: string; color?: string | null };
      images: Array<{ url: string }>;
    };
    ticket: {
      id: string;
      ticketNumber: string;
      qrCode: string | null;
      status: string;
    } | null;
  }>;
}

type TabType = "UPCOMING" | "COMPLETED" | "CANCELLED";
type SortType = "DATE_ASC" | "DATE_DESC" | "REG_ASC" | "REG_DESC";

export function MyEventsClient({ registrations }: MyEventsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("UPCOMING");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortType>("DATE_ASC");
  const [isPending, startTransition] = useTransition();

  const now = new Date();

  // Filter by Tab
  const tabFiltered = registrations.filter((reg) => {
    const eventDate = new Date(reg.event.date);
    const isCancelled = reg.status === "CANCELLED";

    if (activeTab === "UPCOMING") {
      return !isCancelled && eventDate >= now;
    } else if (activeTab === "COMPLETED") {
      return !isCancelled && eventDate < now;
    } else {
      return isCancelled;
    }
  });

  // Filter by Search Query
  const searched = tabFiltered.filter((reg) => {
    const titleMatch = reg.event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const locationMatch = reg.event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = reg.event.category.name.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || locationMatch || categoryMatch;
  });

  // Sort
  const sorted = [...searched].sort((a, b) => {
    const dateA = new Date(a.event.date).getTime();
    const dateB = new Date(b.event.date).getTime();
    const regA = new Date(a.registeredAt).getTime();
    const regB = new Date(b.registeredAt).getTime();

    switch (sortBy) {
      case "DATE_ASC":
        return dateA - dateB;
      case "DATE_DESC":
        return dateB - dateA;
      case "REG_ASC":
        return regA - regB;
      case "REG_DESC":
        return regB - regA;
      default:
        return 0;
    }
  });

  const handleCancel = (registrationId: string) => {
    if (!confirm("Are you sure you want to cancel your registration for this event?")) return;
    startTransition(async () => {
      const res = await cancelRegistration(registrationId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Registration cancelled successfully.");
        router.refresh();
      }
    });
  };

  const getGoogleCalendarUrl = (event: any) => {
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description || "");
    const location = encodeURIComponent(event.location);
    const startDate = new Date(event.date).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endDate = new Date(new Date(event.date).getTime() + 3 * 60 * 60 * 1000)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
  };

  return (
    <div className="space-y-6">
      {/* Search and Sort controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by event name, venue, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-text-main text-xs outline-none focus:border-border-bright transition-all"
          />
        </div>

        {/* Sort */}
        <div className="relative shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortType)}
            className="appearance-none w-full sm:w-[180px] pl-4 pr-10 py-2.5 rounded-xl bg-card border border-border text-text-muted text-xs outline-none cursor-pointer focus:border-border-bright transition-all"
          >
            <option value="DATE_ASC">Date: Soonest First</option>
            <option value="DATE_DESC">Date: Latest First</option>
            <option value="REG_ASC">Registered: Oldest First</option>
            <option value="REG_DESC">Registered: Newest First</option>
          </select>
          <ChevronDown className="w-4 h-4 text-text-faint absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {(["UPCOMING", "COMPLETED", "CANCELLED"] as TabType[]).map((tab) => {
          const count = registrations.filter((reg) => {
            const eventDate = new Date(reg.event.date);
            const isCancelled = reg.status === "CANCELLED";
            if (tab === "UPCOMING") return !isCancelled && eventDate >= now;
            if (tab === "COMPLETED") return !isCancelled && eventDate < now;
            return isCancelled;
          }).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-4 font-semibold text-xs transition-all relative border-b-2 -mb-[2px] cursor-pointer ${
                activeTab === tab
                  ? "border-lime text-lime"
                  : "border-transparent text-text-faint hover:text-text-muted"
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()} ({count})
            </button>
          );
        })}
      </div>

      {/* List */}
      {sorted.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={
            activeTab === "UPCOMING"
              ? "No upcoming registrations"
              : activeTab === "COMPLETED"
              ? "No completed registrations"
              : "No cancelled registrations"
          }
          description={
            activeTab === "UPCOMING"
              ? "You don't have any upcoming events scheduled. Register for some exciting events!"
              : "No past event registrations found."
          }
          action={
            activeTab === "UPCOMING"
              ? {
                  label: "Browse Events",
                  onClick: () => router.push("/events"),
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {sorted.map((reg) => {
            const eDate = new Date(reg.event.date);
            const banner = reg.event.images[0]?.url;

            return (
              <div
                key={reg.id}
                className="flex flex-col md:flex-row gap-4 p-5 rounded-2xl border border-border bg-card hover:border-border-bright transition-all"
              >
                {/* Event Banner */}
                <div className="relative w-full md:w-40 aspect-[16/10] md:aspect-square rounded-xl overflow-hidden shrink-0">
                  {banner ? (
                    <Image
                      src={banner}
                      alt={reg.event.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 160px"
                    />
                  ) : (
                    <div className="w-full h-full bg-card-hover flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-text-faint" />
                    </div>
                  )}
                  <span
                    className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-white/10 backdrop-blur-md"
                    style={{
                      backgroundColor: reg.event.category.color ? `${reg.event.category.color}40` : "rgba(0,0,0,0.5)",
                      color: reg.event.category.color || "#fff",
                    }}
                  >
                    {reg.event.category.name}
                  </span>
                </div>

                {/* Event Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-base font-bold text-text-main hover:text-lime transition-colors">
                      <Link href={`/events/${reg.event.slug}`}>{reg.event.title}</Link>
                    </h3>
                    <RegistrationStatusBadge status={reg.status} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text-faint">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-lime" />
                      {format(eDate, "eeee, MMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cobalt" />
                      {format(eDate, "h:mm a")}
                    </span>
                    <span className="flex items-center gap-1.5 sm:col-span-2">
                      <MapPin className="w-3.5 h-3.5 text-coral" />
                      {reg.event.location}
                    </span>
                  </div>

                  {reg.ticket && reg.status !== "CANCELLED" && (
                    <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-text-faint mr-1.5">Ticket Number:</span>
                        <span className="font-mono font-semibold text-text-main">
                          {reg.ticket.ticketNumber}
                        </span>
                      </div>
                      <div className="text-text-faint text-[10px]">
                        Registered on {format(new Date(reg.registeredAt), "MMM d, yyyy")}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="shrink-0 flex flex-row md:flex-col justify-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-border/40 min-w-[140px]">
                  {reg.status !== "CANCELLED" && reg.ticket && (
                    <>
                      <Link
                        href={`/dashboard/tickets/${reg.ticket.id}`}
                        className="flex-1 md:flex-initial btn btn-secondary text-xs flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-semibold"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        View Ticket
                      </Link>
                      
                      {activeTab === "UPCOMING" && (
                        <>
                          <a
                            href={getGoogleCalendarUrl(reg.event)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 md:flex-initial btn bg-card hover:bg-card-hover border border-border text-xs flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-text-muted font-semibold"
                          >
                            <CalendarCheck className="w-3.5 h-3.5" />
                            Add to Calendar
                          </a>
                          
                          <button
                            onClick={() => handleCancel(reg.id)}
                            disabled={isPending}
                            className="flex-1 md:flex-initial p-2 rounded-xl border border-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Cancel
                          </button>
                        </>
                      )}
                    </>
                  )}
                  {reg.status === "CANCELLED" && (
                    <div className="text-[10px] text-text-faint text-right w-full md:mt-auto">
                      Cancelled on {reg.registeredAt && format(new Date(reg.registeredAt), "MMM d, yyyy")}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
