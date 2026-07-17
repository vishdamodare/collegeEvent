"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { 
  PlusCircle, 
  Search, 
  Filter, 
  MoreVertical, 
  Copy, 
  Archive, 
  Trash2, 
  Edit3, 
  Globe, 
  FileText, 
  Eye,
  Inbox,
  Loader2,
  Users
} from "lucide-react";
import { getAdminEvents, duplicateEvent, deleteEvent, archiveEvent } from "@/actions/admin";
import { AdminEvent, EventStatus } from "@/types/admin";
import { toast } from "sonner";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"ALL" | "PUBLISHED" | "DRAFT" | "ARCHIVED">("ALL");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  const [isPending, startTransition] = useTransition();

  const loadEvents = async () => {
    const res = await getAdminEvents();
    if (res.events) {
      const mapped = res.events.map((e: any) => ({
        id: e.id,
        status: e.status,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
        basic: {
          title: e.title,
          slug: e.slug,
          category: e.category?.name || "General",
          date: e.date.toLocaleDateString(),
          venue: e.location,
          tags: [],
          shortDescription: e.description.substring(0, 100),
        },
        media: {
          banner: e.images.find((img: any) => img.isHero)?.url || ""
        },
        schedule: {
          start: e.date.toISOString(),
        },
        pricing: {
          isFree: true,
          fee: 0,
        },
        capacity: e.capacity,
        stats: {
          currentRegistrations: e._count?.registrations || 0,
          waitingList: 0,
          attendance: 0,
          revenue: 0,
          certificatesIssued: 0
        }
      }));
      setEvents(mapped as any);
    }
  };

  useEffect(() => {
    startTransition(async () => {
      await loadEvents();
    });
  }, []);

  // Filter Logic
  const filteredEvents = events.filter((evt) => {
    // 1. Search Query Filter
    const matchesSearch = 
      evt.basic.title.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Category Filter
    const matchesCategory = categoryFilter === "ALL" || evt.basic.category === categoryFilter;

    // 3. Tab Filter
    let matchesTab = true;
    if (activeTab === "PUBLISHED") {
      matchesTab = evt.status === "PUBLISHED" || evt.status === "REGISTRATION_OPEN" || evt.status === "EVENT_LIVE";
    } else if (activeTab === "DRAFT") {
      matchesTab = evt.status === "DRAFT" || evt.status === "PENDING_REVIEW";
    } else if (activeTab === "ARCHIVED") {
      matchesTab = evt.status === "ARCHIVED";
    }

    return matchesSearch && matchesCategory && matchesTab;
  });

  // Action Handlers
  const handleDuplicate = (evt: AdminEvent) => {
    startTransition(async () => {
      const res = await duplicateEvent(evt.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Event duplicated successfully!");
        await loadEvents();
      }
    });
    setOpenDropdownId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this event?")) {
      startTransition(async () => {
        const res = await deleteEvent(id);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Event deleted successfully!");
          await loadEvents();
        }
      });
    }
    setOpenDropdownId(null);
  };

  const handleArchive = (id: string) => {
    startTransition(async () => {
      const res = await archiveEvent(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Event archived successfully!");
        await loadEvents();
      }
    });
    setOpenDropdownId(null);
  };

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case "PUBLISHED":
      case "REGISTRATION_OPEN":
        return <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-md text-[11px] font-bold">Published</span>;
      case "EVENT_LIVE":
        return <span className="bg-[var(--color-lime)]/10 text-[var(--color-lime)] border border-[var(--color-lime)]/20 px-2 py-0.5 rounded-md text-[11px] font-bold">Live Now</span>;
      case "DRAFT":
        return <span className="bg-white/5 text-white/50 border border-white/10 px-2 py-0.5 rounded-md text-[11px] font-bold">Draft</span>;
      case "PENDING_REVIEW":
        return <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-md text-[11px] font-bold">Pending Review</span>;
      case "ARCHIVED":
        return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-md text-[11px] font-bold">Archived</span>;
      default:
        return <span className="bg-white/5 text-white/40 border border-white/5 px-2 py-0.5 rounded-md text-[11px] font-bold">{status}</span>;
    }
  };

  // Get categories from events for filtering
  const categoriesList = Array.from(new Set(events.map(e => e.basic.category)));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-anton uppercase text-white tracking-wider">Manage Events</h1>
          <p className="font-archivo text-[13px] text-white/40">Create, publish, and monitor your college event registrations.</p>
        </div>
        <Link 
          href="/admin/events/create" 
          className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[var(--color-lime)] hover:bg-[var(--color-lime)]/90 text-[#0b0b0b] font-bold text-[14px] font-archivo shadow-[0_4px_15px_rgba(215,255,61,0.15)] transition-all cursor-pointer whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          Create Event
        </Link>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-white/5 pb-4">
        {/* Navigation Tabs */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-[#121212]/60 border border-white/5 text-[13px] font-semibold font-archivo shrink-0">
          {(["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === tab 
                  ? "bg-white/5 text-white shadow-md border border-white/10" 
                  : "text-white/40 hover:text-white/80"
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto font-archivo">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search fests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121212]/40 border border-white/5 text-white text-[13px] outline-none focus:border-white/20 transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-[#121212]/40 border border-white/5 text-white text-[13px] outline-none appearance-none cursor-pointer focus:border-white/20"
            >
              <option value="ALL">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {isPending ? (
        <div className="py-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-lime)]" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-[#121212]/30 p-16 text-center font-archivo max-w-lg mx-auto mt-8">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl mx-auto mb-5 opacity-60">
            <Inbox className="w-6 h-6 text-white/40" />
          </div>
          <h3 className="text-white font-bold text-[17px] mb-1.5 uppercase tracking-wide">No Events Created</h3>
          <p className="text-white/40 text-[13.5px] leading-relaxed mb-6">
            Create your first event to start accepting registrations and managing participants.
          </p>
          <Link
            href="/admin/events/create"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-[var(--color-lime)] hover:bg-[var(--color-lime)]/90 text-[#0b0b0b] font-bold text-[14px]"
          >
            <PlusCircle className="w-4 h-4" /> Create First Event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => (
            <div 
              key={evt.id} 
              className="group rounded-2xl border border-white/5 bg-[#121212]/40 overflow-hidden flex flex-col justify-between hover:border-white/15 transition-all duration-300"
            >
              {/* Event Header Image */}
              <div className="h-44 relative bg-white/5 overflow-hidden">
                {evt.media?.banner ? (
                  <img 
                    src={evt.media.banner} 
                    alt={evt.basic.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-[32px]">
                    🖼️
                  </div>
                )}
                {/* Status Float */}
                <div className="absolute top-4 left-4 z-10">
                  {getStatusBadge(evt.status)}
                </div>

                {/* Dropdown Action Trigger */}
                <div className="absolute top-4 right-4 z-20">
                  <button 
                    onClick={() => setOpenDropdownId(openDropdownId === evt.id ? null : evt.id)}
                    className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black transition-colors cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {openDropdownId === evt.id && (
                    <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-[#141414] border border-white/10 p-1.5 shadow-2xl z-30 animate-in fade-in duration-100 font-archivo">
                      <Link 
                        href={`/admin/events/edit/${evt.id}`}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/5 text-[12px] transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Details
                      </Link>
                      <button 
                        onClick={() => handleDuplicate(evt)}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/5 text-[12px] transition-colors cursor-pointer text-left"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Duplicate Event
                      </button>

                      {evt.status !== "ARCHIVED" && (
                        <button 
                          onClick={() => handleArchive(evt.id)}
                          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-orange-400 hover:bg-orange-500/10 text-[12px] transition-colors cursor-pointer text-left"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          Archive Event
                        </button>
                      )}

                      <div className="h-[1px] bg-white/5 my-1"></div>
                      <button 
                        onClick={() => handleDelete(evt.id)}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 text-[12px] font-semibold transition-colors cursor-pointer text-left"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Event
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Body Info */}
              <div className="p-5 flex-1 flex flex-col justify-between font-archivo">
                <div>
                  <div className="flex justify-between items-center text-[11px] text-white/30 font-semibold mb-2">
                    <span className="uppercase tracking-wider">{evt.basic.category}</span>
                    <span>{new Date(evt.schedule.start).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-[16px] font-bold text-white leading-tight mb-2 group-hover:text-[var(--color-lime)] transition-colors">
                    {evt.basic.title}
                  </h3>
                  <p className="text-[12px] text-white/50 line-clamp-2 leading-relaxed">
                    {evt.basic.shortDescription}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center text-[12px]">
                  <div>
                    <p className="text-[10px] text-white/30 leading-none">REGISTRATION FEE</p>
                    <p className="text-[13px] font-bold text-white mt-1">
                      {evt.pricing.isFree ? "Free" : `₹${evt.pricing.fee}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/30 leading-none">TOTAL SIGNUPS</p>
                    <p className="text-[13px] font-bold text-white mt-1 flex items-center gap-1 justify-end">
                      <Users className="w-3.5 h-3.5 text-white/40" />
                      {(evt as any).stats?.currentRegistrations ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Bar Footer */}
              <div className="px-5 py-4 bg-white/[0.02] border-t border-white/5 flex gap-2">
                <Link 
                  href={`/events/${evt.basic.slug}`}
                  className="flex-1 py-2 px-3 rounded-lg border border-white/10 hover:border-white/20 text-center font-bold text-[12px] text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-white/40" /> Live Page
                </Link>
                <Link 
                  href={`/admin/events/edit/${evt.id}`}
                  className="flex-grow py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-center font-bold text-[12px] text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-white/40" /> Configure
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
