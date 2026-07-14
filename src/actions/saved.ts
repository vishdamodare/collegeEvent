"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Get the current authenticated user's session.
 * Returns null if not authenticated.
 */
async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user ?? null;
}

/**
 * Save an event for the current user.
 */
export async function saveEvent(eventId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be logged in to save events." };
  }

  try {
    await prisma.savedEvent.create({
      data: {
        userId: user.id,
        eventId,
      },
    });
    return { success: true };
  } catch {
    // Unique constraint violation means already saved
    return { success: true };
  }
}

/**
 * Remove a saved event for the current user.
 */
export async function removeSavedEvent(eventId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be logged in to manage saved events." };
  }

  await prisma.savedEvent.deleteMany({
    where: {
      userId: user.id,
      eventId,
    },
  });

  return { success: true };
}

/**
 * Check if the current user has saved a specific event.
 */
export async function isEventSaved(eventId: string) {
  const user = await getCurrentUser();
  if (!user) return false;

  const saved = await prisma.savedEvent.findUnique({
    where: {
      userId_eventId: {
        userId: user.id,
        eventId,
      },
    },
  });

  return !!saved;
}

/**
 * Get all saved events for the current user.
 */
export async function getSavedEvents() {
  const user = await getCurrentUser();
  if (!user) return [];

  const saved = await prisma.savedEvent.findMany({
    where: { userId: user.id },
    include: {
      event: {
        include: {
          category: true,
          images: { where: { isHero: true }, take: 1 },
          organizer: { select: { id: true, name: true, image: true } },
          _count: { select: { registrations: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return saved;
}
