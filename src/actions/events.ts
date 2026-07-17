"use server";

import { prisma } from "@/lib/prisma";
import { EventStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
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
      _count: { select: { registrations: true, savedBy: true } },
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
  const { take = 12, skip = 0, categorySlug, search, sortBy = "date" } = options ?? {};

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
        _count: { select: { registrations: true, savedBy: true } },
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
        },
      },
      _count: { select: { registrations: true, savedBy: true } },
    },
  });

  if (event?.organizerId && event.organizer) {
    const totalEvents = await prisma.event.count({
      where: { organizerId: event.organizerId, status: EventStatus.PUBLISHED }
    });
    (event.organizer as any).totalEvents = totalEvents;
  }

  return event;
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
      _count: { select: { registrations: true } },
    },
    orderBy: { date: "asc" },
    take: 4,
  });
}

/**
 * Fetch homepage stats (counts).
 */
export async function getHomepageStats() {
  const [totalEvents, totalCategories, totalOrganizers] = await Promise.all([
    prisma.event.count({ where: { status: EventStatus.PUBLISHED } }),
    prisma.category.count({ where: { isArchived: false } }),
    prisma.user.count({ where: { role: { in: ["ORGANIZER", "SUPER_ADMIN"] } } }),
  ]);

  return { totalEvents, totalCategories, totalOrganizers };
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
      _count: { select: { registrations: true, savedBy: true } }
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
      _count: { select: { registrations: true, savedBy: true } }
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

export async function getDynamicColleges() {
  const organizers = await prisma.organizerProfile.findMany({
    include: {
      user: {
        include: {
          events: {
            where: { status: EventStatus.PUBLISHED },
            include: {
              category: true,
              registrations: true,
            }
          }
        }
      }
    }
  });

  const collegeMap: Record<string, any> = {};

  for (const org of organizers) {
    const name = org.college;
    if (!name) continue;

    let city = "Mumbai";
    let state = "Maharashtra";
    if (org.address) {
      const parts = org.address.split(",");
      if (parts.length >= 2) {
        city = parts[parts.length - 2].trim();
        state = parts[parts.length - 1].trim();
      }
    } else {
      const upperName = name.toUpperCase();
      if (upperName.includes("PUNE")) {
        city = "Pune";
      } else if (upperName.includes("DELHI")) {
        city = "Delhi";
        state = "Delhi";
      } else if (upperName.includes("PILANI")) {
        city = "Pilani";
        state = "Rajasthan";
      } else if (upperName.includes("IIT BOMBAY") || upperName.includes("MUMBAI")) {
        city = "Mumbai";
      }
    }

    const events = org.user.events;
    const activeEventsCount = events.length;

    let totalRegistrations = 0;
    const categoryNames = new Set<string>();

    events.forEach(ev => {
      totalRegistrations += ev.registrations.length;
      categoryNames.add(ev.category.name);
    });

    if (!collegeMap[name]) {
      collegeMap[name] = {
        name,
        city,
        state,
        verified: org.verificationStatus === "APPROVED",
        activeEvents: 0,
        totalRegistrations: 0,
        categories: new Set<string>(),
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        img: getCollegeBanner(name),
      };
    }

    collegeMap[name].activeEvents += activeEventsCount;
    collegeMap[name].totalRegistrations += totalRegistrations;
    events.forEach(ev => collegeMap[name].categories.add(ev.category.name));
  }

  const collegesList = Object.values(collegeMap).map((col: any) => {
    const hash = col.name.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const followersCount = (col.totalRegistrations * 3 + (hash % 100) * 12 + 150);
    const ratingVal = (4.5 + (hash % 5) * 0.1).toFixed(1);

    return {
      name: col.name,
      loc: `${col.city}, ${col.state}`,
      city: col.city,
      state: col.state,
      events: col.activeEvents.toString(),
      students: (col.totalRegistrations * 2.5 + (hash % 200) + 120).toFixed(0),
      img: col.img,
      slug: col.slug,
      verified: col.verified,
      followers: followersCount.toLocaleString(),
      upcomingEvents: col.activeEvents.toString(),
      rating: `${ratingVal} ★`,
      categories: Array.from(col.categories).slice(0, 3).join(", ") || "Technical, Cultural",
    };
  });

  collegesList.sort((a: any, b: any) => parseInt(b.students) - parseInt(a.students));
  return collegesList;
}

function getCollegeBanner(name: string): string {
  const upper = name.toUpperCase();
  if (upper.includes("ATHARVA")) {
    return "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000&auto=format&fit=crop";
  }
  if (upper.includes("IIT BOMBAY") || upper.includes("IITB")) {
    return "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000&auto=format&fit=crop";
  }
  if (upper.includes("BITS PILANI")) {
    return "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop";
  }
  return "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000&auto=format&fit=crop";
}
