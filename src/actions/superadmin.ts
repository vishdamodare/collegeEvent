"use server";

import { revalidatePath } from "next/cache";
import { EventStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superadmin";

const ORGANIZER_STATUSES = ["PENDING", "APPROVED", "REJECTED", "BLOCKED"] as const;
type OrganizerStatus = (typeof ORGANIZER_STATUSES)[number];
const INQUIRY_STATUSES = ["NEW", "READ", "RESOLVED"] as const;
type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

const ORGANIZER_MESSAGES: Record<OrganizerStatus, string> = {
  APPROVED: "Your organizer account has been approved. You can now create and manage events.",
  REJECTED: "Your organizer application was not approved. Please contact support if you think this is a mistake.",
  BLOCKED: "Your organizer account has been suspended. Please contact support.",
  PENDING: "Your organizer account is back under review.",
};

/** Approve / reject / block / reinstate an organizer. Only super admins (checked against the DB). */
export async function setOrganizerStatus(userId: string, status: string) {
  let admin;
  try {
    admin = await requireSuperAdmin("throw");
  } catch {
    return { error: "Not allowed." };
  }
  if (!ORGANIZER_STATUSES.includes(status as OrganizerStatus)) return { error: "Invalid status." };
  const next = status as OrganizerStatus;

  try {
    const profile = await prisma.organizerProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!profile) return { error: "Organizer not found." };

    await prisma.$transaction([
      prisma.organizerProfile.update({
        where: { userId },
        data: {
          verificationStatus: next,
          approvedBy: next === "APPROVED" ? admin.id : null,
          approvedAt: next === "APPROVED" ? new Date() : null,
        },
      }),
      prisma.notification.create({ data: { userId, message: ORGANIZER_MESSAGES[next] } }),
    ]);
    revalidatePath("/superadmin", "layout");
    return { success: true };
  } catch (err) {
    console.error("setOrganizerStatus failed:", err);
    return { error: "Could not update the organizer. Please try again." };
  }
}

/** Publish / unpublish (archive) / cancel any event on the platform. */
export async function setEventStatus(eventId: string, status: string) {
  try {
    await requireSuperAdmin("throw");
  } catch {
    return { error: "Not allowed." };
  }
  if (!Object.values(EventStatus).includes(status as EventStatus)) return { error: "Invalid status." };

  try {
    const event = await prisma.event.update({
      where: { id: eventId },
      data: { status: status as EventStatus },
      select: { title: true, organizerId: true },
    });
    if (status === "ARCHIVED" || status === "CANCELLED") {
      await prisma.notification.create({
        data: { userId: event.organizerId, message: `Your event "${event.title}" was ${status === "ARCHIVED" ? "unpublished" : "cancelled"} by the platform team.` },
      });
    }
    revalidatePath("/superadmin", "layout");
    revalidatePath("/events");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("setEventStatus failed:", err);
    return { error: "Could not update the event. Please try again." };
  }
}

/** Permanently delete an event and everything attached to it (registrations, tickets). Irreversible. */
export async function deleteEventAsSuperAdmin(eventId: string) {
  try {
    await requireSuperAdmin("throw");
  } catch {
    return { error: "Not allowed." };
  }
  try {
    await prisma.event.delete({ where: { id: eventId } });
    revalidatePath("/superadmin", "layout");
    revalidatePath("/events");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("deleteEventAsSuperAdmin failed:", err);
    return { error: "Could not delete the event." };
  }
}

/** Mark a homepage contact inquiry as NEW / READ / RESOLVED. */
export async function setInquiryStatus(inquiryId: string, status: string) {
  try {
    await requireSuperAdmin("throw");
  } catch {
    return { error: "Not allowed." };
  }
  if (!INQUIRY_STATUSES.includes(status as InquiryStatus)) return { error: "Invalid status." };

  try {
    await prisma.inquiry.update({
      where: { id: inquiryId },
      data: { status },
    });
    revalidatePath("/superadmin", "layout");
    return { success: true };
  } catch (err) {
    console.error("setInquiryStatus failed:", err);
    return { error: "Could not update the inquiry." };
  }
}

/** Permanently delete a homepage contact inquiry. */
export async function deleteInquiryAsSuperAdmin(inquiryId: string) {
  try {
    await requireSuperAdmin("throw");
  } catch {
    return { error: "Not allowed." };
  }
  try {
    await prisma.inquiry.delete({ where: { id: inquiryId } });
    revalidatePath("/superadmin", "layout");
    return { success: true };
  } catch (err) {
    console.error("deleteInquiryAsSuperAdmin failed:", err);
    return { error: "Could not delete the inquiry." };
  }
}

/** Register a college so organizers can sign up under it. Super admin only. */
export async function registerCollege(name: string) {
  try {
    await requireSuperAdmin("throw");
  } catch {
    return { error: "Not allowed." };
  }
  const clean = name.trim().replace(/\s+/g, " ");
  if (clean.length < 3 || clean.length > 150) return { error: "Enter the college's full name (3–150 characters)." };
  try {
    const dupe = await prisma.college.findFirst({ where: { name: { equals: clean, mode: "insensitive" } }, select: { id: true } });
    if (dupe) return { error: "This college is already registered." };
    await prisma.college.create({ data: { name: clean } });
    revalidatePath("/superadmin", "layout");
    return { success: true };
  } catch (err) {
    console.error("registerCollege failed:", err);
    return { error: "Could not register the college. Please try again." };
  }
}
