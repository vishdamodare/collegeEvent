import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

/**
 * Starts Google OAuth and returns the user to `next` (same-site path, e.g. "/events/foo?register=true") once signed in.
 * /auth-callback handles first-time students (college onboarding) and then forwards to `next`.
 */
export function signInWithGoogle(next: string) {
  return authClient.signIn.social({
    provider: "google",
    callbackURL: `/auth-callback?targetRole=student&next=${encodeURIComponent(next)}`,
  });
}
