import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Ticket, CalendarDays, MapPin, QrCode, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function StudentTicketsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/tickets");
  }

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!studentProfile) {
    redirect("/dashboard/profile");
  }

  const tickets = await prisma.ticket.findMany({
    where: { studentId: studentProfile.id },
    include: {
      event: {
        include: {
          images: { where: { isHero: true }, take: 1 },
          category: { select: { name: true } },
        },
      },
      registration: { select: { status: true, teamName: true, checkedIn: true, checkedInAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 font-archivo">
      <div>
        <h1 className="text-[28px] font-anton uppercase tracking-wider text-white flex items-center gap-3">
          <Ticket className="w-7 h-7 text-[var(--color-lime)]" />
          My Event Passes & Tickets
        </h1>
        <p className="text-[13px] text-white/40 mt-1">
          Access your digital entry QR passes, ticket numbers, and venue check-in tokens.
        </p>
      </div>

      {tickets.length === 0 ? (
        <div className="py-20 text-center text-white/30 space-y-4 rounded-3xl border border-white/10 bg-[#121212]/40">
          <Ticket className="w-12 h-12 mx-auto text-white/20" />
          <p className="text-base font-bold uppercase tracking-wider">No event tickets found</p>
          <p className="text-sm text-white/30">You haven't registered for any events yet.</p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-lime)] text-black font-bold text-xs uppercase tracking-wider hover:bg-[var(--color-lime)]/90 transition-colors"
          >
            Browse Live Fests
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="rounded-3xl border border-white/10 bg-[#121212]/60 p-6 space-y-5 backdrop-blur-xl relative overflow-hidden group hover:border-[var(--color-lime)]/40 transition-all"
            >
              {/* Event Header */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-lime)] bg-[var(--color-lime)]/10 border border-[var(--color-lime)]/20 px-2.5 py-0.5 rounded-full">
                    {t.event.category?.name || "Event Pass"}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-2 leading-tight group-hover:text-[var(--color-lime)] transition-colors">
                    {t.event.title}
                  </h3>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold border uppercase ${
                    t.status === "ACTIVE"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : t.status === "USED"
                      ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`}
                >
                  {t.status}
                </span>
              </div>

              {/* Event Details */}
              <div className="space-y-2 text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-white/40 shrink-0" />
                  <span>{format(new Date(t.event.date), "EEEE, MMMM dd, yyyy · hh:mm a")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-white/40 shrink-0" />
                  <span>{t.event.location}</span>
                </div>
                {t.registration.teamName && (
                  <div className="flex items-center gap-2 text-[var(--color-lime)]">
                    <span className="font-bold">Team:</span> {t.registration.teamName}
                  </div>
                )}
              </div>

              {/* Ticket Identifier Box */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Ticket Number</p>
                  <p className="font-mono font-bold text-sm text-[var(--color-lime)]">{t.ticketNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Security Token</p>
                  <p className="font-mono text-xs text-white/80">{t.verificationToken}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-white/5">
                <div className="text-xs text-white/40">
                  {t.registration.checkedIn ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Not Checked In
                    </span>
                  )}
                </div>

                <Link
                  href={`/dashboard/tickets/${t.id}`}
                  className="px-4 py-2 rounded-xl bg-[var(--color-lime)] hover:bg-[var(--color-lime)]/90 text-black font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <QrCode className="w-4 h-4" /> View Digital Pass
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
