import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  Edit,
  Copy,
  Archive,
  Trash2,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UserRole } from "@prisma/client";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminEventDetailPage({ params }: PageProps) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/login");
  }

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      category: true,
      images: { where: { isHero: true }, take: 1 },
      organizer: true,
      _count: { select: { registrations: true } },
    },
  });

  if (!event) {
    notFound();
  }

  const seatsLeft = event.capacity - event._count.registrations;
  const isSuperAdmin = session.user.role === UserRole.SUPER_ADMIN;

  return (
    <div className="space-y-8">
      {/* Top navbar bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/events"
          className="text-xs text-text-faint hover:text-lime transition-colors flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Console
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/events/${event.id}/edit`}
            className="btn btn-glass px-3.5 py-2 text-xs flex items-center gap-1.5"
          >
            <Edit className="w-3.5 h-3.5" /> Edit Details
          </Link>
        </div>
      </div>

      {/* Main card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Image banner */}
          <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-border bg-card">
            {event.images[0]?.url ? (
              <img
                src={event.images[0].url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-faint bg-bg-elevated/40">
                No hero banner uploaded
              </div>
            )}
            <div className="absolute top-4 left-4">
              <StatusBadge status={event.status} />
            </div>
          </div>

          {/* Details */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6">
            <div>
              <span className="text-[10px] font-bold text-lime uppercase tracking-widest block mb-1">
                {event.category.name}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold font-archivo text-text-main">
                {event.title}
              </h1>
            </div>

            <div className="h-[1px] bg-border/60" />

            <div className="prose prose-invert max-w-none text-sm text-text-muted leading-relaxed">
              {event.description}
            </div>
          </div>
        </div>

        {/* Sidebar panel */}
        <div className="space-y-6">
          {/* Summary / Stats info */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <h3 className="font-bold text-sm text-text-main uppercase tracking-wider font-[family-name:var(--font-archivo)]">
              Console Dashboard
            </h3>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-text-muted">Sign-ups Progress</span>
                <span className="text-text-main">
                  {event._count.registrations} / {event.capacity}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-border overflow-hidden">
                <div
                  className="h-full bg-lime rounded-full"
                  style={{ width: `${Math.min((event._count.registrations / event.capacity) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* List metrics */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3 text-xs">
                <Calendar className="w-4 h-4 text-text-faint mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-text-main block">Date & Time</span>
                  <span className="text-text-faint">
                    {format(new Date(event.date), "EEEE, MMM d, yyyy")}
                    <br />
                    {format(new Date(event.date), "h:mm a")}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <MapPin className="w-4 h-4 text-text-faint mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-text-main block">Venue</span>
                  <span className="text-text-faint">{event.location}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <Lock className="w-4 h-4 text-text-faint mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-text-main block">Access Limit</span>
                  <span className="text-text-faint">
                    {event.isClosed ? "Invite only / Closed" : "Open for all students"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Organizer details */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-text-main uppercase tracking-wider font-[family-name:var(--font-archivo)]">
              Organizer details
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-lime/20 border border-lime/30 flex items-center justify-center text-lime font-bold text-sm">
                {event.organizer.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-text-main text-xs block">{event.organizer.name}</span>
                <span className="text-[11px] text-text-faint block truncate">{event.organizer.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
