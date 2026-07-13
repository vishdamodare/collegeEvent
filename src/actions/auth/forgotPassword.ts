"use server";

import { auth } from "@/lib/auth";
import { forgotPasswordSchema } from "@/validators/passwordSchema";

export async function forgotPasswordAction(formData: any) {
  const validation = forgotPasswordSchema.safeParse(formData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Validation failed",
    };
  }

  const { email } = validation.data;

  try {
    // Call Better Auth to generate a reset link and email it
    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: "/reset-password",
      },
    });

    // Return uniform message to prevent user enumeration attacks
    return {
      success: true,
      message: "If that email is registered, we have sent a password reset link.",
    };
  } catch (error: any) {
    console.error("Forgot password request failed:", error);
    return {
      success: true,
      message: "If that email is registered, we have sent a password reset link.",
    };
  }
}
