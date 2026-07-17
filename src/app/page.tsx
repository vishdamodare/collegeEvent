import { getRecommendedEvents, getCategoryRecommendations, getHomepageStats, getDynamicColleges } from "@/actions/events";
import { HomeClient } from "./HomeClient";
import { format } from "date-fns";
import type { Event } from "@/types";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

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
  if (!color) return "rgba(215,255,61,.4)";
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r},${g},${b},.4)`;
}

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user?.role === "ORGANIZER" || session?.user?.role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  const [dbEvents, dbCategories, stats, dbColleges] = await Promise.all([
    getRecommendedEvents(),
    getCategoryRecommendations(),
    getHomepageStats(),
    getDynamicColleges(),
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

  return <HomeClient events={events} categories={categories} colleges={dbColleges} stats={stats} />;
}
