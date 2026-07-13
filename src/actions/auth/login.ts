"use server";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/validators/loginSchema";

export async function loginAction(formData: any) {
  // 1. Validate credentials format using Zod
  const validation = loginSchema.safeParse(formData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Validation failed",
    };
  }

  const { email } = validation.data;

  try {
    // 2. Retrieve user and their roles/status
    const user = await prisma.user.findUnique({
      where: { email },
      include: { organizerProfile: true },
    });

    if (!user) {
      // Avoid revealing account existence for security
      return { success: true };
    }

    // 3. Prevent login if Student email is not verified
    if (user.role === "STUDENT" && !user.emailVerified) {
      return {
        success: false,
        code: "EMAIL_NOT_VERIFIED",
        error: "Your email address is not verified. Please verify your email to log in.",
      };
    }

    // 4. Prevent login based on Organizer approval status
    if (user.role === "ORGANIZER") {
      const status = user.organizerProfile?.verificationStatus;
      if (status === "PENDING") {
        return {
          success: false,
          code: "ORGANIZER_PENDING",
          error: "Your organizer account is pending approval. You will receive an email once approved.",
        };
      }
      if (status === "REJECTED") {
        return {
          success: false,
          code: "ORGANIZER_REJECTED",
          error: "Your organizer application has been declined.",
        };
      }
      if (status === "BLOCKED") {
        return {
          success: false,
          code: "ORGANIZER_BLOCKED",
          error: "Your account is blocked. Please contact system support.",
        };
      }
    }

    // Return success to proceed with Better Auth client signIn
    return { success: true, role: user.role };
  } catch (error: any) {
    console.error("Login action validation error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}
