import { EventStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { campusFor } from "@/lib/campuses";
import { cache } from "react";

/**
 * SEO landing pages under /college-events/[topic]. Every page is a live database query, not static copy.
 * A topic is only indexable (and only listed in the sitemap) once it has MIN_EVENTS public events,
 * so empty topics (e.g. Pune before any Pune college joins) never become thin pages.
 */
export const MIN_EVENTS = 2;

export interface Topic {
  slug: string;
  /** Short label for links */
  label: string;
  h1: string;
  title: string;
  description: string;
  intro: string;
  where: Prisma.EventWhereInput;
  /** Extra filter that needs the event's JSON details (Prisma can't express it cleanly) */
  filter?: (details: unknown) => boolean;
}

const hasPrizes = (details: unknown) => {
  const prizes = (details as { rules?: { prizes?: unknown[] } } | null)?.rules?.prizes;
  return Array.isArray(prizes) && prizes.length > 0;
};
const textHas = (word: string): Prisma.EventWhereInput => ({
  OR: [{ title: { contains: word, mode: "insensitive" } }, { description: { contains: word, mode: "insensitive" } }],
});

export const TOPICS: Topic[] = [
  {
    slug: "mumbai",
    label: "Mumbai",
    h1: "College events in Mumbai",
    title: "College Events in Mumbai — Fests, Hackathons & Competitions | CollegeEvents",
    description: "Upcoming college fests, hackathons, dance and music competitions at Mumbai colleges. See dates and venues, and register free on CollegeEvents.",
    intro: "Fests, hackathons, robotics contests and cultural competitions hosted by colleges across Mumbai. Every event below is posted by the organising college itself, with its real date, venue and registration details.",
    where: { location: { contains: "mumbai", mode: "insensitive" } },
  },
  {
    slug: "pune",
    label: "Pune",
    h1: "College events in Pune",
    title: "College Events in Pune — Fests, Hackathons & Competitions | CollegeEvents",
    description: "College fests, hackathons and student competitions happening at Pune colleges, with dates, venues and free registration on CollegeEvents.",
    intro: "College fests, hackathons and student competitions hosted by Pune colleges. Events appear here as soon as a Pune college publishes them on CollegeEvents.",
    where: { location: { contains: "pune", mode: "insensitive" } },
  },
  {
    slug: "india",
    label: "All of India",
    h1: "College events across India",
    title: "College Events in India — Upcoming Fests & Competitions | CollegeEvents",
    description: "Every upcoming college event on CollegeEvents: tech fests, hackathons, cultural nights and competitions from colleges across India, in one place.",
    intro: "Every public college event on CollegeEvents in one place: technical fests, hackathons, cultural nights, sports and competitions from colleges across India, sorted by date.",
    where: {},
  },
  {
    slug: "technical",
    label: "Technical events",
    h1: "Technical events for college students",
    title: "Technical Events for College Students — Coding, Robotics & AI | CollegeEvents",
    description: "Coding contests, robotics challenges and AI competitions at colleges in India. Check dates, team sizes and prizes, then register for free.",
    intro: "Coding contests, robotics challenges and AI competitions run by college tech fests and student branches. Each listing shows the team size, prizes and the date the event runs.",
    where: { category: { slug: { in: ["technical", "robotics", "ai"] } } },
  },
  {
    slug: "hackathons",
    label: "Hackathons",
    h1: "College hackathons",
    title: "College Hackathons in India — Upcoming Student Hackathons | CollegeEvents",
    description: "Upcoming student hackathons at colleges in India, from 24-hour build sprints to AI challenges. See dates, team sizes and prizes, and register free.",
    intro: "Student hackathons hosted by colleges, from 24-hour build sprints to AI challenges with industry mentors. Team sizes, prizes and dates are listed for each one.",
    where: { OR: [{ category: { slug: "hackathons" } }, { title: { contains: "hackathon", mode: "insensitive" } }] },
  },
  {
    slug: "cultural-fests",
    label: "Cultural fests",
    h1: "College cultural fests",
    title: "College Cultural Fests — Dance, Music & Talent Events | CollegeEvents",
    description: "Dance battles, singing competitions, band nights and talent shows at college cultural fests. See dates and venues, and register free on CollegeEvents.",
    intro: "Dance battles, singing competitions, band nights and talent shows from college cultural fests. Pick an event to see its rules, team size and venue.",
    where: { category: { slug: { in: ["cultural", "dance", "music"] } } },
  },
  {
    slug: "workshops",
    label: "Workshops",
    h1: "College workshops",
    title: "College Workshops for Students | CollegeEvents",
    description: "Hands-on workshops run by colleges and student clubs, with dates, venues and free registration on CollegeEvents.",
    intro: "Hands-on workshops run by colleges and student clubs. Workshops appear here as soon as a college publishes one.",
    where: textHas("workshop"),
  },
  {
    slug: "competitions",
    label: "Competitions",
    h1: "College competitions with prizes",
    title: "College Competitions with Prizes — Coding, Dance, Music & More | CollegeEvents",
    description: "Inter-college competitions with cash prizes and goodies: hackathons, robotics, dance, singing and more. See prizes and dates, and register free.",
    intro: "Inter-college competitions that award prizes, from hackathons and robotics to dance battles and singing contests. Only events with prizes announced by the organiser are listed.",
    where: {},
    filter: hasPrizes,
  },
];

export const topicBySlug = (slug: string) => TOPICS.find((t) => t.slug === slug);

const PUBLIC = [EventStatus.PUBLISHED, EventStatus.COMPLETED];

/** Public events for a topic: upcoming first (soonest first), then recently held. Cached per request (metadata + page share it). */
export const getTopicEvents = cache(async function getTopicEvents(topic: Topic) {
  const rows = await prisma.event.findMany({
    where: { AND: [{ status: { in: PUBLIC } }, topic.where] },
    orderBy: { date: "asc" },
    omit: { details: !topic.filter },
    include: {
      category: { select: { name: true, color: true } },
      images: { where: { isHero: true }, take: 1, select: { url: true } },
      organizer: { select: { name: true, organizerProfile: { select: { college: true } } } },
      _count: { select: { registrations: { where: { status: { not: "CANCELLED" } } } } },
    },
  });
  const events = topic.filter ? rows.filter((e) => topic.filter!((e as { details?: unknown }).details)) : rows;
  const now = Date.now();
  const upcoming = events.filter((e) => e.status === EventStatus.PUBLISHED && e.date.getTime() >= now);
  const past = events.filter((e) => !upcoming.includes(e)).reverse().slice(0, 6);
  const colleges = new Set(events.map((e) => campusFor(e.organizer.organizerProfile?.college)?.name ?? e.organizer.name));
  return { upcoming, past, total: events.length, colleges: [...colleges] };
});

/** Which topics currently have enough events to be worth indexing (used by the sitemap). */
export async function indexableTopics() {
  const counts = await Promise.all(TOPICS.map(async (t) => [t, (await getTopicEvents(t)).total] as const));
  return counts.filter(([, n]) => n >= MIN_EVENTS).map(([t]) => t);
}
