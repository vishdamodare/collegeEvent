import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  const targetEmail = process.argv[2] || "ganeshdembla1@gmail.com";

  console.log(`\n🔍 Searching for student with email: "${targetEmail}"...`);

  const user = await prisma.user.findFirst({
    where: { 
      email: {
        equals: targetEmail,
        mode: "insensitive",
      }
    },
    include: { 
      studentProfile: true,
      sessions: true,
    }
  });

  if (user) {
    console.log("\n✅ USER AND PROFILE FOUND:");
    console.log(JSON.stringify(user, null, 2));
  } else {
    console.log(`\n❌ No user found with email "${targetEmail}".`);
    console.log("\n📋 All Registered Users in Database:");
    const allUsers = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" }
    });
    console.table(allUsers);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
