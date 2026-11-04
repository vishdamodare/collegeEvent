import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import { nextCookies } from "better-auth/next-js";
import { appUrl } from "@/lib/app-url";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: appUrl,
  trustedOrigins: [
    appUrl,
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.NODE_ENV !== "production"
      ? [3000, 3001, 3002, 3003, 3004, 3005].map((p) => `http://localhost:${p}`)
      : []),
  ],
  logger: {
    level: process.env.NODE_ENV === "production" ? "error" : "debug",
  },
  // ponytail: memory storage is per serverless instance; switch to storage:"database" (needs a rateLimit model + db push) for global limits
  rateLimit: { enabled: true, window: 60, max: 30 },
  plugins: [
    nextCookies(),
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, token }) => {
      const customUrl = `${appUrl}/reset-password?token=${token}`;
      await sendPasswordResetEmail(user.email, customUrl);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  emailVerification: {
    sendOnSignUp: false,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url }) => {
      // Extract the token parameter from the Better Auth API URL
      const token = url.split("token=")[1] || "";
      const customUrl = `${appUrl}/verify-email?token=${token}`;
      await sendVerificationEmail(user.email, customUrl);
    },
  },
  session: {
    // Signed cookie holds the session for 5 min so each page skips ~2 DB round trips to Neon
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STUDENT",
        input: false, // never settable from signup/update-user request bodies
      },
      passwordHash: {
        type: "string",
        required: false,
        returned: false, // never ship the hash to the browser/session cookie
        input: false,
      },
      provider: {
        type: "string",
        required: false,
        input: false,
      },
      providerId: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  databaseHooks: {
    account: {
      create: {
        after: async (account) => {
          if (account.providerId === "credentials" && account.password) {
            await prisma.user.update({
              where: { id: account.userId },
              data: { passwordHash: account.password },
            });
          }
        },
      },
      update: {
        after: async (account) => {
          if (account.providerId === "credentials" && account.password) {
            await prisma.user.update({
              where: { id: account.userId },
              data: { passwordHash: account.password },
            });
          }
        },
      },
    },
  },
});
export type Session = typeof auth.$Infer.Session;
