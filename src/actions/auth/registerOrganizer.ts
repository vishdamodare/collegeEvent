"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { organizerSignupSchema } from "@/validators/organizerSignupSchema";

export async function registerOrganizerAction(formData: any) {
  // 1. Server-side validation
  const validation = organizerSignupSchema.safeParse(formData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Validation failed",
    };
  }

  const { name, email, password, college, department, position, verificationDocument } = validation.data;

  try {
    // 2. Check for duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists",
      };
    }

    // 3. Create user in Better Auth
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (!result || !result.user) {
      return {
        success: false,
        error: "Failed to create authentication account",
      };
    }

    // 4. Prisma Transaction to save OrganizerProfile & metadata
    try {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: result.user.id },
          data: {
            role: "ORGANIZER",
            provider: "credentials",
            providerId: email,
          },
        }),
        prisma.organizerProfile.create({
          data: {
            userId: result.user.id,
            college,
            department,
            position,
            verificationStatus: "APPROVED",
            verificationDocument,
          },
        }),
      ]);
    } catch (transactionError) {
      // Manual Rollback to ensure no half-created users exist
      await prisma.user.delete({
        where: { id: result.user.id },
      }).catch((deleteErr) => {
        console.error("Cleanup of user failed during rollback:", deleteErr);
      });
      throw transactionError;
    }

    return {
      success: true,
      message: "Organizer account created! Please verify your email and await admin approval.",
    };
  } catch (error: any) {
    console.error("Organizer registration failed:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred during registration.",
    };
  }
}
