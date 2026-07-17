import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function run() {
  const user = await prisma.user.findUnique({
    where: { email: "demblamahek27@gmail.com" },
    include: { studentProfile: true }
  });
  console.log("USER AND PROFILE:", JSON.stringify(user, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
