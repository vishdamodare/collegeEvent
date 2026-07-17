import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function run() {
  const user = await prisma.user.findUnique({
    where: { email: 'user10@gmail.com' },
    include: { organizerProfile: true }
  });
  console.log("FOUND USER:", user);
}

run().catch(console.error).finally(() => prisma.$disconnect());
