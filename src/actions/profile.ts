"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user ?? null;
}

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  college: z.string().min(2, "College name is required"),
  branch: z.string().min(2, "Branch is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  bio: z.string().max(500, "Bio must be under 500 characters").optional().nullable(),
  interests: z.array(z.string()).max(10, "Maximum 10 interests").optional(),
  profileImage: z.string().url().optional().nullable(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

/**
 * Get the current student's profile.
 */
export async function getStudentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true, role: true },
      },
    },
  });

  return profile;
}

/**
 * Update the current student's profile.
 */
export async function updateStudentProfile(data: ProfileFormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be logged in to update your profile." };
  }

  const parsed = profileSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, college, branch, academicYear, bio, interests, profileImage } = parsed.data;

  // Update user name
  await prisma.user.update({
    where: { id: user.id },
    data: { name },
  });

  // Upsert student profile
  await prisma.studentProfile.upsert({
    where: { userId: user.id },
    update: {
      college,
      branch,
      academicYear,
      bio: bio ?? null,
      interests: interests ?? [],
      profileImage: profileImage ?? null,
    },
    create: {
      userId: user.id,
      college,
      branch,
      academicYear,
      bio: bio ?? null,
      interests: interests ?? [],
      profileImage: profileImage ?? null,
    },
  });

  return { success: true };
}

/**
 * Get student dashboard overview data.
 */
export async function getStudentDashboard() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [profile, savedCount, upcomingEvents] = await Promise.all([
    prisma.studentProfile.findUnique({
      where: { userId: user.id },
    }),
    prisma.savedEvent.count({
      where: { userId: user.id },
    }),
    prisma.savedEvent.findMany({
      where: {
        userId: user.id,
        event: {
          date: { gte: new Date() },
          status: "PUBLISHED",
        },
      },
      include: {
        event: {
          include: {
            category: true,
            images: { where: { isHero: true }, take: 1 },
          },
        },
      },
      orderBy: { event: { date: "asc" } },
      take: 5,
    }),
  ]);

  return {
    user: { id: user.id, name: user.name, email: user.email, image: user.image },
    profile,
    savedCount,
    upcomingEvents,
  };
}
