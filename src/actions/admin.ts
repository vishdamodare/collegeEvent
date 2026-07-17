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
    totalRegistrations,
    pendingCheckIns,
    recentRegistrationsRaw,
  ] = await Promise.all([
    // Total events for this organizer
    prisma.event.count({ where: { organizerId: user.id } }),
    // Total signups/registrations
    prisma.registration.count({ where: { event: { organizerId: user.id } } }),
    // Pending check-ins (registered, not checked in)
    prisma.registration.count({ where: { event: { organizerId: user.id }, checkedIn: false } }),
    // Recent 5 registrations
    prisma.registration.findMany({
      where: { event: { organizerId: user.id } },
      include: {
        student: { include: { user: true } },
        event: true,
      },
      orderBy: { registeredAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    quickStats: {
      totalEvents,
      totalRegistrations,
      revenue: 0, // Always 0 for free events
      certificates: 0,
      pendingCheckIns,
    },
    recentRegistrations: recentRegistrationsRaw.map((reg) => ({
      id: reg.id,
      participantName: reg.student.user.name || "Student",
      college: reg.student.college,
      eventName: reg.event.title,
    })),
    recentPayments: [], // No payments for free events
    pendingTasks: [], // Start completely clean
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
    // Resolve categoryId: if it looks like a UUID, use it directly.
    // Otherwise, treat it as a name/slug and upsert the category.
    let categoryId = parsed.data.categoryId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
    if (!isUuid) {
      const name = categoryId;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const cat = await prisma.category.upsert({
        where: { slug },
        update: {},
        create: { name, slug, icon: "🏷️", description: `${name} events`, color: "#D7FF3D" },
      });
      categoryId = cat.id;
    }

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
        categoryId,
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
    return { error: `Failed to create event: ${err.message}` };
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
    // Resolve categoryId: if not a UUID, upsert by slug/name
    let categoryId = parsed.data.categoryId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
    if (!isUuid) {
      const name = categoryId;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const cat = await prisma.category.upsert({
        where: { slug },
        update: {},
        create: { name, slug, icon: "🏷️", description: `${name} events`, color: "#D7FF3D" },
      });
      categoryId = cat.id;
    }

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
        categoryId,
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
    return { error: `Failed to update event: ${err.message}` };
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
  description: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  linkedin: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export type OrganizerProfileData = z.infer<typeof organizerProfileSchema>;

export async function updateOrganizerProfile(data: OrganizerProfileData) {
  const user = await getAuthenticatedAdmin();

  const parsed = organizerProfileSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, college, department, position, description, website, instagram, linkedin, address } = parsed.data;

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { name },
    });

    await prisma.organizerProfile.upsert({
      where: { userId: user.id },
      update: { college, department, position, description, website, instagram, linkedin, address },
      create: { userId: user.id, college, department, position, description, website, instagram, linkedin, address },
    });

    revalidatePath("/admin/profile");
    revalidatePath("/admin/college");
    return { success: true };
  } catch (err: any) {
    return { error: "Failed to update organizer profile." };
  }
}

export async function getOrganizerProfile() {
  const user = await getAuthenticatedAdmin();
  const profile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
  });
  return {
    name: user.name || "",
    college: profile?.college || "",
    department: profile?.department || "",
    position: profile?.position || "",
    description: profile?.description || "",
    website: profile?.website || "",
    instagram: profile?.instagram || "",
    linkedin: profile?.linkedin || "",
    address: profile?.address || "",
    verificationStatus: profile?.verificationStatus || "PENDING",
  };
}

// ─── Extra Multi-Tenant SaaS Actions ────────────────────────────────────────

export async function getAdminParticipants() {
  const user = await getAuthenticatedAdmin();
  const registrations = await prisma.registration.findMany({
    where: { event: { organizerId: user.id } },
    include: {
      student: { include: { user: true } },
      event: true,
      ticket: true
    },
    orderBy: { registeredAt: "desc" }
  });

  return registrations.map(reg => ({
    id: reg.id,
    participantName: reg.student.user.name || "Student",
    email: reg.student.user.email || "",
    phone: reg.student.phoneNumber || "",
    college: reg.student.college,
    eventName: reg.event.title,
    ticketNumber: reg.ticket?.ticketNumber || "N/A",
    checkedIn: reg.checkedIn,
    registeredAt: reg.registeredAt
  }));
}

export async function getAdminPayments() {
  await getAuthenticatedAdmin();
  // Multi-tenant Payments (returns 0 for now as all events are free)
  return {
    revenue: 0,
    settled: 0,
    pending: 0,
    refunds: 0,
    transactions: []
  };
}

export async function getAdminAnalytics() {
  const user = await getAuthenticatedAdmin();

  // Past 7 days registration trends
  const dailyRegistrations = [];
  for (let i = 6; i >= 0; i--) {
    const start = new Date();
    start.setDate(start.getDate() - i);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const count = await prisma.registration.count({
      where: {
        event: { organizerId: user.id },
        registeredAt: { gte: start, lt: end }
      }
    });

    const dayName = start.toLocaleDateString("en-US", { weekday: "short" });
    dailyRegistrations.push({ label: dayName, value: count });
  }

  // Top events by signups count
  const topEventsRaw = await prisma.event.findMany({
    where: { organizerId: user.id },
    include: { _count: { select: { registrations: true } } },
    orderBy: { registrations: { _count: "desc" } },
    take: 5
  });

  const topEvents = topEventsRaw.map(e => ({
    name: e.title,
    value: e._count.registrations
  }));

  // Category distribution
  const categoriesRaw = await prisma.category.findMany({
    include: {
      events: {
        where: { organizerId: user.id },
        include: { _count: { select: { registrations: true } } }
      }
    }
  });

  const categoryDistribution = categoriesRaw.map(cat => {
    const count = cat.events.reduce((sum, e) => sum + e._count.registrations, 0);
    return {
      category: cat.name,
      value: count
    };
  }).filter(c => c.value > 0);

  return {
    dailyRegistrations,
    topEvents,
    categoryDistribution
  };
}

export async function getAdminNotifications() {
  const user = await getAuthenticatedAdmin();
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  return notifications.map(n => ({
    id: n.id,
    message: n.message,
    read: n.read,
    createdAt: n.createdAt
  }));
}

export async function createNotification(userId: string, message: string) {
  try {
    await prisma.notification.create({
      data: { userId, message }
    });
  } catch(e) {
    console.error("Failed to create notification:", e);
  }
}

export async function toggleParticipantAttendance(registrationId: string) {
  const user = await getAuthenticatedAdmin();
  const reg = await prisma.registration.findFirst({
    where: { id: registrationId, event: { organizerId: user.id } }
  });
  if (!reg) {
    return { error: "Registration not found or unauthorized" };
  }
  const updated = await prisma.registration.update({
    where: { id: registrationId },
    data: {
      checkedIn: !reg.checkedIn,
      checkedInAt: !reg.checkedIn ? new Date() : null,
      checkInMethod: "MANUAL"
    }
  });
  revalidatePath("/admin/participants");
  revalidatePath("/admin");
  return { success: true, checkedIn: updated.checkedIn };
}

export async function markNotificationRead(notificationId: string) {
  const user = await getAuthenticatedAdmin();
  await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { read: true },
  });
  revalidatePath("/admin/notifications");
  return { success: true };
}

export async function markAllNotificationsRead() {
  const user = await getAuthenticatedAdmin();
  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
  revalidatePath("/admin/notifications");
  return { success: true };
}

export async function deleteNotification(notificationId: string) {
  const user = await getAuthenticatedAdmin();
  await prisma.notification.deleteMany({
    where: { id: notificationId, userId: user.id },
  });
  revalidatePath("/admin/notifications");
  return { success: true };
}

export async function getEligibleCertificateEvents() {
  const user = await getAuthenticatedAdmin();
  const events = await prisma.event.findMany({
    where: {
      organizerId: user.id,
      registrations: { some: { checkedIn: true } },
    },
    include: {
      _count: { select: { registrations: true } },
      registrations: {
        where: { checkedIn: true },
        select: { id: true },
      },
    },
    orderBy: { date: "desc" },
  });

  return events.map((e) => ({
    id: e.id,
    title: e.title,
    date: e.date,
    totalRegistrations: e._count.registrations,
    checkedInCount: e.registrations.length,
  }));
}
