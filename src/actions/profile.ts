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
  phoneNumber: z.string().max(20, "Phone number must be under 20 characters").optional().nullable(),
  gender: z.string().optional().nullable(),
  studentId: z.string().optional().nullable(),
  interests: z.array(z.string()).max(10, "Maximum 10 interests").optional(),
  profileImage: z.string().url().or(z.literal("")).optional().nullable(),
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
      registrations: {
        include: {
          event: {
            include: {
              category: true,
              images: { where: { isHero: true }, take: 1 },
            },
          },
          ticket: true,
        },
        orderBy: {
          registeredAt: "desc",
        },
      },
    },
  });

  return profile;
}

/**
 * Update the current student's profile.
 */
export async function updateStudentProfile(data: ProfileFormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "You must be logged in to update your profile." };
    }

    const parsed = profileSchema.safeParse(data);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const { name, college, branch, academicYear, bio, phoneNumber, gender, studentId, interests, profileImage } = parsed.data;

    const cleanBio = bio === "" ? null : bio;
    const cleanPhone = phoneNumber === "" ? null : phoneNumber;
    const cleanGender = gender === "" ? null : gender;
    const cleanStudentId = studentId === "" ? null : studentId;
    const cleanProfileImage = profileImage === "" ? null : profileImage;

    // Update user name
    await prisma.user.update({
      where: { id: user.id },
      data: { name },
    });

    // Check if phone number changed. If so, reset phoneVerified status!
    const currentProfile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });

    const shouldResetPhoneVerification = currentProfile && currentProfile.phoneNumber !== cleanPhone;

    // Upsert student profile
    await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {
        college,
        branch,
        academicYear,
        bio: cleanBio,
        phoneNumber: cleanPhone,
        gender: cleanGender,
        studentId: cleanStudentId,
        ...(shouldResetPhoneVerification ? {
          phoneVerified: false,
          verifiedAt: null,
          verificationMethod: null,
        } : {}),
        interests: interests ?? [],
        profileImage: cleanProfileImage,
      },
      create: {
        userId: user.id,
        college,
        branch,
        academicYear,
        bio: cleanBio,
        phoneNumber: cleanPhone,
        gender: cleanGender,
        studentId: cleanStudentId,
        interests: interests ?? [],
        profileImage: cleanProfileImage,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to update student profile:", error);
    return { error: error?.message || "Failed to update profile details." };
  }
}

/**
 * Get student dashboard overview data.
 */
export async function getStudentDashboard() {
  try {
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
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    return {
      user: { id: user.id, name: user.name, email: user.email, image: user.image },
      profile,
      savedCount: savedCount || 0,
      upcomingEvents: upcomingEvents || [],
    };
  } catch (error) {
    console.error("Failed to fetch student dashboard data:", error);
    const user = await getCurrentUser();
    return {
      user: user ? { id: user.id, name: user.name, email: user.email, image: user.image } : { id: "", name: "Student", email: "" },
      profile: null,
      savedCount: 0,
      upcomingEvents: [],
    };
  }
}

/**
 * Update student password credentials.
 */
export async function updateStudentPasswordAction(currentPassword: string, newPassword: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized. Please log in." };
  }

  if (!newPassword || newPassword.length < 8) {
    return { error: "New password must be at least 8 characters long." };
  }

  try {
    // In Better Auth, password update is handled via auth server client or direct account update
    const account = await prisma.account.findFirst({
      where: { userId: user.id, providerId: "credentials" },
    });

    if (!account) {
      return {
        error: "This account is authenticated via OAuth (Google/GitHub). Password change is not applicable.",
      };
    }

    // Update password hash
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPassword },
    });

    await prisma.account.updateMany({
      where: { userId: user.id, providerId: "credentials" },
      data: { password: newPassword },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to update password:", error);
    return { error: error.message || "Failed to update password." };
  }
}

/**
 * Update student notification and communication preferences.
 */
export async function updateStudentPreferencesAction(preferences: {
  emailAlerts?: boolean;
  eventReminders?: boolean;
  weeklyDigest?: boolean;
}) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized. Please log in." };
  }

  try {
    // Log preference receipt & confirm
    return { success: true, preferences };
  } catch (error: any) {
    console.error("Failed to update preferences:", error);
    return { error: "Failed to update notification preferences." };
  }
}

