import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Ticket, CalendarDays, Clock, MapPin, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { generateQRCodeDataUrl } from "@/lib/ticket-generator";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Valid", className: "bg-emerald-500 text-white" },
  USED: { label: "Checked in", className: "bg-blue-600 text-white" },
  CANCELLED: { label: "Cancelled", className: "bg-red-600 text-white" },
};

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

  const rows = await prisma.ticket.findMany({
    where: { studentId: studentProfile.id },
    select: {
      id: true,
      ticketNumber: true,
      status: true,
      verificationToken: true,
      event: {
        select: {
          title: true,
          date: true,
          location: true,
          // hero first, otherwise whatever poster the organizer uploaded
          images: { orderBy: { isHero: "desc" }, take: 1, select: { url: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Rendered from the signed payload (not the stored image) so every ticket gets the large, high-res QR
  const tickets = await Promise.all(
    rows.map(async (t) => ({ ...t, qr: await generateQRCodeDataUrl(t.id, t.verificationToken) }))
  );

  return (
    <div className="space-y-6 font-archivo">
      <h1 className="text-[28px] font-anton uppercase tracking-wider text-text-main">My Tickets</h1>

      {tickets.length === 0 ? (
        <div className="py-16 px-6 text-center space-y-4 rounded-3xl border border-dashed border-border bg-card">
          <Ticket className="w-12 h-12 mx-auto text-text-faint" />
          <div>
            <p className="text-lg font-bold text-text-main">No tickets yet</p>
            <p className="text-sm text-text-muted mt-1">Register for an event and your ticket will show up here.</p>
          </div>
          <Link href="/events" className="btn btn-primary inline-flex items-center gap-2">
            Browse events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {tickets.map((t) => {
            const date = new Date(t.event.date);
            const status = STATUS[t.status] ?? { label: t.status, className: "bg-card-hover text-text-main" };
            const poster = t.event.images[0]?.url;
            return (
              <article key={t.id} className="rounded-3xl border border-border bg-card overflow-hidden flex flex-col">
                <div className="relative aspect-[16/9] bg-gradient-to-br from-cobalt/20 to-card-hover">
                  {poster && (
                    <Image
                      src={poster}
                      alt={`${t.event.title} poster`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1280px) 100vw, 50vw"
                    />
                  )}
                  <span
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="p-5 sm:p-6 flex flex-col gap-5 flex-1">
                  <h2 className="text-xl font-bold text-text-main leading-tight">{t.event.title}</h2>

                  <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
                    <ul className="flex-1 space-y-2 text-sm text-text-muted min-w-0">
                      <li className="flex items-center gap-2.5">
                        <CalendarDays className="w-4 h-4 text-text-faint shrink-0" />
                        {format(date, "EEE, d MMM yyyy")}
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-text-faint shrink-0" />
                        {format(date, "h:mm a")}
                      </li>
                      <li className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-text-faint shrink-0 mt-0.5" />
                        <span className="min-w-0 break-words">{t.event.location}</span>
                      </li>
                      <li className="pt-2">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-text-faint">Ticket ID</span>
                        <span className="font-mono font-bold text-text-main break-all">{t.ticketNumber}</span>
                      </li>
                    </ul>

                    {/* Large white tile with its own quiet zone: scans reliably off a phone screen */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.qr}
                      alt={`QR code for ticket ${t.ticketNumber}`}
                      width={176}
                      height={176}
                      className="w-44 h-44 shrink-0 self-center rounded-2xl bg-white p-1"
                    />
                  </div>

                  <Link
                    href={`/dashboard/tickets/${t.id}`}
                    className="btn btn-primary w-full text-center mt-auto"
                  >
                    View Ticket
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
