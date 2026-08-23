import { prisma } from "@/lib/prisma";

/**
 * Shared Singleton Prisma Client instance (`db`).
 * Re-exported from `@/lib/prisma` to ensure a single shared PrismaClient across the app.
 */
export const db = prisma;

