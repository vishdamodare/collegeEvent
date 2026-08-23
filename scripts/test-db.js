require("dotenv").config();
const { Pool } = require("pg");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const connectionString = process.env.DATABASE_URL;
console.log("Database URL Host:", connectionString ? connectionString.split("@")[1] : "None");

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

console.log("Executing test query: prisma.event.count()...");
const start = Date.now();

prisma.event
  .count()
  .then((count) => {
    console.log(`✅ DB Connection SUCCESS! Total events in DB: ${count} (took ${Date.now() - start}ms)`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ DB Query Error:", err);
    process.exit(1);
  });
