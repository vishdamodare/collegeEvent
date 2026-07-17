export interface SponsorType {
  id: string;
  name: string;
  category: "TITLE" | "GOLD" | "SILVER" | "BRONZE" | "PARTNER" | "MEDIA";
  logoUrl?: string;
  websiteUrl?: string;
  description?: string;
  priority: number;
  visibility: boolean;
}
