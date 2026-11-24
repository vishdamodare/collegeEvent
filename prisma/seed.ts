import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── Seed Data ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: "Hackathons", slug: "hackathons", icon: "💻", description: "48-hour building and coding challenges", color: "#A3E635" },
  { name: "Sports", slug: "sports", icon: "🏆", description: "Athletics, indoor and outdoor tournament matches", color: "#3B82F6" },
  { name: "Technical", slug: "technical", icon: "⚙️", description: "Coding contests, web dev, and core engineering events", color: "#F59E0B" },
  { name: "Music", slug: "music", icon: "🎧", description: "Band concerts, solo performances, and DJ nights", color: "#EC4899" },
  { name: "Dance", slug: "dance", icon: "💃", description: "Solo, duo, and group choreography show-offs", color: "#EF4444" },
  { name: "Gaming", slug: "gaming", icon: "🎮", description: "E-sports, LAN gaming tournaments, and console wars", color: "#8B5CF6" },
  { name: "Startup", slug: "startup", icon: "🚀", description: "Pitching challenges, business plans, and panel talks", color: "#10B981" },
  { name: "Robotics", slug: "robotics", icon: "🤖", description: "Robo-wars, drone racing, and autonomous bots", color: "#6B7280" },
  { name: "AI", slug: "ai", icon: "🧠", description: "Generative AI workshops, build-offs, and hackathons", color: "#06B6D4" },
];

const DEMO_ORGANIZER = {
  email: "organizer@collegeevent.dev",
  name: "Demo Organizer",
  role: UserRole.ORGANIZER,
  emailVerified: true,
};

const DEMO_STUDENT = {
  email: "student@collegeevent.dev",
  name: "Demo Student",
  role: UserRole.STUDENT,
  emailVerified: true,
};

// ─── Main Seed Function ─────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...\n");

  // 1. Upsert categories
  console.log("📂 Creating categories...");
  const categoryMap: Record<string, string> = {};

  for (const cat of CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        description: cat.description,
        color: cat.color,
      },
      create: cat,
    });
    categoryMap[cat.slug] = created.id;
    console.log(`   ✓ ${cat.icon} ${cat.name}`);
  }

  // 2. Upsert demo organizer user
  console.log("\n👤 Creating demo organizer user...");
  const organizerUser = await prisma.user.upsert({
    where: { email: DEMO_ORGANIZER.email },
    update: {},
    create: {
      ...DEMO_ORGANIZER,
      organizerProfile: {
        create: {
          college: "IIT Bombay",
          department: "Technical Council",
          position: "General Secretary",
          verificationStatus: "APPROVED",
        },
      },
    },
  });
  console.log(`   ✓ ${organizerUser.name} (${organizerUser.email})`);

  // 3. Upsert demo student user
  console.log("\n👤 Creating demo student user...");
  const studentUser = await prisma.user.upsert({
    where: { email: DEMO_STUDENT.email },
    update: {},
    create: {
      ...DEMO_STUDENT,
      studentProfile: {
        create: {
          college: "BITS Pilani",
          branch: "Computer Science",
          academicYear: "3rd Year (2027)",
          interests: ["Coding", "Hackathons", "Music"],
        },
      },
    },
  });
  console.log(`   ✓ ${studentUser.name} (${studentUser.email})`);

  // Real events: npx tsx prisma/seedRealEvents.ts
  console.log("\n✅ Seeding complete!");
}

// ─── Execute ────────────────────────────────────────────────────────────────

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
