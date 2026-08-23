"use client";

import { useState, useTransition } from "react";
import { Ticket, Search, Filter, QrCode, ExternalLink, Calendar, User, ShieldCheck } from "lucide-react";
import { getAdminTicketsAction } from "@/actions/admin";
import { format } from "date-fns";

interface TicketsClientProps {
  initialData: {
    tickets: any[];
    events: { id: string; title: string }[];
  };
}

export function TicketsClient({ initialData }: TicketsClientProps) {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [qrModalTicket, setQrModalTicket] = useState<any | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFilter = (eventId?: string, searchQuery?: string, status?: string) => {
    const eId = eventId !== undefined ? eventId : selectedEventId;
    const q = searchQuery !== undefined ? searchQuery : search;
    const st = status !== undefined ? status : statusFilter;

    startTransition(async () => {
      const res = await getAdminTicketsAction({
        eventId: eId || undefined,
        search: q || undefined,
        status: st !== "ALL" ? st : undefined,
      });
      setData(res);
    });
  };

  return (
    <div className="space-y-6 font-archivo">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-anton uppercase tracking-wider text-white flex items-center gap-3">
          <Ticket className="w-7 h-7 text-[var(--color-lime)]" />
          Issued Tickets Catalog
        </h1>
        <p className="text-[13px] text-white/40 mt-1">
          View, search, and verify all participant tickets, security tokens, and QR code states.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-4 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search ticket #, token, student or event..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleFilter(undefined, e.target.value, undefined);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181818] border border-white/10 text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-lime)]/50 transition-colors"
          />
        </div>

        {/* Event Select */}
        <div className="w-full md:w-64">
          <select
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              handleFilter(e.target.value, undefined, undefined);
            }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-white/10 text-[13px] text-white focus:outline-none focus:border-[var(--color-lime)]/50 cursor-pointer"
          >
            <option value="">All Events</option>
            {data.events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex gap-1.5 p-1 bg-[#181818] rounded-xl border border-white/5">
          {(["ALL", "ACTIVE", "USED", "CANCELLED"] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                handleFilter(undefined, undefined, st);
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase cursor-pointer transition-all ${
                statusFilter === st
                  ? "bg-[var(--color-lime)] text-black"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="rounded-2xl border border-white/10 bg-[#121212]/40 overflow-hidden">
        {data.tickets.length === 0 ? (
          <div className="py-16 text-center text-white/30 space-y-3">
            <Ticket className="w-10 h-10 mx-auto text-white/20" />
            <p className="text-sm font-bold uppercase tracking-wider">No issued tickets found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-wider text-white/50">
                  <th className="py-3.5 px-4">Ticket Identifier</th>
                  <th className="py-3.5 px-4">Student & College</th>
                  <th className="py-3.5 px-4">Event</th>
                  <th className="py-3.5 px-4">Verification Token</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">QR Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[13px]">
                {data.tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-mono font-bold text-[var(--color-lime)]">{t.ticketNumber}</p>
                      <p className="text-[10.5px] text-white/30 mt-0.5">
                        Issued: {format(new Date(t.issuedAt), "MMM dd, yyyy")}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white leading-tight">{t.studentName}</p>
                      <p className="text-[11px] text-white/40 mt-0.5">{t.studentEmail}</p>
                      <p className="text-[10.5px] text-white/30">{t.studentCollege}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-white/90">{t.eventName}</p>
                      <p className="text-[11px] text-white/40 mt-0.5">
                        {format(new Date(t.eventDate), "MMM dd, yyyy")}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11.5px] bg-white/5 border border-white/10 px-2.5 py-1 rounded text-white/80">
                        {t.verificationToken}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          t.status === "ACTIVE"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : t.status === "USED"
                            ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {t.qrCode ? (
                        <button
                          onClick={() => setQrModalTicket(t)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white cursor-pointer transition-colors"
                          title="View QR Code"
                        >
                          <QrCode className="w-4 h-4 text-[var(--color-lime)]" />
                        </button>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Modal Preview */}
      {qrModalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="rounded-2xl border border-white/10 bg-[#141414] p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white">{qrModalTicket.eventName}</h3>
            <p className="text-xs text-white/40">{qrModalTicket.studentName} ({qrModalTicket.ticketNumber})</p>

            <div className="bg-white p-4 rounded-xl inline-block mx-auto shadow-inner">
              <img src={qrModalTicket.qrCode} alt="Ticket QR Code" className="w-48 h-48 mx-auto" />
            </div>

            <div className="text-[11px] text-white/50 font-mono bg-white/5 py-2 px-3 rounded-lg border border-white/5">
              Token: {qrModalTicket.verificationToken}
            </div>

            <button
              onClick={() => setQrModalTicket(null)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
