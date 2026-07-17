import { EventTemplate } from "@/types/admin/template";

export const QUICK_TEMPLATES: EventTemplate[] = [
  {
    id: "temp-hackathon",
    name: "Hackathon Blueprint",
    description: "Preset configuration for coding hackathons, including team config, code rules, and GitHub forms.",
    category: "TECHNICAL",
    prefilledData: {
      basic: {
        title: "New Hackathon 2026",
        slug: "new-hackathon-2026",
        category: "TECHNICAL",
        subcategory: "Hackathons",
        eventType: "HACKATHON",
        shortDescription: "A 36-hour sprint to build, compile, and present technical hacks.",
        description: "Standard hackathon description. Add project details, tracks, API sponsors, and presentation rules.",
        tags: ["Hackathon", "Coding", "AI"],
        visibility: "PUBLIC",
        isFeatured: false,
        language: "English"
      },
      registration: {
        isTeam: true,
        minTeamSize: 2,
        maxTeamSize: 4,
        maxRegistrations: 100,
        isWaitingListEnabled: true,
        requireApproval: true,
        allowMultiple: false,
        allowCollegeVerification: true,
        collectAdditionalInfo: true
      },
      pricing: {
        isFree: true,
        fee: 0,
        couponCodes: [],
        gstIncluded: false,
        platformFee: 0,
        ticketingEnabled: false
      },
      certificates: {
        autoGenerate: true,
        emailAfterEvent: true
      }
    }
  },
  {
    id: "temp-workshop",
    name: "Hands-on Workshop",
    description: "General setup for tech/academic labs and workshops with limited individual seat booking.",
    category: "TECHNICAL",
    prefilledData: {
      basic: {
        title: "Hands-on Tech Workshop",
        slug: "hands-on-tech-workshop",
        category: "TECHNICAL",
        subcategory: "Workshops",
        eventType: "WORKSHOP",
        shortDescription: "Interactive laboratory learning experience guided by industrial consultants.",
        description: "Configure lab guides, software requirements, prerequisite installations, and certificates.",
        tags: ["Workshop", "Education", "Learning"],
        visibility: "PUBLIC",
        isFeatured: false,
        language: "English"
      },
      registration: {
        isTeam: false,
        minTeamSize: 1,
        maxTeamSize: 1,
        maxRegistrations: 60,
        isWaitingListEnabled: false,
        requireApproval: false,
        allowMultiple: false,
        allowCollegeVerification: false,
        collectAdditionalInfo: false
      },
      pricing: {
        isFree: true,
        fee: 0,
        couponCodes: [],
        ticketingEnabled: false
      }
    }
  },
  {
    id: "temp-sports",
    name: "Sports Tournament",
    description: "For indoor/outdoor matches, team registrations, and rulebook coordination.",
    category: "SPORTS",
    prefilledData: {
      basic: {
        title: "Inter-College Sports League",
        slug: "inter-college-sports-league",
        category: "SPORTS",
        subcategory: "Cricket",
        eventType: "SPORTS",
        shortDescription: "Chronological tournament matches showcasing team athletic skills.",
        description: "Specify tournament fixtures, equipment provisions, rules of conduct, and medical contacts.",
        tags: ["Sports", "Tournament", "Cricket"],
        visibility: "PUBLIC",
        isFeatured: false,
        language: "English"
      },
      registration: {
        isTeam: true,
        minTeamSize: 11,
        maxTeamSize: 15,
        maxRegistrations: 32,
        isWaitingListEnabled: false,
        requireApproval: true,
        allowMultiple: false,
        allowCollegeVerification: true,
        collectAdditionalInfo: true
      },
      pricing: {
        isFree: false,
        fee: 1000,
        couponCodes: [],
        ticketingEnabled: true
      }
    }
  }
];

export function getTemplates() {
  return QUICK_TEMPLATES;
}
