import { getRecommendedEvents, getCategoryRecommendations, getDynamicColleges } from "@/actions/events";
import { HomeClient } from "./HomeClient";
import type { Metadata } from "next";
import { format } from "date-fns";
import type { Event } from "@/types";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { appUrl } from "@/lib/app-url";
import QRCode from "qrcode";


export const dynamic = "force-dynamic";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// The QR in the hero's phone mock links to the site itself. Computed once per server instance.
const siteQr = QRCode.toDataURL(appUrl, { margin: 1, width: 400, errorCorrectionLevel: "M" });

// Same for every visitor, and getDynamicColleges scans all organizers/events/registrations:
// cache for 5 min so most refreshes skip those DB round trips
// Keyed by commit: Vercel's data cache survives deployments, so without this a deploy keeps serving the previous
// deploy's cached (possibly differently shaped) data until the 5 minutes lapse.
const cacheKey = process.env.VERCEL_GIT_COMMIT_SHA ?? "dev";
const getCachedColleges = unstable_cache(getDynamicColleges, ["home-colleges", cacheKey], { revalidate: 300 });

// Badge color map based on category
const badgeMap: Record<string, string> = {
  hackathons: "b-blue",
  sports: "b-green",
  technical: "b-cyan",
  music: "b-pink",
  dance: "b-purple",
  gaming: "b-cyan",
  startup: "b-orange",
  robotics: "b-blue",
  ai: "b-cyan",
};

// Category color to glow map
function colorToGlow(color: string | null): string {
  if (!color) return "rgba(var(--lime-rgb),.4)";
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r},${g},${b},.4)`;
}

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user?.role === "SUPER_ADMIN") {
    redirect("/superadmin");
  }
  if (session?.user?.role === "ORGANIZER") {
    redirect("/admin");
  }

  const [dbEvents, dbCategories, dbColleges, qr] = await Promise.all([
    getRecommendedEvents(),
    getCategoryRecommendations(),
    getCachedColleges(),
    siteQr,
  ]);

  // Map database events to the format existing home components expect
  const events: Event[] = dbEvents.map((ev) => {
    const heroImg = ev.images.find((i) => i.isHero)?.url || ev.images[0]?.url || "";
    const locationParts = ev.location.split(",");
    const venue = locationParts[0]?.trim() || ev.location;
    const college = locationParts.length > 1 ? locationParts.slice(1).join(",").trim() : "Campus";

    return {
      id: ev.id,
      title: ev.title,
      cat: ev.category.name.toUpperCase(),
      college,
      venue,
      date: format(new Date(ev.date), "MMM d"),
      participants: `${ev.capacity.toLocaleString()}+`,
      prize: "",
      img: heroImg,
      sub: ev.description,
      badge: badgeMap[ev.category.slug] || "b-blue",
      slug: ev.slug,
      dateISO: new Date(ev.date).toISOString(),
    };
  });

  // Map database categories to the format CategoryGrid expects
  const categories = dbCategories.map((cat) => ({
    name: cat.name,
    count: `${cat.liveEvents} event${cat.liveEvents !== 1 ? "s" : ""}`,
    icon: cat.icon || "📌",
    glow: colorToGlow(cat.color),
    slug: cat.slug,
    nearestCity: cat.nearestCity,
    trending: cat.trending,
  }));

  return (
    <>
      {/* Organization + WebSite JSON-LD is emitted site-wide by app/layout.tsx */}
      <HomeClient events={events} categories={categories} colleges={dbColleges} qr={qr} />
    </>
  );
}
