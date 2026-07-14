"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Bookmark, Calendar, User, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

interface DashboardOverviewProps {
  data: {
    user: { id: string; name: string; email: string; image?: string | null };
    profile: {
      college: string;
      branch: string;
      academicYear: string;
      interests: string[];
      bio?: string | null;
    } | null;
    savedCount: number;
    upcomingEvents: Array<{
      event: {
        id: string;
        slug: string;
        title: string;
        date: Date;
        location: string;
        category: { name: string; color: string | null };
        images: Array<{ url: string }>;
      };
    }>;
  };
}

export function DashboardOverview({ data }: DashboardOverviewProps) {
  const { user, profile, savedCount, upcomingEvents } = data;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-archivo)]">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="text-text-faint mt-1">Here&apos;s what&apos;s happening with your account.</p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Bookmark}
          label="Saved Events"
          value={savedCount}
          href="/dashboard/saved"
          color="lime"
          delay={0}
        />
        <StatCard
          icon={Calendar}
          label="Upcoming"
          value={upcomingEvents.length}
          href="/dashboard/events"
          color="cobalt"
          delay={0.05}
        />
        <StatCard
          icon={User}
          label="Profile"
          value={profile ? "Complete" : "Incomplete"}
          href="/dashboard/profile"
          color="coral"
          delay={0.1}
        />
      </div>

      {/* Profile card */}
      {!profile && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-text-main">Complete your profile</p>
            <p className="text-xs text-text-faint">Add your college, branch, and interests to get personalized recommendations.</p>
          </div>
          <Link
            href="/dashboard/profile"
            className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap"
          >
            Set up →
          </Link>
        </motion.div>
      )}

      {/* Upcoming saved events */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold font-[family-name:var(--font-archivo)]">
            Upcoming Saved Events
          </h2>
          <Link href="/dashboard/saved" className="text-sm text-text-faint hover:text-lime transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map(({ event }, i) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card hover:border-border-bright transition-all group"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 relative">
                  {event.images[0]?.url ? (
                    <Image
                      src={event.images[0].url}
                      alt={event.title}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="w-full h-full bg-card-hover flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-text-faint" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-main truncate group-hover:text-lime transition-colors">
                    {event.title}
                  </p>
                  <p className="text-xs text-text-faint mt-0.5">
                    {format(new Date(event.date), "MMM d, yyyy")} · {event.location}
                  </p>
                </div>
                <span
                  className="px-2 py-1 rounded-full text-[10px] font-bold uppercase shrink-0"
                  style={{
                    backgroundColor: event.category.color ? `${event.category.color}20` : "rgba(255,255,255,.08)",
                    color: event.category.color || "#fff",
                  }}
                >
                  {event.category.name}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-text-faint">
            <Bookmark className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No upcoming saved events</p>
            <Link href="/events" className="text-sm text-lime hover:underline mt-1 inline-block">
              Discover events →
            </Link>
          </div>
        )}
      </motion.div>

      {/* Notifications placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-border bg-card p-6"
      >
        <h2 className="text-lg font-semibold mb-2 font-[family-name:var(--font-archivo)]">
          Notifications
        </h2>
        <p className="text-sm text-text-faint">
          Notifications will be available in a future update. You&apos;ll be notified about event updates, registration confirmations, and more.
        </p>
      </motion.div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
  color,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  href: string;
  color: string;
  delay: number;
}) {
  const colorMap: Record<string, string> = {
    lime: "bg-lime/10 text-lime border-lime/20",
    cobalt: "bg-cobalt/10 text-cobalt border-cobalt/20",
    coral: "bg-coral/10 text-coral border-coral/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Link
        href={href}
        className="block rounded-2xl border border-border bg-card p-5 hover:border-border-bright transition-all group"
      >
        <div className={`w-9 h-9 rounded-xl ${colorMap[color]} flex items-center justify-center mb-3 border`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <p className="text-2xl font-bold text-text-main">{value}</p>
        <p className="text-xs text-text-faint mt-1">{label}</p>
      </Link>
    </motion.div>
  );
}
