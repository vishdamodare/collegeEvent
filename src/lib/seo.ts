import { appUrl } from "@/lib/app-url";

export const SITE_NAME = "CollegeEvents";
// The brand's real public profiles (same links as the footer)
export const SAME_AS = ["https://www.instagram.com/College.events.in", "https://www.linkedin.com/in/collage-events-67b194452"];

const origin = appUrl.replace(/\/$/, "");
/** Absolute URL on the canonical domain; "/" maps to the bare origin, matching the sitemap. */
export const absoluteUrl = (path = "/") => (path === "/" ? origin : `${origin}${path}`);

/** Collapse whitespace and cut at a word boundary, for meta descriptions (~155 chars is what results show). */
export function clip(text: string, max = 155) {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20)).replace(/[\s,;:.–-]+$/, "")}…`;
}

/** schema.org BreadcrumbList from [name, path] pairs, home first. */
export function breadcrumbLd(items: [name: string, path: string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: absoluteUrl(path) })),
  };
}

/** IST date like "Tue, 15 Dec 2026" for titles/descriptions (servers run in UTC). */
export const istDate = (d: Date) =>
  d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).replace(/, (\d{4})$/, " $1");
