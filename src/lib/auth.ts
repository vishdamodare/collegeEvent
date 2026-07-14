import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  logger: {
    level: "debug",
  },
  plugins: [
    nextCookies(),
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      // Extract the token parameter from the Better Auth API URL
      const token = url.split("token=")[1] || "";
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const customUrl = `${appUrl}/reset-password?token=${token}`;
      await sendPasswordResetEmail(user.email, customUrl);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url }) => {
      // Extract the token parameter from the Better Auth API URL
      const token = url.split("token=")[1] || "";
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const customUrl = `${appUrl}/verify-email?token=${token}`;
      await sendVerificationEmail(user.email, customUrl);
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STUDENT",
      },
      passwordHash: {
        type: "string",
        required: false,
      },
      provider: {
        type: "string",
        required: false,
      },
      providerId: {
        type: "string",
        required: false,
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
