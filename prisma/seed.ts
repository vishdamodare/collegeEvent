import "dotenv/config";
import { PrismaClient, UserRole, EventStatus } from "@prisma/client";
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
    status: EventStatus.PUBLISHED,
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
    status: EventStatus.PUBLISHED,
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
    status: EventStatus.PUBLISHED,
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
    status: EventStatus.PUBLISHED,
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
    status: EventStatus.PUBLISHED,
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
    status: EventStatus.PUBLISHED,
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

  // 4. Create events
  console.log("\n🎉 Creating events...");
  for (const event of EVENTS) {
    const categoryId = categoryMap[event.categorySlug];
    if (!categoryId) {
      console.warn(`   ⚠ Category "${event.categorySlug}" not found, skipping ${event.title}`);
      continue;
    }

    const existing = await prisma.event.findFirst({
      where: { title: event.title, organizerId: organizerUser.id },
    });

    if (existing) {
      console.log(`   ↩ ${event.title} (already exists)`);
      continue;
    }

    await prisma.event.create({
      data: {
        title: event.title,
        slug: event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        description: event.description,
        date: event.date,
        location: event.location,
        capacity: event.capacity,
        status: event.status,
        organizerId: organizerUser.id,
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
