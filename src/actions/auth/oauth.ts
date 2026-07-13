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
    const student = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    const organizer = await prisma.organizerProfile.findUnique({
      where: { userId: session.user.id },
    });

    // Synchronize provider and providerId inside User table for OAuth accounts
    if (!session.user.provider || !session.user.providerId) {
      const account = await prisma.account.findFirst({
        where: { userId: session.user.id },
      });
      if (account) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            provider: account.providerId,
            providerId: account.accountId,
            emailVerified: true, // OAuth provider validated email
          },
        });
      }
    }

    return {
      success: true,
      user: session.user,
      hasProfile: !!(student || organizer),
      role: student ? "STUDENT" : organizer ? "ORGANIZER" : null,
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

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          role: "STUDENT",
        },
      }),
      prisma.studentProfile.create({
        data: {
          userId: session.user.id,
          college: data.college,
          branch: data.branch,
          academicYear: `${data.academicYear} (${data.graduationYear})`,
          interests: data.interests,
          profileImage: session.user.image,
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
