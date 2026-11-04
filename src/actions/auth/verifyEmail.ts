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
  } catch (error) {
    console.error("Email verification action error:", error);
    return {
      success: false,
      error: "Verification link is invalid or has expired.",
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

    // Same response whether or not the account exists / is verified (no enumeration)
    if (!user || user.emailVerified) {
      return { success: true, message: "If that account needs verification, an email has been sent." };
    }

    // Call Better Auth to generate a new token and send verification email
    await auth.api.sendVerificationEmail({
      body: {
        email,
      },
    });

    return { success: true, message: "Verification email sent successfully." };
  } catch (error) {
    console.error("Resend verification action error:", error);
    return {
      success: false,
      error: "Failed to resend verification email.",
    };
  }
}
