import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
  pool: Pool | undefined;
};

function createPrismaClient() {
  let connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
        "Please add it to your .env file."
    );
  }

  // Ensure libpq compatibility parameter is present for pg/pg-connection-string to silence SSL alias warnings
  if (connectionString.includes("sslmode=require") && !connectionString.includes("uselibpqcompat")) {
    connectionString += connectionString.includes("?") ? "&uselibpqcompat=true" : "?uselibpqcompat=true";
  }

  const pool =
    globalForPrisma.pool ??
    new Pool({
      connectionString,
      max: 15,
      // Neon suspends idle computes; drop idle sockets before it does and allow time for a cold start
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 30000,
      keepAlive: true,
    });

  // A socket killed by Neon while idle emits 'error' on the pool; without a listener Node crashes the server
  if (!globalForPrisma.pool) {
    pool.on("error", (err) => console.warn("[db] idle connection dropped:", err.message));
  }

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }

  const adapter = new PrismaPg(pool);

  // Event.details holds coupon codes / meeting passwords — opt in with `omit: { details: false }`
  return new PrismaClient({ adapter, omit: { event: { details: true } } });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
