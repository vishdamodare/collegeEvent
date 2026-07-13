"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function verifyEmailAction(token: string) {
  if (!token) {
    return { success: false, error: "Verification token is required" };
  }

  try {
    // Verify email using Better Auth API
    await auth.api.verifyEmail({
      query: {
        token,
      },
    });

    return { success: true, message: "Email verified successfully! You can now log in." };
  } catch (error: any) {
    console.error("Email verification action error:", error);
    return {
      success: false,
      error: error.message || "Verification link is invalid or has expired.",
    };
  }
}

export async function resendVerificationAction(email: string) {
  if (!email) {
    return { success: false, error: "Email is required" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: "No user found with that email address." };
    }

    if (user.emailVerified) {
      return { success: false, error: "This email address is already verified." };
    }

    // Call Better Auth to generate a new token and send verification email
    await auth.api.sendVerificationEmail({
      body: {
        email,
      },
    });

    return { success: true, message: "Verification email sent successfully." };
  } catch (error: any) {
    console.error("Resend verification action error:", error);
    return {
      success: false,
      error: error.message || "Failed to resend verification email.",
    };
  }
}
