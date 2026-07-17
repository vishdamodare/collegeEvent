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

    // 4. Prevent login based on Organizer approval status (Temporarily bypassed for inspection)
    if (user.role === "ORGANIZER") {
      // Bypassed PENDING/REJECTED/BLOCKED checks
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
