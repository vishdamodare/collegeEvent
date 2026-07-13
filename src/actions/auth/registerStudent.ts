"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { studentSignupSchema } from "@/validators/studentSignupSchema";

export async function registerStudentAction(formData: any) {
  // 1. Server-side validation
  const validation = studentSignupSchema.safeParse(formData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Validation failed",
    };
  }

  const { name, email, password, college, branch, academicYear, graduationYear, interests, profileImage } = validation.data;

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

    // 3. Create user using Better Auth server API
    // This automatically hashes the password, stores it in Account,
    // generates the verification token, and triggers verify email dispatch.
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

    // 4. Prisma Transaction to save StudentProfile & update metadata
    try {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: result.user.id },
          data: {
            role: "STUDENT",
            provider: "credentials",
            providerId: email,
          },
        }),
        prisma.studentProfile.create({
          data: {
            userId: result.user.id,
            college,
            branch,
            academicYear: `${academicYear} (${graduationYear})`,
            interests,
            profileImage,
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
      message: "Student account created successfully! Please verify your email.",
    };
  } catch (error: any) {
    console.error("Student registration failed:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred during registration.",
    };
  }
}
