import "dotenv/config";
import { PrismaClient, UserRole, EventStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const ORGANIZER_ID = "yRz4E6zHzEwJaDBGZzYDOFUcmqXs4Yup";

const EVENTS = [
  // 5 Free events
  {
    title: "Rhythm Rumble – Dance Competition",
    description: "An energetic dance competition showcasing group and solo styles including Hip Hop, Contemporary, and Classical. Compete with the best talent across colleges. Entry Fee: Free.",
    date: new Date("2026-08-15T10:00:00Z"),
    location: "Main Auditorium, Atharva College",
    capacity: 500,
    eventType: "TEAM",
    teamMinSize: 2,
    teamMaxSize: 10,
    status: EventStatus.PUBLISHED,
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1600&auto=format&fit=crop"
  },
  {
    title: "Melody Mania – Singing Competition",
    description: "Unleash your vocal chords at the ultimate singing competition. Solo performance event with backing tracks allowed. Entry Fee: Free.",
    date: new Date("2026-08-16T14:00:00Z"),
    location: "Seminar Hall A, Atharva College",
    capacity: 200,
    eventType: "INDIVIDUAL",
    teamMinSize: 1,
    teamMaxSize: 1,
    status: EventStatus.PUBLISHED,
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=1600&auto=format&fit=crop"
  },
  {
    title: "Rangmanch – Drama & Theatre Festival",
    description: "Bring out the actor in you. Stage play and street play competition emphasizing expressions, scripts, and production design. Entry Fee: Free.",
    date: new Date("2026-08-18T11:00:00Z"),
    location: "Open Air Amphitheatre, Atharva College",
    capacity: 800,
    eventType: "TEAM",
    teamMinSize: 4,
    teamMaxSize: 15,
    status: EventStatus.PUBLISHED,
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=1600&auto=format&fit=crop"
  },
  {
    title: "Kala Utsav – Art & Craft Exhibition",
    description: "Showcase your artistic creativity in painting, sketching, and sculpture exhibition. Entry Fee: Free.",
    date: new Date("2026-08-20T09:00:00Z"),
    location: "Exhibition Hall, Atharva College",
    capacity: 150,
    eventType: "INDIVIDUAL",
    teamMinSize: 1,
    teamMaxSize: 1,
    status: EventStatus.PUBLISHED,
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1600&auto=format&fit=crop"
  },
  {
    title: "Verse Vibes – Poetry Slam & Open Mic",
    description: "Express your soul through spoken word, poetry, and storytelling. Standard open mic rules apply. Entry Fee: Free.",
    date: new Date("2026-08-22T17:00:00Z"),
    location: "Library Lounge, Atharva College",
    capacity: 100,
    eventType: "INDIVIDUAL",
    teamMinSize: 1,
    teamMaxSize: 1,
    status: EventStatus.PUBLISHED,
    image: "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?q=80&w=1600&auto=format&fit=crop"
  },

  // 5 Paid events
  {
    title: "Fashion Fusion – Fashion Show",
    description: "Where style meets tradition. Walk the ramp in your custom fusion-wear designs. Entry Fee: ₹500.",
    date: new Date("2026-08-25T18:00:00Z"),
    location: "Campus Central Ground, Atharva College",
    capacity: 1000,
    eventType: "TEAM",
    teamMinSize: 6,
    teamMaxSize: 12,
    status: EventStatus.PUBLISHED,
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop"
  },
  {
    title: "Beat Battle – Solo & Group Dance Championship",
    description: "Heavy bass, high energy, and epic face-offs in solo and group battles. Entry Fee: ₹250.",
    date: new Date("2026-08-27T15:00:00Z"),
    location: "Atharva College Sports Complex",
    capacity: 600,
    eventType: "TEAM",
    teamMinSize: 2,
    teamMaxSize: 8,
    status: EventStatus.PUBLISHED,
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1600&auto=format&fit=crop"
  },
  {
    title: "Echoes of India – Traditional Cultural Fest",
    description: "A celebration of Indian folk dances, music, and food stalls from various states. Entry Fee: ₹150.",
    date: new Date("2026-08-29T10:00:00Z"),
    location: "Entire Campus Grounds, Atharva College",
    capacity: 2000,
    eventType: "INDIVIDUAL",
    teamMinSize: 1,
    teamMaxSize: 1,
    status: EventStatus.PUBLISHED,
    image: "https://images.unsplash.com/photo-1561089689-025b7cd73c24?q=80&w=1600&auto=format&fit=crop"
  },
  {
    title: "Spotlight Showcase – Talent Hunt Competition",
    description: "Do you have an unusual talent? Stand-up comedy, magic tricks, beatboxing — spotlight is yours. Entry Fee: ₹100.",
    date: new Date("2026-08-30T13:00:00Z"),
    location: "Seminar Hall B, Atharva College",
    capacity: 300,
    eventType: "INDIVIDUAL",
    teamMinSize: 1,
    teamMaxSize: 1,
    status: EventStatus.PUBLISHED,
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600&auto=format&fit=crop"
  },
  {
    title: "Cultural Carnival 2026 – Multi-Event Cultural Festival",
    description: "The grand finale. Multi-day carnival with game booths, food tracks, cultural performances, and live music nights. Entry Fee: ₹499.",
    date: new Date("2026-09-01T10:00:00Z"),
    location: "Main College Ground, Atharva College",
    capacity: 5000,
    eventType: "INDIVIDUAL",
    teamMinSize: 1,
    teamMaxSize: 1,
    status: EventStatus.PUBLISHED,
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1600&auto=format&fit=crop"
  }
];

async function run() {
  // 1. Get or create category
  const category = await prisma.category.upsert({
    where: { slug: "cultural" },
    update: {},
    create: {
      name: "Cultural",
      slug: "cultural",
      icon: "🎭",
      description: "Dance, Music, Drama, Art, and other cultural festivals",
      color: "#EC4899"
    }
  });

  console.log("Resolved category:", category.name, category.id);

  // 2. Create the events
  for (const ev of EVENTS) {
    const slug = ev.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // Delete existing if any to allow re-run
    await prisma.event.deleteMany({
      where: { slug }
    });

    const event = await prisma.event.create({
      data: {
        title: ev.title,
        slug,
        description: ev.description,
        date: ev.date,
        location: ev.location,
        capacity: ev.capacity,
        eventType: ev.eventType,
        teamMinSize: ev.teamMinSize,
        teamMaxSize: ev.teamMaxSize,
        status: ev.status,
        organizerId: ORGANIZER_ID,
        categoryId: category.id,
        images: {
          create: {
            url: ev.image,
            isHero: true
          }
        }
      }
    });

    console.log(`Created event: ${event.title} (${event.id})`);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
