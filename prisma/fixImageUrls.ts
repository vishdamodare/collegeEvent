import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function run() {
  // Find all event images
  const images = await prisma.eventImage.findMany();
  console.log("Checking event images count:", images.length);

  let updatedCount = 0;
  for (const img of images) {
    if (img.url.includes("vhtofficial.com")) {
      const fallbackUrl = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1600&auto=format&fit=crop";
      await prisma.eventImage.update({
        where: { id: img.id },
        data: { url: fallbackUrl }
      });
      console.log(`Updated image ${img.id} URL to fallback`);
      updatedCount++;
    }
  }
  console.log(`Finished. Updated ${updatedCount} image URLs.`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
