"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Calendar, QrCode, ClipboardList, CheckSquare, XCircle, ArrowRight } from "lucide-react";
import { RegistrationStatusBadge } from "@/components/shared/RegistrationStatusBadge";

interface RegistrationHistoryProps {
  registrations: Array<{
    id: string;
    status: string;
    registeredAt: Date | string;
    event: {
      title: string;
      slug: string;
      date: Date | string;
    };
    ticket: {
      id: string;
      ticketNumber: string;
    } | null;
  }>;
}

export function RegistrationHistory({ registrations }: RegistrationHistoryProps) {
  const now = new Date();

  // Statistics
  const total = registrations.length;
  const upcoming = registrations.filter(
    (r) => r.status !== "CANCELLED" && new Date(r.event.date) >= now
  ).length;
  const completed = registrations.filter(
    (r) => r.status !== "CANCELLED" && new Date(r.event.date) < now
  ).length;
  const cancelled = registrations.filter((r) => r.status === "CANCELLED").length;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-lg font-bold font-[family-name:var(--font-archivo)] text-text-main flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-lime" />
          Event Registrations
        </h2>
        <p className="text-xs text-text-faint mt-1">Summary of your event ticket bookings.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card-hover border border-border p-3.5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-faint">
            Upcoming
          </span>
          <span className="text-2xl font-bold text-lime mt-1">{upcoming}</span>
        </div>
        
        <div className="bg-card-hover border border-border p-3.5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-faint">
            Completed
          </span>
          <span className="text-2xl font-bold text-cobalt mt-1">{completed}</span>
        </div>
      </div>

      {/* Recent Bookings List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase font-bold tracking-wider text-text-faint">
            Recent Tickets
          </h3>
          {registrations.length > 5 && (
            <Link
              href="/dashboard/events"
              className="text-[11px] text-lime hover:underline flex items-center gap-1"
            >
              See all <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {registrations.length === 0 ? (
          <div className="text-center p-6 border border-dashed border-border rounded-2xl text-text-faint space-y-2">
            <Calendar className="w-8 h-8 mx-auto text-text-faint opacity-50" />
            <p className="text-xs">No registered events yet.</p>
            <Link href="/events" className="text-xs text-lime hover:underline font-semibold block">
              Browse events to register
            </Link>
          </div>
        ) : (
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {registrations.slice(0, 5).map((reg) => {
              const eDate = new Date(reg.event.date);
              const isPast = eDate < now;
              return (
                <div
                  key={reg.id}
                  className="bg-card-hover border border-border p-3.5 rounded-xl hover:border-border-bright transition-all space-y-2.5"
                >
                  <div className="flex justify-between items-start gap-2">
                    <Link
                      href={`/events/${reg.event.slug}`}
                      className="text-xs font-semibold text-text-main hover:text-lime transition-colors line-clamp-1 flex-1"
                    >
                      {reg.event.title}
                    </Link>
                    <RegistrationStatusBadge status={reg.status} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-text-faint">
                    <span>{format(eDate, "MMM d, yyyy")}</span>
                    {reg.ticket && reg.status !== "CANCELLED" && (
                      <Link
                        href={`/dashboard/tickets/${reg.ticket.id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-lime/10 border border-lime/20 text-lime font-semibold hover:bg-lime/20 transition-all text-[10px]"
                      >
                        <QrCode className="w-3 h-3" />
                        Ticket
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
