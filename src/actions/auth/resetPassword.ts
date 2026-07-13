"use server";

import { auth } from "@/lib/auth";
import { resetPasswordSchema } from "@/validators/passwordSchema";

export async function resetPasswordAction(formData: any) {
  const validation = resetPasswordSchema.safeParse(formData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Validation failed",
    };
  }

  const { password } = validation.data;
  const { token } = formData;

  if (!token) {
    return {
      success: false,
      error: "Reset token is required.",
    };
  }

  try {
    // Reset password via Better Auth API
    await auth.api.resetPassword({
      body: {
        newPassword: password,
        token,
      },
    });

    return {
      success: true,
      message: "Password reset successfully! Redirecting to login page...",
    };
  } catch (error: any) {
    console.error("Reset password action error:", error);
    return {
      success: false,
      error: error.message || "Failed to reset password. Link may be invalid or expired.",
    };
  }
}
