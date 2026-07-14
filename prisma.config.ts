import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  // Database connection — used by all Prisma CLI commands (db push, migrate, studio, etc.)
  datasource: {
    url: env("DATABASE_URL"),
  },

  // Migration and seed configuration
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
