import { getFeaturedEvents, getCategories, getHomepageStats } from "@/actions/events";
import { HomeClient } from "./HomeClient";
import { format } from "date-fns";
import type { Event, Category } from "@/types";

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
  // Convert hex to rgba with 0.4 opacity
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r},${g},${b},.4)`;
}

export default async function Home() {
  const [dbEvents, dbCategories, stats] = await Promise.all([
    getFeaturedEvents(),
    getCategories(),
    getHomepageStats(),
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
  const categories: Category[] = dbCategories.map((cat) => ({
    name: cat.name,
    count: `${cat._count.events} event${cat._count.events !== 1 ? "s" : ""}`,
    icon: cat.icon || "📌",
    glow: colorToGlow(cat.color),
  }));

  return <HomeClient events={events} categories={categories} stats={stats} />;
}
