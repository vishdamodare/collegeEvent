"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, Loader2, Inbox } from "lucide-react";
import { getAdminEvents, deleteEvent } from "@/actions/admin";
import { AdminEvent } from "@/types/admin";
import { toast } from "sonner";

export default function ArchivedEventsPage() {
  const [archived, setArchived] = useState<AdminEvent[]>([]);
  const [isPending, startTransition] = useTransition();

  const loadArchived = async () => {
    const res = await getAdminEvents({ status: "ARCHIVED" });
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
          shortDescription: e.description.substring(0, 120),
        },
        media: {
          banner: e.images.find((img: any) => img.isHero)?.url || ""
        },
        pricing: { isFree: true, fee: 0 },
        capacity: e.capacity,
        stats: {
          currentRegistrations: e._count?.registrations || 0,
          waitingList: 0,
          attendance: 0,
          revenue: 0,
          certificatesIssued: 0
        }
      }));
      setArchived(mapped as any);
    }
  };

  useEffect(() => {
    startTransition(async () => {
      await loadArchived();
    });
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this archived event?")) {
      startTransition(async () => {
        const res = await deleteEvent(id);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Event permanently deleted!");
          await loadArchived();
        }
      });
    }
  };

  return (
    <div className="space-y-6 font-archivo">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/events" className="p-2 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-[28px] font-anton uppercase tracking-wider text-white">Archived Events</h1>
          <p className="text-[13px] text-white/40 font-archivo">View and manage permanently shelved event listings.</p>
        </div>
      </div>

      {/* Grid */}
      {isPending ? (
        <div className="py-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-lime)]" />
        </div>
      ) : archived.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-[#121212]/30 p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl mx-auto mb-4 opacity-50">
            <Inbox className="w-5 h-5 text-white/40" />
          </div>
          <h3 className="text-white font-bold text-[16px] mb-1">No Archived Events</h3>
          <p className="text-white/40 text-[13px]">Shelve active events to clear up your workspace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archived.map((evt) => (
            <div key={evt.id} className="rounded-2xl border border-white/10 bg-[#121212]/40 p-5 flex flex-col justify-between hover:border-white/20 transition-all">
              <div>
                <div className="flex justify-between items-center text-[10px] text-white/30 font-semibold mb-3 uppercase">
                  <span>{evt.basic.category}</span>
                  <span className="bg-red-500/15 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-md font-bold">
                    Archived
                  </span>
                </div>
                <h3 className="text-[16px] font-bold text-white mb-2 leading-tight">{evt.basic.title}</h3>
                <p className="text-[12px] text-white/50 line-clamp-2 leading-relaxed">{evt.basic.shortDescription}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => handleDelete(evt.id)}
                  className="p-1.5 rounded-lg border border-transparent hover:border-red-500/20 hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
