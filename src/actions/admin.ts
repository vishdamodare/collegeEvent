"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventStatus, UserRole, RegistrationStatus } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Helper to get authenticated user & verify role
async function getAuthenticatedAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user;
  if (!user || (user.role !== UserRole.ORGANIZER && user.role !== UserRole.SUPER_ADMIN)) {
    throw new Error("Unauthorized access");
  }
  return user;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getAdminDashboardStats() {
  const user = await getAuthenticatedAdmin();

  const now = new Date();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    totalEvents,
    publishedEvents,
    draftEvents,
    upcomingEvents,
    todayRegistrations,
    todayCheckIns,
    recentEvents,
    activities,
  ] = await Promise.all([
    // Total events for this organizer
    prisma.event.count({ where: { organizerId: user.id } }),
    // Published
    prisma.event.count({ where: { organizerId: user.id, status: EventStatus.PUBLISHED } }),
    // Drafts
    prisma.event.count({ where: { organizerId: user.id, status: EventStatus.DRAFT } }),
    // Upcoming (published and date in future)
    prisma.event.count({
      where: {
        organizerId: user.id,
        status: EventStatus.PUBLISHED,
        date: { gte: now },
      },
    }),
    // Registrations today for all organizer's events
    prisma.registration.count({
      where: {
        event: { organizerId: user.id },
        registeredAt: { gte: startOfToday },
      },
    }),
    // Check-ins today for all organizer's events
    prisma.registration.count({
      where: {
        event: { organizerId: user.id },
        checkedIn: true,
        checkedInAt: { gte: startOfToday },
      },
    }),
    // Recent 5 events
    prisma.event.findMany({
      where: { organizerId: user.id },
      include: { category: true, _count: { select: { registrations: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Recent activities (mocked timeline from database records)
    prisma.event.findMany({
      where: { organizerId: user.id },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    stats: {
      totalEvents,
      publishedEvents,
      draftEvents,
      upcomingEvents,
      todayRegistrations,
      todayCheckIns,
    },
    recentEvents,
    activities: activities.map((a) => ({
      id: a.id,
      title: a.title,
      type: a.status === "PUBLISHED" ? "published" : a.status === "ARCHIVED" ? "archived" : "updated",
      timestamp: a.updatedAt,
    })),
  };
}

// ─── Event CRUD ──────────────────────────────────────────────────────────────

const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.string().min(1, "Category is required"),
  date: z.coerce.date(),
  location: z.string().min(3, "Location/Venue is required"),
  capacity: z.number().int().min(1, "Capacity must be at least 1"),
  status: z.nativeEnum(EventStatus).default(EventStatus.DRAFT),
  imageUrl: z.string().url().optional().nullable(),
});

export type EventFormData = z.infer<typeof eventFormSchema>;

// Helper to generate unique slug
async function generateUniqueSlug(title: string, currentId?: string): Promise<string> {
  let baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (!baseSlug) baseSlug = "event";

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.event.findFirst({
      where: {
        slug,
        ...(currentId ? { id: { not: currentId } } : {}),
      },
    });

    if (!existing) break;
    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
}

export async function createEvent(data: EventFormData) {
  const user = await getAuthenticatedAdmin();

  const parsed = eventFormSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const slug = await generateUniqueSlug(parsed.data.title);

    const event = await prisma.event.create({
      data: {
        title: parsed.data.title,
        slug,
        description: parsed.data.description,
        date: parsed.data.date,
        location: parsed.data.location,
        capacity: parsed.data.capacity,
        status: parsed.data.status,
        organizerId: user.id,
        categoryId: parsed.data.categoryId,
        ...(parsed.data.imageUrl
          ? {
              images: {
                create: {
                  url: parsed.data.imageUrl,
                  isHero: true,
                },
              },
            }
          : {}),
      },
    });

    revalidatePath("/admin/events");
    revalidatePath("/");
    return { success: true, event };
  } catch (err: any) {
    console.error("Failed to create event:", err);
    return { error: "Failed to create event in database." };
  }
}

export async function updateEvent(id: string, data: EventFormData) {
  const user = await getAuthenticatedAdmin();

  const parsed = eventFormSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Ensure owner
  const existingEvent = await prisma.event.findFirst({
    where: { id, organizerId: user.id },
  });

  if (!existingEvent) {
    return { error: "Event not found or unauthorized" };
  }

  try {
    const slug = await generateUniqueSlug(parsed.data.title, id);

    await prisma.event.update({
      where: { id },
      data: {
        title: parsed.data.title,
        slug,
        description: parsed.data.description,
        date: parsed.data.date,
        location: parsed.data.location,
        capacity: parsed.data.capacity,
        status: parsed.data.status,
        categoryId: parsed.data.categoryId,
      },
    });

    if (parsed.data.imageUrl) {
      // Upsert hero image
      const hero = await prisma.eventImage.findFirst({
        where: { eventId: id, isHero: true },
      });
      if (hero) {
        await prisma.eventImage.update({
          where: { id: hero.id },
          data: { url: parsed.data.imageUrl },
        });
      } else {
        await prisma.eventImage.create({
          data: { eventId: id, url: parsed.data.imageUrl, isHero: true },
        });
      }
    }

    revalidatePath(`/admin/events/${id}`);
    revalidatePath(`/events/${slug}`);
    revalidatePath("/admin/events");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to update event:", err);
    return { error: "Failed to update event in database." };
  }
}

export async function duplicateEvent(id: string) {
  const user = await getAuthenticatedAdmin();

  const event = await prisma.event.findFirst({
    where: { id, organizerId: user.id },
    include: { images: true },
  });

  if (!event) {
    return { error: "Event not found" };
  }

  try {
    const newTitle = `Copy of ${event.title}`;
    const slug = await generateUniqueSlug(newTitle);

    const newEvent = await prisma.event.create({
      data: {
        title: newTitle,
        slug,
        description: event.description,
        date: event.date,
        location: event.location,
        capacity: event.capacity,
        status: EventStatus.DRAFT,
        organizerId: user.id,
        categoryId: event.categoryId,
        images: {
          create: event.images.map((img) => ({
            url: img.url,
            isHero: img.isHero,
          })),
        },
      },
    });

    revalidatePath("/admin/events");
    return { success: true, event: newEvent };
  } catch (err: any) {
    console.error("Failed to duplicate event:", err);
    return { error: "Failed to duplicate event." };
  }
}

export async function deleteEvent(id: string) {
  const user = await getAuthenticatedAdmin();

  // ONLY SUPER_ADMIN is allowed to permanently delete events
  if (user.role !== UserRole.SUPER_ADMIN) {
    return { error: "Only system super admins can permanently delete events." };
  }

  try {
    await prisma.event.delete({ where: { id } });
    revalidatePath("/admin/events");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete event:", err);
    return { error: "Failed to delete event." };
  }
}

export async function archiveEvent(id: string) {
  const user = await getAuthenticatedAdmin();

  const event = await prisma.event.findFirst({
    where: { id, organizerId: user.id },
  });

  if (!event) {
    return { error: "Event not found" };
  }

  try {
    await prisma.event.update({
      where: { id },
      data: { status: EventStatus.ARCHIVED },
    });
    revalidatePath("/admin/events");
    revalidatePath(`/events/${event.slug}`);
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to archive event:", err);
    return { error: "Failed to archive event." };
  }
}

// Fetch events list for data table
export async function getAdminEvents(options?: {
  search?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  page?: number;
  perPage?: number;
}) {
  const user = await getAuthenticatedAdmin();

  const { search, category, status, sortBy = "date", page = 1, perPage = 10 } = options ?? {};
  const skip = (page - 1) * perPage;

  const where: Record<string, any> = {
    organizerId: user.id,
  };

  if (category) {
    where.categoryId = category;
  }

  if (status) {
    where.status = status as EventStatus;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
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
        _count: { select: { registrations: true } },
      },
      orderBy,
      take: perPage,
      skip,
    }),
    prisma.event.count({ where }),
  ]);

  return { events, total, hasMore: skip + perPage < total };
}

// ─── Category CRUD ───────────────────────────────────────────────────────────

export async function createCategory(name: string, icon: string, description: string, color: string) {
  await getAuthenticatedAdmin();

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  try {
    const category = await prisma.category.create({
      data: { name, slug, icon, description, color },
    });
    revalidatePath("/admin/categories");
    return { success: true, category };
  } catch (err: any) {
    return { error: "Category name or slug already exists." };
  }
}

export async function updateCategory(id: string, name: string, icon: string, description: string, color: string) {
  await getAuthenticatedAdmin();

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  try {
    await prisma.category.update({
      where: { id },
      data: { name, slug, icon, description, color },
    });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (err: any) {
    return { error: "Failed to update category." };
  }
}

export async function getAdminCategories() {
  await getAuthenticatedAdmin();
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function archiveCategory(id: string, isArchived: boolean) {
  await getAuthenticatedAdmin();

  // If archiving, ensure no active published events are using this category
  if (isArchived) {
    const count = await prisma.event.count({
      where: { categoryId: id, status: EventStatus.PUBLISHED },
    });
    if (count > 0) {
      return { error: "Cannot archive category. It is currently being used by published events." };
    }
  }

  try {
    await prisma.category.update({
      where: { id },
      data: { isArchived },
    });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (err: any) {
    return { error: "Failed to modify category archive status." };
  }
}

// ─── Organizer Profile & Settings ──────────────────────────────────────────

const organizerProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  college: z.string().min(2, "College name is required"),
  department: z.string().min(2, "Department is required"),
  position: z.string().min(2, "Position is required"),
});

export type OrganizerProfileData = z.infer<typeof organizerProfileSchema>;

export async function updateOrganizerProfile(data: OrganizerProfileData) {
  const user = await getAuthenticatedAdmin();

  const parsed = organizerProfileSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, college, department, position } = parsed.data;

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { name },
    });

    await prisma.organizerProfile.upsert({
      where: { userId: user.id },
      update: { college, department, position },
      create: { userId: user.id, college, department, position },
    });

    revalidatePath("/admin/profile");
    return { success: true };
  } catch (err: any) {
    return { error: "Failed to update organizer profile." };
  }
}
