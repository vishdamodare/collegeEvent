// Creates the IIT Bombay and Atharva (IEEE) organizer accounts and their events.
// Run: IITB_PASSWORD=... ATHARVA_PASSWORD=... npx tsx prisma/seedRealEvents.ts
// Idempotent: existing accounts are reused, events are upserted by slug.
import "dotenv/config";
import { EventStatus } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import { auth } from "../src/lib/auth";

const img = (id: string) => `https://images.unsplash.com/photo-${id}?q=80&w=1600&auto=format&fit=crop`;
const IMG = {
  hackathon: img("1540575467063-178a50c2df87"),
  code: img("1461749280684-dccba630e2f6"),
  codeScreen: img("1555066931-4365d14bab8c"),
  ai: img("1485827404703-89b55fcc595e"),
  robotics: img("1581091226825-a6a2a5aee158"),
  showcase: img("1552664730-d307ca884978"),
  expo: img("1504384308090-c894fdcc538d"),
  danceGroup: img("1524594152303-9fd13543fe6e"),
  danceStage: img("1508700115892-45ecd05ae2ad"),
  danceBattle: img("1516450360452-9312f5e86fc7"),
  singing: img("1511671782779-c97d3d27a1d4"),
  band: img("1470229722913-7c0e2dbbafd3"),
  concert: img("1493225457124-a3eb161ffa5f"),
  talent: img("1492684223066-81342ee5ff30"),
  gaming: img("1542751371-adc38448a05e"),
};

interface Org {
  email: string;
  name: string;
  passwordEnv: string;
  college: string;
  department: string;
  position: string;
  website: string;
  address: string;
  maps: string;
}

const IITB: Org = {
  email: "iitb.admin@collegeevent.in",
  name: "IIT Bombay Fests",
  passwordEnv: "IITB_PASSWORD",
  college: "IIT Bombay",
  department: "Techfest & Mood Indigo",
  position: "Fest Coordinator",
  website: "https://techfest.org",
  address: "Indian Institute of Technology Bombay, Powai, Mumbai, Maharashtra 400076",
  maps: "https://maps.google.com/?q=IIT+Bombay+Powai",
};

const ATHARVA: Org = {
  email: "atharva.admin@collegeevent.in",
  name: "IEEE Atharva Student Branch",
  passwordEnv: "ATHARVA_PASSWORD",
  college: "Atharva College of Engineering",
  department: "IEEE Student Branch",
  position: "Branch Coordinator",
  website: "https://atharvacoe.ac.in",
  address: "Atharva College of Engineering, Malvani, Charkop Naka, Malad (West), Mumbai, Maharashtra 400095",
  maps: "https://maps.google.com/?q=Atharva+College+of+Engineering+Malad",
};

interface Seed {
  title: string;
  category: string; // Category slug (must exist — see seed.ts)
  short: string;
  description: string;
  start: string; // IST, ISO without offset
  end: string;
  closes: string;
  venue: string;
  capacity: number;
  team?: [number, number];
  image: string;
  tags: string[];
  eligibility: string;
  rules: string;
  judging?: string;
  prizes?: { title: string; cashPrize?: number; goodies?: string }[];
  faqs?: { question: string; answer: string }[];
}

const IITB_EVENTS: Seed[] = [
  {
    title: "Techfest 2026 – Perceptron AI Hackathon",
    category: "hackathons",
    short: "Build an AI solution to a real problem statement, presented by the IIT Bombay–Optiver AI Innovation Lab.",
    description:
      "Perceptron is Techfest's flagship AI hackathon. Teams receive a real-world problem statement, submit an abstract, and the shortlisted teams build and demo their solution live at the Techfest Grand Finale at IIT Bombay. Mentors from industry and IIT Bombay faculty support teams through the build window.",
    start: "2026-12-15T09:00", end: "2026-12-18T18:00", closes: "2026-12-08T23:59",
    venue: "Lecture Hall Complex (LHC), IIT Bombay", capacity: 400, team: [2, 4], image: IMG.hackathon,
    tags: ["AI", "Hackathon", "Techfest"],
    eligibility: "Open to undergraduate and postgraduate students from any college. Cross-college teams are allowed.",
    rules: "Bring your own laptops. Pre-trained models and open-source libraries are allowed with attribution. All code must be written during the hackathon window.",
    judging: "Problem fit (30%), technical depth (30%), working demo (25%), presentation (15%).",
    prizes: [{ title: "Winner", cashPrize: 100000 }, { title: "1st Runner-up", cashPrize: 60000 }, { title: "2nd Runner-up", cashPrize: 40000 }],
    faqs: [{ question: "Do all team members need to be from the same college?", answer: "No, cross-college teams are welcome." }],
  },
  {
    title: "Techfest 2026 – ZeroCode Vibe Coding Challenge",
    category: "technical",
    short: "Ship a working app using AI coding tools — no hand-written code required.",
    description:
      "ZeroCode challenges you to go from idea to a deployed app using AI-assisted, prompt-driven development. Judges look at what you shipped, how well it works, and how cleverly you steered the AI tools to get there.",
    start: "2026-12-16T10:00", end: "2026-12-16T18:00", closes: "2026-12-10T23:59",
    venue: "Computer Centre Labs, IIT Bombay", capacity: 300, team: [1, 3], image: IMG.code,
    tags: ["AI", "Coding", "No-code"],
    eligibility: "Open to all college students. No prior programming experience required.",
    rules: "Any AI coding assistant may be used. The final app must be live and demoable at judging time.",
    judging: "Functionality (40%), creativity (30%), UX (20%), presentation (10%).",
    prizes: [{ title: "Winner", cashPrize: 50000 }, { title: "Runner-up", cashPrize: 25000 }],
  },
  {
    title: "Techfest 2026 – Meshmerize Line Follower Bot",
    category: "robotics",
    short: "Build an autonomous bot that maps a maze and races back along the shortest path.",
    description:
      "In Meshmerize, your line follower bot gets a dry run to explore and map an unknown grid-based arena, then a final run in which it must take the shortest route to the end. The fastest accurate final run wins.",
    start: "2026-12-17T09:00", end: "2026-12-18T17:00", closes: "2026-12-05T23:59",
    venue: "Robotics Arena, Gymkhana Grounds, IIT Bombay", capacity: 200, team: [1, 4], image: IMG.robotics,
    tags: ["Robotics", "Autonomous", "Embedded"],
    eligibility: "Open to school and college students.",
    rules: "Bot must be fully autonomous and fit within a 25cm × 25cm × 25cm box. No pre-loaded maps. Off-the-shelf microcontrollers allowed.",
    judging: "Final-run time with penalties for touches and restarts.",
    prizes: [{ title: "Winner", cashPrize: 75000 }, { title: "Runner-up", cashPrize: 45000 }],
  },
  {
    title: "Techfest 2026 – RoboReach Robotic Arm Challenge",
    category: "robotics",
    short: "Design a robotic arm that picks, sorts and places objects with precision.",
    description:
      "RoboReach tests mechanical design and control. Teams build a manually controlled or autonomous robotic arm that has to pick up, sort and place objects across a timed arena course.",
    start: "2026-12-16T09:00", end: "2026-12-17T17:00", closes: "2026-12-05T23:59",
    venue: "Robotics Arena, Gymkhana Grounds, IIT Bombay", capacity: 150, team: [1, 4], image: IMG.ai,
    tags: ["Robotics", "Mechanical", "Control"],
    eligibility: "Open to school and college students.",
    rules: "Arm base must stay within the marked starting zone. Wired or wireless control allowed. Max operating voltage 24V.",
    judging: "Objects placed correctly, time taken, and penalties.",
    prizes: [{ title: "Winner", cashPrize: 60000 }, { title: "Runner-up", cashPrize: 35000 }],
  },
  {
    title: "Techfest 2026 – India @ 71/100 Innovation Showcase",
    category: "startup",
    short: "Pitch and showcase a social-impact innovation for India's 2047 vision.",
    description:
      "Shortlisted teams from the concept-proposal round present working prototypes and pitches in an offline showcase at Techfest. Solutions target healthcare, agriculture, climate, education and governance.",
    start: "2026-12-17T11:00", end: "2026-12-17T17:00", closes: "2026-12-08T23:59",
    venue: "Victor Menezes Convention Centre (VMCC), IIT Bombay", capacity: 250, team: [1, 4], image: IMG.showcase,
    tags: ["Showcase", "Social Impact", "Startup"],
    eligibility: "Open to college students and early-stage student startups.",
    rules: "10-minute pitch plus 5-minute Q&A. A prototype or demo is strongly recommended.",
    judging: "Impact (35%), feasibility (25%), innovation (25%), pitch (15%).",
    prizes: [{ title: "Best Innovation", cashPrize: 50000, goodies: "Incubation mentorship" }],
  },
  {
    title: "Mood Indigo 2026 – Group Dance Competition",
    category: "dance",
    short: "Asia's largest college cultural fest — crews battle it out on the Open Air Theatre stage.",
    description:
      "Mood Indigo's group dance competition brings college crews from across India to IIT Bombay's Open Air Theatre. Any style is welcome — hip-hop, contemporary, Bollywood, classical fusion — judged on choreography, sync and stage presence.",
    start: "2026-12-21T17:00", end: "2026-12-21T22:00", closes: "2026-12-14T23:59",
    venue: "Open Air Theatre (OAT), IIT Bombay", capacity: 600, team: [6, 20], image: IMG.danceGroup,
    tags: ["Dance", "Mood Indigo", "Cultural"],
    eligibility: "College students; all crew members must carry a valid college ID.",
    rules: "Performance time 6–8 minutes including setup. Music on pen drive in MP3. No fire, liquids or glitter on stage.",
    judging: "Choreography (30%), synchronisation (30%), expression (20%), overall impact (20%).",
    prizes: [{ title: "Winner", cashPrize: 75000 }, { title: "Runner-up", cashPrize: 40000 }],
  },
  {
    title: "Mood Indigo 2026 – Street Dance Battle",
    category: "dance",
    short: "1v1 freestyle battles to the DJ's beats. Knockout format.",
    description:
      "Breaking, popping, locking, krump or hip-hop freestyle — dancers face off 1v1 in a knockout bracket to music picked live by the DJ. Prelims in the afternoon, top 16 battle at night.",
    start: "2026-12-22T14:00", end: "2026-12-22T21:00", closes: "2026-12-15T23:59",
    venue: "Student Activity Centre (SAC), IIT Bombay", capacity: 200, image: IMG.danceBattle,
    tags: ["Dance", "Battle", "Freestyle"],
    eligibility: "Open to all college students.",
    rules: "Music is chosen by the DJ. Rounds are 2 × 45 seconds per dancer. No physical contact.",
    judging: "Musicality, technique, creativity and attitude, scored by a 3-judge panel.",
    prizes: [{ title: "Winner", cashPrize: 30000 }, { title: "Runner-up", cashPrize: 15000 }],
  },
  {
    title: "Mood Indigo 2026 – Solo Singing (Western & Indian)",
    category: "music",
    short: "Take the Convocation Hall mic — Western and Indian vocal categories.",
    description:
      "Mood Indigo's solo singing competition has separate Western and Indian categories. Prelims are judged by the Music club, and finalists perform with live accompaniment at Convocation Hall.",
    start: "2026-12-22T11:00", end: "2026-12-22T18:00", closes: "2026-12-15T23:59",
    venue: "Convocation Hall, IIT Bombay", capacity: 250, image: IMG.singing,
    tags: ["Singing", "Music", "Mood Indigo"],
    eligibility: "Open to all college students.",
    rules: "Time limit of 4 minutes. Karaoke tracks or one accompanying instrumentalist allowed. Pick your category when you register.",
    judging: "Pitch and tone (40%), expression (30%), song choice and stage presence (30%).",
    prizes: [{ title: "Winner (each category)", cashPrize: 25000 }],
  },
  {
    title: "Mood Indigo 2026 – Livewire Battle of Bands",
    category: "music",
    short: "Mood Indigo's legendary rock band competition. Original compositions encouraged.",
    description:
      "Livewire is where India's best college bands take the main stage. Bands play a 20-minute set in front of thousands, judged by industry musicians. Covers are allowed, but original music scores higher.",
    start: "2026-12-23T16:00", end: "2026-12-23T23:00", closes: "2026-12-14T23:59",
    venue: "Open Air Theatre (OAT), IIT Bombay", capacity: 400, team: [3, 8], image: IMG.band,
    tags: ["Band", "Rock", "Live Music"],
    eligibility: "At least 50% of band members must be current college students.",
    rules: "20-minute set including soundcheck. Drum kit and amps provided; bring your own instruments and pedals.",
    judging: "Musicianship, originality, tightness and crowd connect.",
    prizes: [{ title: "Winner", cashPrize: 100000, goodies: "Studio recording session" }, { title: "Runner-up", cashPrize: 50000 }],
  },
];

const ATHARVA_EVENTS: Seed[] = [
  {
    title: "IEEE Atharva – HackAtharva 24-Hour Hackathon",
    category: "hackathons",
    short: "24 hours, open innovation, real mentors. Build anything that solves a real problem.",
    description:
      "The IEEE Atharva Student Branch hosts a 24-hour hackathon with open-innovation tracks in AI/ML, web3, healthcare and sustainability. Teams get mentors, food and Wi-Fi all night, and demo to a jury of industry engineers.",
    start: "2027-01-22T10:00", end: "2027-01-23T10:00", closes: "2027-01-15T23:59",
    venue: "Main Building Labs, Atharva College of Engineering", capacity: 300, team: [2, 4], image: IMG.hackathon,
    tags: ["Hackathon", "IEEE", "24 hours"],
    eligibility: "Open to all engineering and diploma students. IEEE membership is not required.",
    rules: "Projects must be started during the event. Use of open-source libraries is allowed. Final demo is 5 minutes.",
    judging: "Innovation (30%), technical complexity (30%), usefulness (25%), presentation (15%).",
    prizes: [{ title: "Winner", cashPrize: 30000 }, { title: "Runner-up", cashPrize: 15000 }, { title: "Best First-Year Team", goodies: "IEEE goodies + certificates" }],
    faqs: [{ question: "Will food be provided?", answer: "Yes, meals and snacks are provided for all 24 hours." }],
  },
  {
    title: "IEEE Atharva – Project Showcase & Tech Expo",
    category: "technical",
    short: "Show off your mini-project, final-year project or research prototype to industry judges.",
    description:
      "A one-day exhibition where students display working hardware and software projects. Visitors and an industry jury walk through the stalls, with awards across IoT, AI, robotics and social impact.",
    start: "2027-01-23T11:00", end: "2027-01-23T17:00", closes: "2027-01-18T23:59",
    venue: "Exhibition Hall, Atharva College of Engineering", capacity: 120, team: [1, 4], image: IMG.expo,
    tags: ["Showcase", "Projects", "Expo"],
    eligibility: "Open to diploma, undergraduate and postgraduate students.",
    rules: "Each team gets one table and a power socket. Projects must be working demos. Bring a poster (A1 size).",
    judging: "Innovation, working demo, practical relevance and explanation.",
    prizes: [{ title: "Best Project", cashPrize: 15000 }, { title: "Best IoT Project", cashPrize: 7500 }],
  },
  {
    title: "IEEE Atharva – Code Relay",
    category: "technical",
    short: "A team coding relay: partners take turns writing code without talking.",
    description:
      "Two coders, one problem set, no talking. Partners swap at the keyboard every 10 minutes and must continue from where the other left off. Tests problem solving, clean code and silent teamwork.",
    start: "2027-01-22T14:00", end: "2027-01-22T17:00", closes: "2027-01-18T23:59",
    venue: "Computer Lab 3, Atharva College of Engineering", capacity: 100, team: [2, 2], image: IMG.codeScreen,
    tags: ["Coding", "DSA", "Relay"],
    eligibility: "Open to all college students.",
    rules: "Languages: C, C++, Java or Python. No internet access. Swaps happen every 10 minutes on the buzzer.",
    judging: "Number of problems solved, with ties broken by total time.",
    prizes: [{ title: "Winner", cashPrize: 6000 }, { title: "Runner-up", cashPrize: 3000 }],
  },
  {
    title: "IEEE Atharva – RoboRace",
    category: "robotics",
    short: "Race your wired or wireless bot through an obstacle track against the clock.",
    description:
      "Build a manually controlled bot to clear ramps, see-saws, sand pits and tight turns on an obstacle course. The fastest clean run wins.",
    start: "2027-01-23T10:00", end: "2027-01-23T16:00", closes: "2027-01-18T23:59",
    venue: "College Ground, Atharva College of Engineering", capacity: 80, team: [2, 4], image: IMG.robotics,
    tags: ["Robotics", "Race", "IEEE"],
    eligibility: "Open to all engineering and diploma students.",
    rules: "Max bot size 30cm × 30cm. Max 12V supply. Bots must not damage the track.",
    judging: "Total time with penalties for hand touches and skipped obstacles.",
    prizes: [{ title: "Winner", cashPrize: 10000 }, { title: "Runner-up", cashPrize: 5000 }],
  },
  {
    title: "IEEE Atharva – BGMI Esports Tournament",
    category: "gaming",
    short: "Squad up for a 2-day BGMI tournament with a live-streamed final.",
    description:
      "Squad-based BGMI tournament run by IEEE Atharva. Online qualifiers on day one, LAN finals on day two in the auditorium with a live stream and shoutcasters.",
    start: "2027-01-22T11:00", end: "2027-01-23T18:00", closes: "2027-01-19T23:59",
    venue: "Auditorium, Atharva College of Engineering", capacity: 160, team: [4, 5], image: IMG.gaming,
    tags: ["Esports", "BGMI", "Gaming"],
    eligibility: "Open to all college students. One substitute is allowed per squad.",
    rules: "Use your own devices. Emulators, hacks and teaming are not allowed and lead to disqualification.",
    judging: "Placement points plus kill points across all matches.",
    prizes: [{ title: "Winning Squad", cashPrize: 12000 }, { title: "MVP", goodies: "Gaming accessories" }],
  },
  {
    title: "Atharva Cultural Night – Group Dance Face-Off",
    category: "dance",
    short: "College crews face off on the main stage at Atharva's cultural night.",
    description:
      "The highlight of the fest's cultural night. Crews perform a themed set in any style — Bollywood, hip-hop, folk or fusion — in front of a packed main-ground crowd.",
    start: "2027-01-24T17:00", end: "2027-01-24T21:00", closes: "2027-01-19T23:59",
    venue: "Main Ground Stage, Atharva College of Engineering", capacity: 400, team: [5, 15], image: IMG.danceStage,
    tags: ["Dance", "Cultural", "Group"],
    eligibility: "Open to all college students with a valid ID.",
    rules: "5–7 minutes per crew. Submit the track by email 2 days before the event. No hazardous props.",
    judging: "Choreography, coordination, costumes and crowd response.",
    prizes: [{ title: "Winner", cashPrize: 20000 }, { title: "Runner-up", cashPrize: 10000 }],
  },
  {
    title: "Atharva Cultural Night – Solo Singing",
    category: "music",
    short: "Bollywood, Western or classical — one voice, one stage.",
    description:
      "An open solo singing competition at Atharva's cultural night. Prelims are held in the seminar hall during the day, and the top 8 perform live on the main stage in the evening.",
    start: "2027-01-24T12:00", end: "2027-01-24T19:00", closes: "2027-01-19T23:59",
    venue: "Seminar Hall & Main Stage, Atharva College of Engineering", capacity: 120, image: IMG.concert,
    tags: ["Singing", "Music", "Solo"],
    eligibility: "Open to all college students.",
    rules: "3–4 minute performance. Karaoke track or a single live instrument allowed.",
    judging: "Pitch, rhythm, voice quality and stage presence.",
    prizes: [{ title: "Winner", cashPrize: 8000 }, { title: "Runner-up", cashPrize: 4000 }],
  },
  {
    title: "Atharva Cultural Night – Talent Showcase",
    category: "dance",
    short: "Stand-up, beatboxing, magic, instruments — any talent, five minutes on stage.",
    description:
      "An open stage for every talent that doesn't fit a category: stand-up comedy, beatboxing, mime, instrumentals, spoken word and more. The audience vote counts towards the final score.",
    start: "2027-01-24T14:00", end: "2027-01-24T17:00", closes: "2027-01-19T23:59",
    venue: "Auditorium, Atharva College of Engineering", capacity: 150, team: [1, 4], image: IMG.talent,
    tags: ["Talent", "Showcase", "Open Stage"],
    eligibility: "Open to all college students.",
    rules: "Max 5 minutes per act. Content must be suitable for a general audience.",
    judging: "Judges (70%) and audience vote (30%).",
    prizes: [{ title: "Best Act", cashPrize: 7000 }],
  },
];

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const ist = (s: string) => new Date(`${s}:00+05:30`).toISOString();

async function ensureOrganizer(org: Org) {
  let user = await prisma.user.findUnique({ where: { email: org.email } });
  if (!user) {
    const password = process.env[org.passwordEnv];
    if (!password || password.length < 8) throw new Error(`Set ${org.passwordEnv} (min 8 chars) to create ${org.email}`);
    await auth.api.signUpEmail({ body: { email: org.email, password, name: org.name } });
    user = await prisma.user.findUniqueOrThrow({ where: { email: org.email } });
    console.log(`   ✓ created account ${org.email}`);
  }
  const profile = {
    college: org.college,
    department: org.department,
    position: org.position,
    website: org.website,
    address: org.address,
    verificationStatus: "APPROVED",
    approvedAt: new Date(),
  };
  await prisma.user.update({
    where: { id: user.id },
    data: {
      role: "ORGANIZER",
      emailVerified: true,
      organizerProfile: { upsert: { create: profile, update: profile } },
    },
  });
  return user.id;
}

async function seedEvents(org: Org, organizerId: string, events: Seed[]) {
  const cats = Object.fromEntries((await prisma.category.findMany()).map((c) => [c.slug, c.id]));
  for (const e of events) {
    const categoryId = cats[e.category];
    if (!categoryId) throw new Error(`Category "${e.category}" missing — run npm run db:seed first`);
    const [minTeam, maxTeam] = e.team ?? [1, 1];
    const isTeam = maxTeam > 1;
    const slug = slugify(e.title);
    // Same shape the admin EventWizard stores in Event.details
    const details = {
      basic: { title: e.title, slug, category: e.category, shortDescription: e.short, description: e.description, tags: e.tags, visibility: "PUBLIC", isFeatured: false },
      schedule: { registrationOpens: new Date().toISOString(), registrationCloses: ist(e.closes), start: ist(e.start), end: ist(e.end), timezone: "Asia/Kolkata" },
      venue: { venueType: "OFFLINE", venueLocation: e.venue, address: org.address, googleMapsLink: org.maps },
      registration: { isTeam, minTeamSize: minTeam, maxTeamSize: maxTeam, maxRegistrations: e.capacity, isWaitingListEnabled: false, requireApproval: false, allowMultiple: false },
      pricing: { isFree: true, fee: 0, couponCodes: [] },
      media: { banner: e.image },
      rules: { eligibility: e.eligibility, instructions: e.rules, judgingCriteria: e.judging ?? "", prizes: e.prizes ?? [], faqs: e.faqs ?? [] },
      contact: { coordinatorName: org.name, coordinatorEmail: org.email, coordinatorPhone: "", website: org.website },
      certificates: { autoGenerate: true },
    };
    const data = {
      title: e.title,
      description: e.description,
      date: new Date(ist(e.start)),
      location: `${e.venue}, Mumbai`,
      capacity: e.capacity,
      status: EventStatus.PUBLISHED,
      eventType: isTeam ? "TEAM" : "INDIVIDUAL",
      teamMinSize: minTeam,
      teamMaxSize: maxTeam,
      details,
      organizerId,
      categoryId,
    };
    await prisma.event.upsert({
      where: { slug },
      update: { ...data, images: { deleteMany: {}, create: { url: e.image, isHero: true } } },
      create: { ...data, slug, images: { create: { url: e.image, isHero: true } } },
    });
    console.log(`   ✓ ${e.title}`);
  }
}

async function main() {
  for (const [org, events] of [[IITB, IITB_EVENTS], [ATHARVA, ATHARVA_EVENTS]] as const) {
    console.log(`\n🏫 ${org.college}`);
    const id = await ensureOrganizer(org);
    await seedEvents(org, id, events);
  }
  console.log("\n✅ Done");
}

main()
  .catch((e) => {
    console.error("❌", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
