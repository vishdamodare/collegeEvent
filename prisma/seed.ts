import "dotenv/config";
import { PrismaClient, Role, EventStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── Seed Data ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: "Hackathons", slug: "hackathons", icon: "💻" },
  { name: "Sports", slug: "sports", icon: "🏆" },
  { name: "Technical", slug: "technical", icon: "⚙️" },
  { name: "Music", slug: "music", icon: "🎧" },
  { name: "Dance", slug: "dance", icon: "💃" },
  { name: "Gaming", slug: "gaming", icon: "🎮" },
  { name: "Startup", slug: "startup", icon: "🚀" },
  { name: "Robotics", slug: "robotics", icon: "🤖" },
  { name: "AI", slug: "ai", icon: "🧠" },
];

const DEMO_ADMIN = {
  email: "admin@collegeevent.dev",
  name: "Demo Admin",
  role: Role.ADMIN,
  emailVerified: true,
};

interface EventSeed {
  title: string;
  description: string;
  date: Date;
  location: string;
  capacity: number;
  categorySlug: string;
  status: EventStatus;
  images: { url: string; isHero: boolean }[];
}

const EVENTS: EventSeed[] = [
  {
    title: "Global Hackathon",
    description:
      "48 hours. 4,000 builders. One campus turned into the biggest hack-night of the year — teams ship real products, judges are ex-founders, and the after-party doesn't stop till sunrise.",
    date: new Date("2026-08-22"),
    location: "Tech Quad, IIT Bombay",
    capacity: 4000,
    categorySlug: "hackathons",
    status: EventStatus.ACTIVE,
    images: [
      {
        url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1600&auto=format&fit=crop",
        isHero: true,
      },
    ],
  },
  {
    title: "Neon Music Fest",
    description:
      "Two nights, three stages, and a lineup built entirely around campus talent plus one surprise headliner nobody's naming yet.",
    date: new Date("2026-09-05"),
    location: "Open Air Arena, BITS Pilani",
    capacity: 9500,
    categorySlug: "music",
    status: EventStatus.ACTIVE,
    images: [
      {
        url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1600&auto=format&fit=crop",
        isHero: true,
      },
    ],
  },
  {
    title: "Startup Sprint",
    description:
      "Pitch a company in 72 hours flat. Real VCs sit on the panel, and the winning team walks out with a term sheet, not just a trophy.",
    date: new Date("2026-09-12"),
    location: "Innovation Hall, NMIMS Mumbai",
    capacity: 1200,
    categorySlug: "startup",
    status: EventStatus.ACTIVE,
    images: [
      {
        url: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1600&auto=format&fit=crop",
        isHero: true,
      },
    ],
  },
  {
    title: "Dance Nationals",
    description:
      "Sixty crews, one floor, and a scoreboard that changes every round. This is the final stop before the national title is decided.",
    date: new Date("2026-09-18"),
    location: "Convocation Ground, Delhi University",
    capacity: 3000,
    categorySlug: "dance",
    status: EventStatus.ACTIVE,
    images: [
      {
        url: "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?q=80&w=1600&auto=format&fit=crop",
        isHero: true,
      },
    ],
  },
  {
    title: "AI Builders Summit",
    description:
      "A day of workshops and demos from students actually shipping AI products, followed by an open build-night with GPUs on tap.",
    date: new Date("2026-09-25"),
    location: "CS Auditorium, IIT Delhi",
    capacity: 2600,
    categorySlug: "ai",
    status: EventStatus.ACTIVE,
    images: [
      {
        url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1600&auto=format&fit=crop",
        isHero: true,
      },
    ],
  },
  {
    title: "Campus Cricket Cup",
    description:
      "Sixteen colleges, three days, one trophy. Bring your college colors — the stands get loud for this one.",
    date: new Date("2026-10-02"),
    location: "Sports Complex, Manipal University",
    capacity: 5000,
    categorySlug: "sports",
    status: EventStatus.ACTIVE,
    images: [
      {
        url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1600&auto=format&fit=crop",
        isHero: true,
      },
    ],
  },
];

// ─── Main Seed Function ─────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...\n");

  // 1. Upsert categories
  console.log("📂 Creating categories...");
  const categoryMap: Record<string, string> = {};

  for (const cat of CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap[cat.slug] = created.id;
    console.log(`   ✓ ${cat.icon} ${cat.name}`);
  }

  // 2. Upsert demo admin user
  console.log("\n👤 Creating demo admin user...");
  const adminUser = await prisma.user.upsert({
    where: { email: DEMO_ADMIN.email },
    update: {},
    create: DEMO_ADMIN,
  });
  console.log(`   ✓ ${adminUser.name} (${adminUser.email})`);

  // 3. Create events
  console.log("\n🎉 Creating events...");
  for (const event of EVENTS) {
    const categoryId = categoryMap[event.categorySlug];
    if (!categoryId) {
      console.warn(`   ⚠ Category "${event.categorySlug}" not found, skipping ${event.title}`);
      continue;
    }

    const existing = await prisma.event.findFirst({
      where: { title: event.title, organizerId: adminUser.id },
    });

    if (existing) {
      console.log(`   ↩ ${event.title} (already exists)`);
      continue;
    }

    await prisma.event.create({
      data: {
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        capacity: event.capacity,
        status: event.status,
        organizerId: adminUser.id,
        categoryId,
        images: {
          createMany: {
            data: event.images,
          },
        },
      },
    });
    console.log(`   ✓ ${event.title}`);
  }

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
