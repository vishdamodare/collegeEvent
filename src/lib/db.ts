import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Singleton Prisma Client instance (Prisma 7 driver adapter pattern).
 *
 * Prisma 7 requires a driver adapter for database connections at runtime.
 * The `@prisma/adapter-pg` adapter handles PostgreSQL connections using the
 * DATABASE_URL environment variable.
 *
 * In development, Next.js hot-reloads modules on every save. Without this
 * pattern each reload would create a new PrismaClient, eventually exhausting
 * the database connection pool. Storing the client on `globalThis` ensures
 * a single instance survives across hot-reloads.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
        "Please add it to your .env file."
    );
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
