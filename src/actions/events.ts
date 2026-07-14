"use server";

import { prisma } from "@/lib/prisma";
import { EventStatus } from "@prisma/client";

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

/**
 * Fetch a single event by slug with all related data.
 */
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
          image: true,
          organizerProfile: {
            select: {
              college: true,
              department: true,
              position: true,
            },
          },
        },
      },
      _count: { select: { registrations: true, savedBy: true } },
    },
  });

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
