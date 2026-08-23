"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function checkOAuthUserStatusAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check profiles
    const [student, organizer, userRecord] = await Promise.all([
      prisma.studentProfile.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.organizerProfile.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true, email: true, name: true, image: true, provider: true, providerId: true },
      }),
    ]);

    // Synchronize provider and providerId inside User table for OAuth accounts if not populated
    if (userRecord && (!userRecord.provider || !userRecord.providerId)) {
      const account = await prisma.account.findFirst({
        where: { userId: session.user.id },
      });
      if (account) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            provider: account.providerId,
            providerId: account.accountId,
            emailVerified: true, // OAuth providers (Google/GitHub) validate email ownership
          },
        });
      }
    }

    const effectiveRole = userRecord?.role || (student ? "STUDENT" : organizer ? "ORGANIZER" : "STUDENT");

    return {
      success: true,
      user: session.user,
      hasProfile: !!(student || organizer),
      role: effectiveRole,
      organizerStatus: organizer?.verificationStatus || null,
    };
  } catch (error: any) {
    console.error("Failed to check OAuth user status:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function completeOAuthStudentOnboardingAction(data: {
  college: string;
  branch: string;
  academicYear: string;
  graduationYear: string;
  rollNumber?: string;
  interests: string[];
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return { success: false, error: "Not authenticated" };
    }

    if (!data.college || !data.branch || !data.academicYear || !data.graduationYear) {
      return { success: false, error: "Please fill all required academic fields." };
    }

    if (!data.interests || data.interests.length === 0) {
      return { success: false, error: "Please select at least one area of interest." };
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          role: "STUDENT",
        },
      }),
      prisma.studentProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          college: data.college,
          branch: data.branch,
          academicYear: `${data.academicYear} (${data.graduationYear})`,
          studentId: data.rollNumber || null,
          interests: data.interests,
          profileImage: session.user.image || null,
        },
        update: {
          college: data.college,
          branch: data.branch,
          academicYear: `${data.academicYear} (${data.graduationYear})`,
          studentId: data.rollNumber || null,
          interests: data.interests,
          ...(session.user.image ? { profileImage: session.user.image } : {}),
        },
      }),
    ]);

    return { success: true };
  } catch (error: any) {
    console.error("Failed to complete OAuth onboarding:", error);
    return {
      success: false,
      error: error.message || "Failed to complete onboarding details",
    };
  }
}
