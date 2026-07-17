import { SponsorType } from "@/types/admin/sponsor";

export const MOCK_SPONSORS: SponsorType[] = [
  {
    id: "sp-google",
    name: "Google Cloud",
    category: "TITLE",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_Logo.svg",
    websiteUrl: "https://cloud.google.com",
    description: "Title sponsor providing workspace and credits",
    priority: 1,
    visibility: true
  },
  {
    id: "sp-github",
    name: "GitHub",
    category: "GOLD",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg",
    websiteUrl: "https://github.com",
    description: "Gold sponsor providing premium coupons",
    priority: 2,
    visibility: true
  }
];

export function getSponsors() {
  return MOCK_SPONSORS;
}
