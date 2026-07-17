import { AdminEvent } from "@/types/admin";

export const MOCK_EVENTS: AdminEvent[] = [
  {
    id: "evt-hackathon-2026",
    status: "REGISTRATION_OPEN",
    basic: {
      title: "National Coding Hackathon 2026",
      slug: "national-coding-hackathon-2026",
      category: "TECHNICAL",
      subcategory: "Hackathons",
      shortDescription: "A 36-hour team event for building innovative solutions in Web3, AI, and healthcare.",
      description: "Get ready for the biggest code sprint of the year! Bring your tech stack, find a team, and deploy a working MVP under 36 hours. Mentors from top tech industries will guide you.",
      tags: ["Hackathon", "Coding", "AI", "Prizes"],
      isFeatured: true,
      visibility: "PUBLIC",
    },
    schedule: {
      registrationOpens: "2026-07-01T10:00:00Z",
      registrationCloses: "2026-07-25T18:00:00Z",
      start: "2026-08-01T09:00:00Z",
      end: "2026-08-02T21:00:00Z",
      timezone: "Asia/Kolkata",
    },
    venue: {
      venueType: "OFFLINE",
      venueLocation: "Vidyalankar Institute of Technology, M-Block, A-201 & A-202 Labs",
      address: "Wadala East, Mumbai, Maharashtra 400037",
      googleMapsLink: "https://maps.google.com",
    },
    registration: {
      isTeam: true,
      minTeamSize: 2,
      maxTeamSize: 4,
      maxRegistrations: 200,
      isWaitingListEnabled: true,
      requireApproval: true,
      allowMultiple: false,
    },
    pricing: {
      isFree: false,
      fee: 299,
      couponCodes: ["EARLYBIRD50", "HACKFREE"],
      discounts: "10% off for teams of 4",
      refundPolicy: "No refunds after registration closes",
      gstIncluded: true,
      platformFee: 15,
    },
    media: {
      banner: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop",
      poster: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=200&auto=format&fit=crop",
      gallery: [],
      sponsorLogos: [],
      videos: [],
      attachments: [],
    },
    rules: {
      eligibility: "Students from any accredited university in India.",
      requirements: "Bring own laptops, chargers, and pre-installed IDEs.",
      instructions: "Check-in desk opens at 8:00 AM on August 1st.",
    },
    contact: {
      coordinatorName: "Aditya Verma",
      coordinatorEmail: "aditya.v@student.vit.edu",
      coordinatorPhone: "+91 87654 32109",
    },
    certificates: {},
    createdAt: "2026-06-01T10:00:00Z",
    updatedAt: "2026-07-12T14:30:00Z",
  },
  {
    id: "evt-robotics-2026",
    status: "EVENT_LIVE",
    basic: {
      title: "Robotics Arena & RC Challenge",
      slug: "robotics-arena-rc-challenge",
      category: "TECHNICAL",
      subcategory: "Robotics",
      shortDescription: "Build, program, and race your bots in a speed and battle arena.",
      description: "Two main categories: Robowar (heavyweight combat bots) and RC Obstacle Race. Show off your micro-controller programming and mechanics designs.",
      tags: ["Robotics", "Arduino", "Engineering", "Prizes"],
      isFeatured: false,
      visibility: "PUBLIC",
    },
    schedule: {
      registrationOpens: "2026-06-15T09:00:00Z",
      registrationCloses: "2026-07-10T18:00:00Z",
      start: "2026-07-14T09:00:00Z",
      end: "2026-07-15T17:00:00Z",
      timezone: "Asia/Kolkata",
    },
    venue: {
      venueType: "OFFLINE",
      venueLocation: "Vidyalankar Institute of Technology, S-Block Arena, Turf",
      address: "Wadala East, Mumbai, Maharashtra 400037",
      googleMapsLink: "https://maps.google.com",
    },
    registration: {
      isTeam: true,
      minTeamSize: 2,
      maxTeamSize: 5,
      maxRegistrations: 50,
      isWaitingListEnabled: false,
      requireApproval: false,
      allowMultiple: false,
    },
    pricing: {
      isFree: false,
      fee: 499,
      couponCodes: ["BOTRACE", "EARLYBIRD"],
      refundPolicy: "Non-refundable",
      gstIncluded: true,
      platformFee: 15,
    },
    media: {
      banner: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200&auto=format&fit=crop",
      poster: "",
      thumbnail: "",
      gallery: [],
      sponsorLogos: [],
      videos: [],
      attachments: [],
    },
    rules: {
      eligibility: "Open to engineering and diploma students.",
      requirements: "Bots must fit within dimension regulations (30x30x30 cm max). Batteries must be sealed safely.",
      instructions: "Weigh-in begins at 8:30 AM on Day 1. Power connections will be provided at workspaces.",
    },
    contact: {
      coordinatorName: "Raj Patel",
      coordinatorEmail: "raj.p@student.vit.edu",
      coordinatorPhone: "+91 88888 77777",
    },
    certificates: {},
    createdAt: "2026-06-10T11:00:00Z",
    updatedAt: "2026-07-12T09:00:00Z",
  },
  {
    id: "evt-ai-symposium",
    status: "REGISTRATION_CLOSED",
    basic: {
      title: "Generative AI & LLM Conference",
      slug: "generative-ai-llm-conference",
      category: "TECHNICAL",
      subcategory: "AI & ML",
      shortDescription: "A series of lectures and research paper presentations on GenAI models.",
      description: "Join research scholars and AI leads from tech giants for keynotes on fine-tuning LLMs, retrieval-augmented generation (RAG), and agentic systems.",
      tags: ["AI", "LLMs", "Research", "Tech Talks"],
      isFeatured: false,
      visibility: "PUBLIC",
    },
    schedule: {
      registrationOpens: "2026-06-20T10:00:00Z",
      registrationCloses: "2026-07-12T23:59:59Z",
      start: "2026-07-20T10:00:00Z",
      end: "2026-07-20T18:00:00Z",
      timezone: "Asia/Kolkata",
    },
    venue: {
      venueType: "OFFLINE",
      venueLocation: "Vidyalankar Institute of Technology, Y-Block Seminar Hall, Auditorium 2",
      address: "Wadala East, Mumbai, Maharashtra 400037",
      googleMapsLink: "https://maps.google.com",
    },
    registration: {
      isTeam: false,
      minTeamSize: 1,
      maxTeamSize: 1,
      maxRegistrations: 150,
      isWaitingListEnabled: true,
      requireApproval: false,
      allowMultiple: false,
    },
    pricing: {
      isFree: true,
      fee: 0,
      couponCodes: [],
      gstIncluded: false,
      platformFee: 0,
    },
    media: {
      banner: "https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=1200&auto=format&fit=crop",
    },
    rules: {
      eligibility: "Open to students, faculty, and industry professionals.",
      requirements: "No hardware required. Bring notepad or laptop for notes.",
    },
    contact: {
      coordinatorName: "Esha Rao",
      coordinatorEmail: "esha.r@student.vit.edu",
      coordinatorPhone: "+91 86666 55555",
    },
    certificates: {
      participationTemplate: "ai-symp-cert.pdf",
    },
    createdAt: "2026-06-18T10:00:00Z",
    updatedAt: "2026-07-13T10:00:00Z",
  },
  {
    id: "evt-cultural-tarang",
    status: "DRAFT",
    basic: {
      title: "Tarang Cultural Fest 2026",
      slug: "tarang-cultural-fest-2026",
      category: "CULTURAL",
      subcategory: "General Fest",
      shortDescription: "The annual intra-college cultural showcase of talent and arts.",
      description: "Events include Street Play (Nukkad Natak), Solo/Duet Singing, Battle of Bands, and Fashion Show. Experience a vibrant celebration of dance, music, and dramatic arts.",
      tags: ["Music", "Dance", "Drama", "Fashion", "Festival"],
      isFeatured: false,
      visibility: "PUBLIC",
    },
    schedule: {
      registrationOpens: "2026-08-01T10:00:00Z",
      registrationCloses: "2026-08-20T18:00:00Z",
      start: "2026-09-10T09:00:00Z",
      end: "2026-09-12T22:00:00Z",
      timezone: "Asia/Kolkata",
    },
    venue: {
      venueType: "OFFLINE",
      venueLocation: "Vidyalankar Institute of Technology, Main Campus Grounds, Open Air Theatre",
      address: "Wadala East, Mumbai, Maharashtra 400037",
      googleMapsLink: "https://maps.google.com",
    },
    registration: {
      isTeam: true,
      minTeamSize: 1,
      maxTeamSize: 15,
      maxRegistrations: 500,
      isWaitingListEnabled: false,
      requireApproval: true,
      allowMultiple: true,
    },
    pricing: {
      isFree: true,
      fee: 0,
      couponCodes: [],
      gstIncluded: false,
      platformFee: 0,
    },
    media: {
      banner: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
    },
    rules: {
      eligibility: "Only registered college student teams are eligible.",
    },
    contact: {
      coordinatorName: "Karan Johar",
      coordinatorEmail: "karan.j@student.vit.edu",
      coordinatorPhone: "+91 84444 33333",
    },
    certificates: {},
    createdAt: "2026-07-10T16:00:00Z",
    updatedAt: "2026-07-14T11:00:00Z",
  },
  {
    id: "evt-cricket-championship",
    status: "COMPLETED",
    basic: {
      title: "Inter-College T-20 Cricket Trophy",
      slug: "inter-college-t20-cricket-trophy",
      category: "SPORTS",
      subcategory: "Cricket",
      shortDescription: "Compete for the ultimate bragging rights in the T20 tournament.",
      description: "16 college cricket teams battle it out in a knockout tournament over 4 days. Matches are played under floodlights.",
      tags: ["Cricket", "T20", "Sports", "Tournament"],
      isFeatured: false,
      visibility: "PUBLIC",
    },
    schedule: {
      registrationOpens: "2026-05-01T09:00:00Z",
      registrationCloses: "2026-05-15T18:00:00Z",
      start: "2026-05-25T08:00:00Z",
      end: "2026-05-28T22:00:00Z",
      timezone: "Asia/Kolkata",
    },
    venue: {
      venueType: "OFFLINE",
      venueLocation: "Vidyalankar Institute of Technology, College Ground, Turf Ground A",
      address: "Wadala East, Mumbai, Maharashtra 400037",
      googleMapsLink: "https://maps.google.com",
    },
    registration: {
      isTeam: true,
      minTeamSize: 11,
      maxTeamSize: 16,
      maxRegistrations: 16,
      isWaitingListEnabled: false,
      requireApproval: true,
      allowMultiple: false,
    },
    pricing: {
      isFree: false,
      fee: 2500,
      couponCodes: [],
      gstIncluded: true,
      platformFee: 50,
    },
    media: {
      banner: "https://images.unsplash.com/photo-1531415080290-b9b6a2d9f41a?q=80&w=1200&auto=format&fit=crop",
    },
    rules: {
      eligibility: "Official university-approved college cricket team rosters.",
      requirements: "Bring own kits and standard leather balls. Match balls will be provided by host.",
    },
    contact: {
      coordinatorName: "Kabir Singh",
      coordinatorEmail: "kabir.s@student.vit.edu",
      coordinatorPhone: "+91 82222 11111",
    },
    certificates: {},
    createdAt: "2026-04-20T09:00:00Z",
    updatedAt: "2026-05-29T10:00:00Z",
  },
  {
    id: "evt-webdev-bootcamp",
    status: "ARCHIVED",
    basic: {
      title: "Web Dev Bootcamp 2025",
      slug: "web-dev-bootcamp-2025",
      category: "TECHNICAL",
      subcategory: "Web Development",
      shortDescription: "Master HTML, CSS, React, and Tailwind in 5 days.",
      description: "A comprehensive hands-on series for beginners looking to build websites from scratch using modern design technologies.",
      tags: ["Web Dev", "HTML", "CSS", "React"],
      isFeatured: false,
      visibility: "PUBLIC",
    },
    schedule: {
      registrationOpens: "2025-10-01T09:00:00Z",
      registrationCloses: "2025-10-10T18:00:00Z",
      start: "2025-10-15T09:00:00Z",
      end: "2025-10-19T17:00:00Z",
      timezone: "Asia/Kolkata",
    },
    venue: {
      venueType: "OFFLINE",
      venueLocation: "Vidyalankar Institute of Technology, M-Block Labs, IT Lab M-302",
      address: "Wadala East, Mumbai, Maharashtra 400037",
    },
    registration: {
      isTeam: false,
      minTeamSize: 1,
      maxTeamSize: 1,
      maxRegistrations: 60,
      isWaitingListEnabled: false,
      requireApproval: false,
      allowMultiple: false,
    },
    pricing: {
      isFree: true,
      fee: 0,
      couponCodes: [],
      gstIncluded: false,
      platformFee: 0,
    },
    media: {
      banner: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1200&auto=format&fit=crop",
    },
    rules: {},
    contact: {
      coordinatorName: "Aditya Verma",
      coordinatorEmail: "aditya.v@student.vit.edu",
      coordinatorPhone: "+91 87654 32109",
    },
    certificates: {
      participationTemplate: "web-dev-cert.pdf",
    },
    createdAt: "2025-09-20T09:00:00Z",
    updatedAt: "2025-10-20T10:00:00Z",
  },
];

// Helper functions for event lifecycle operations
export function getEventsByStatus(status: string) {
  return MOCK_EVENTS.filter(e => e.status === status);
}

export function createEvent(event: Omit<AdminEvent, "id" | "createdAt" | "updatedAt">): AdminEvent {
  const newEvent: AdminEvent = {
    ...event,
    id: `evt-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  MOCK_EVENTS.push(newEvent);
  return newEvent;
}

export function updateEvent(id: string, updatedEvent: Partial<AdminEvent>): boolean {
  const index = MOCK_EVENTS.findIndex(e => e.id === id);
  if (index !== -1) {
    MOCK_EVENTS[index] = {
      ...MOCK_EVENTS[index],
      ...updatedEvent,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }
  return false;
}

export function deleteEvent(id: string): boolean {
  const index = MOCK_EVENTS.findIndex(e => e.id === id);
  if (index !== -1) {
    MOCK_EVENTS.splice(index, 1);
    return true;
  }
  return false;
}
