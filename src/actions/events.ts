"use server";

import { prisma } from "@/lib/prisma";
import { EventStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { CAMPUSES, campusFor } from "@/lib/campuses";
import { headers } from "next/headers";

/**
 * Fetch published events for the homepage hero carousel.
 * Returns the 6 most upcoming published events with their images and categories.
 */
export async function getFeaturedEvents() {
  const events = await prisma.event.findMany({
    where: {
      status: EventStatus.PUBLISHED,
      date: { gte: new Date() },
    },
    include: {
      category: true,
      images: true,
      organizer: {
        select: { id: true, name: true, image: true },
      },
      _count: { select: { registrations: { where: { status: { not: "CANCELLED" } } }, savedBy: true } },
    },
    orderBy: { date: "asc" },
    take: 6,
  });

  return events;
}

/**
 * Fetch all published events for the homepage grid sections.
 */
export async function getPublishedEvents(options?: {
  take?: number;
  skip?: number;
  categorySlug?: string;
  search?: string;
  sortBy?: "date" | "newest" | "oldest" | "alphabetical";
}) {
  const { categorySlug, search, sortBy = "date" } = options ?? {};
  // Public action: never trust caller-supplied paging
  const take = Math.min(100, Math.max(1, Math.trunc(Number(options?.take ?? 12)) || 12));
  const skip = Math.max(0, Math.trunc(Number(options?.skip ?? 0)) || 0);

  const where: Record<string, unknown> = {
    status: EventStatus.PUBLISHED,
  };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy = (() => {
    switch (sortBy) {
      case "newest": return { createdAt: "desc" as const };
      case "oldest": return { createdAt: "asc" as const };
      case "alphabetical": return { title: "asc" as const };
      case "date":
      default: return { date: "asc" as const };
    }
  })();

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        category: true,
        images: { where: { isHero: true }, take: 1 },
        organizer: { select: { id: true, name: true, image: true } },
        _count: { select: { registrations: { where: { status: { not: "CANCELLED" } } }, savedBy: true } },
      },
      orderBy,
      take,
      skip,
    }),
    prisma.event.count({ where }),
  ]);

  return { events, total, hasMore: skip + take < total };
}

/**
 * Fetch all active (non-archived) categories.
 */
export async function getCategories() {
  return prisma.category.findMany({
    where: { isArchived: false },
    include: {
      _count: { select: { events: { where: { status: EventStatus.PUBLISHED } } } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getEventBySlug(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { createdAt: "asc" } },
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          organizerProfile: {
            select: {
              college: true,
              department: true,
              position: true,
              description: true,
              website: true,
              instagram: true,
              linkedin: true,
              address: true,
              verificationStatus: true,
            },
          },
          _count: { select: { events: { where: { status: EventStatus.PUBLISHED } } } },
        },
      },
      _count: { select: { registrations: { where: { status: { not: "CANCELLED" } } }, savedBy: true } },
    },
  });

  if (!event) return event;
  return { ...event, organizer: { ...event.organizer, totalEvents: event.organizer._count.events } };
}

/**
 * Fetch events by the same organizer (for "More by this organizer" section).
 */
export async function getEventsByOrganizer(organizerId: string, excludeEventId?: string) {
  return prisma.event.findMany({
    where: {
      organizerId,
      status: EventStatus.PUBLISHED,
      ...(excludeEventId ? { id: { not: excludeEventId } } : {}),
    },
    include: {
      category: true,
      images: { where: { isHero: true }, take: 1 },
      _count: { select: { registrations: { where: { status: { not: "CANCELLED" } } } } },
    },
    orderBy: { date: "asc" },
    take: 4,
  });
}

/**
 * Fetch homepage stats (counts).
 */
export async function getHomepageStats() {
  const [totalEvents, totalCategories, totalOrganizers, totalStudents, colleges] = await Promise.all([
    prisma.event.count({ where: { status: EventStatus.PUBLISHED } }),
    prisma.category.count({ where: { isArchived: false } }),
    prisma.user.count({ where: { role: { in: ["ORGANIZER", "SUPER_ADMIN"] } } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.organizerProfile.findMany({ select: { college: true } }),
  ]);

  // Distinct listed campuses, not raw college strings (typos / demo rows would inflate it)
  const totalColleges = new Set(colleges.map((c) => campusFor(c.college)?.slug).filter(Boolean)).size;
  return { totalEvents, totalCategories, totalOrganizers, totalStudents, totalColleges };
}

function getCityFromLocation(location: string): string {
  if (!location) return "Mumbai";
  const upper = location.toUpperCase();
  if (upper.includes("PUNE")) return "Pune";
  if (upper.includes("DELHI")) return "Delhi";
  if (upper.includes("PILANI")) return "Pilani";
  if (upper.includes("BOMBAY") || upper.includes("MUMBAI")) return "Mumbai";
  return "Mumbai";
}

export async function getRecommendedEvents() {
  const session = await auth.api.getSession({
    headers: await headers(),
  }).catch(() => null);
  
  const user = session?.user;
  
  const defaultEvents = await prisma.event.findMany({
    where: { status: EventStatus.PUBLISHED },
    include: {
      category: true,
      images: true,
      organizer: {
        select: {
          id: true,
          name: true,
          image: true,
          organizerProfile: {
            select: { college: true, verificationStatus: true }
          }
        }
      },
      _count: { select: { registrations: { where: { status: { not: "CANCELLED" } } }, savedBy: true } }
    },
    orderBy: { date: "asc" },
    take: 8
  });

  if (!user || user.role !== "STUDENT") {
    return defaultEvents;
  }

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
  });

  if (!studentProfile) {
    return defaultEvents;
  }

  const allEvents = await prisma.event.findMany({
    where: { status: EventStatus.PUBLISHED },
    include: {
      category: true,
      images: true,
      organizer: {
        select: {
          id: true,
          name: true,
          image: true,
          organizerProfile: {
            select: { college: true, verificationStatus: true }
          }
        }
      },
      _count: { select: { registrations: { where: { status: { not: "CANCELLED" } } }, savedBy: true } }
    }
  });

  const collegeUpper = studentProfile.college.toUpperCase();
  let studentCity = "Mumbai";
  if (collegeUpper.includes("PUNE")) studentCity = "Pune";
  else if (collegeUpper.includes("DELHI") || collegeUpper.includes("BITS PILANI")) studentCity = "Delhi";
  else if (collegeUpper.includes("MUMBAI") || collegeUpper.includes("BOMBAY")) studentCity = "Mumbai";
  else if (collegeUpper.includes("PILANI")) studentCity = "Pilani";

  const scored = allEvents.map(evt => {
    let score = 0;

    const eventCity = getCityFromLocation(evt.location);
    if (eventCity === studentCity) {
      score += 20;
    }

    if (evt.organizer.organizerProfile?.college === studentProfile.college) {
      score += 35;
    }

    const hasInterest = studentProfile.interests.some(interest => 
      evt.category.name.toLowerCase().includes(interest.toLowerCase()) ||
      evt.title.toLowerCase().includes(interest.toLowerCase())
    );
    if (hasInterest) {
      score += 15;
    }

    if (evt.organizer.organizerProfile?.verificationStatus === "APPROVED") {
      score += 5;
    }

    score += Math.min(10, evt._count.registrations * 0.5);

    return { evt, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 8).map(s => s.evt);
}

export async function getCategoryRecommendations() {
  const session = await auth.api.getSession({
    headers: await headers(),
  }).catch(() => null);
  
  const user = session?.user;
  let studentCity = "Mumbai";

  if (user && user.role === "STUDENT") {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
      select: { college: true }
    });
    if (studentProfile) {
      const collegeUpper = studentProfile.college.toUpperCase();
      if (collegeUpper.includes("PUNE")) studentCity = "Pune";
      else if (collegeUpper.includes("DELHI")) studentCity = "Delhi";
      else if (collegeUpper.includes("PILANI")) studentCity = "Pilani";
      else if (collegeUpper.includes("MUMBAI") || collegeUpper.includes("BOMBAY")) studentCity = "Mumbai";
    }
  }

  const categories = await prisma.category.findMany({
    where: { isArchived: false },
    include: {
      events: {
        where: { status: EventStatus.PUBLISHED },
        select: { location: true }
      }
    }
  });

  const icons: Record<string, string> = {
    ai: "🤖",
    technical: "💻",
    hackathon: "🏆",
    sports: "⚽",
    dance: "💃",
    music: "🎵",
    robotics: "⚙️",
    gaming: "🎮",
    startup: "🚀",
    cultural: "🎭",
  };

  const list = categories.map(cat => {
    const liveEvents = cat.events.length;

    const cities: Record<string, number> = {};
    cat.events.forEach(e => {
      const city = getCityFromLocation(e.location);
      cities[city] = (cities[city] || 0) + 1;
    });

    let topCity = studentCity;
    let maxCount = 0;
    Object.entries(cities).forEach(([city, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCity = city;
      }
    });

    const isTrending = liveEvents > 2 || cat.slug === "hackathon" || cat.slug === "ai";

    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: icons[cat.slug] || cat.icon || "🏷️",
      liveEvents,
      nearestCity: `Mostly in ${topCity}`,
      trending: isTrending,
      color: cat.color || "var(--color-lime)"
    };
  });

  return list;
}

/**
 * Trending Campuses: the listed campuses (src/lib/campuses.ts) with real counts from published events and
 * non-cancelled registrations. Every listed campus always appears, even before its first event.
 */
export async function getDynamicColleges() {
  const organizers = await prisma.organizerProfile.findMany({
    select: {
      college: true,
      verificationStatus: true,
      user: {
        select: {
          events: {
            where: { status: EventStatus.PUBLISHED },
            select: {
              category: { select: { name: true } },
              _count: { select: { registrations: { where: { status: { not: "CANCELLED" } } } } },
            },
          },
        },
      },
    },
  });

  const agg = new Map(CAMPUSES.map((c) => [c.slug, { events: 0, registrations: 0, verified: false, categories: new Set<string>() }]));
  for (const org of organizers) {
    const campus = campusFor(org.college);
    if (!campus) continue; // test/demo organizers and unlisted colleges stay off the public site
    const a = agg.get(campus.slug)!;
    if (org.verificationStatus === "APPROVED") a.verified = true;
    for (const ev of org.user.events) {
      a.events += 1;
      a.registrations += ev._count.registrations;
      a.categories.add(ev.category.name);
    }
  }

  return CAMPUSES.map((c) => {
    const a = agg.get(c.slug)!;
    return {
      name: c.name,
      loc: c.area,
      slug: c.slug,
      img: c.img,
      credit: c.credit,
      rating: c.rating?.toFixed(1),
      events: String(a.events),
      registrations: String(a.registrations),
      verified: a.verified,
      categories: Array.from(a.categories).slice(0, 3).join(", ") || undefined,
    };
  }).sort(
    // Rated campuses lead (Atharva, 5.0), then by activity
    (x, y) => Number(y.rating ?? 0) - Number(x.rating ?? 0) || Number(y.events) - Number(x.events) || Number(y.registrations) - Number(x.registrations)
  );
}
