import type { MetadataRoute } from "next";
import { EventStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { appUrl } from "@/lib/app-url";

// Rebuilt at most hourly so new events show up without a redeploy
export const revalidate = 3600;

// Same slug rule as src/app/colleges/[slug]/page.tsx
const collegeSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, organizers] = await Promise.all([
    prisma.event.findMany({
      where: { status: { in: [EventStatus.PUBLISHED, EventStatus.COMPLETED] } },
      select: { slug: true, updatedAt: true },
    }),
    prisma.organizerProfile.findMany({ select: { college: true, updatedAt: true } }),
  ]);

  const colleges = new Map<string, Date>();
  for (const o of organizers) {
    const slug = o.college && collegeSlug(o.college);
    if (slug && (!colleges.has(slug) || colleges.get(slug)! < o.updatedAt)) colleges.set(slug, o.updatedAt);
  }

  return [
    { url: appUrl, changeFrequency: "daily", priority: 1 },
    { url: `${appUrl}/events`, changeFrequency: "daily", priority: 0.9 },
    { url: `${appUrl}/colleges`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${appUrl}/organizer`, changeFrequency: "monthly", priority: 0.4 },
    ...events.map((e) => ({ url: `${appUrl}/events/${e.slug}`, lastModified: e.updatedAt, priority: 0.8 })),
    ...[...colleges].map(([slug, lastModified]) => ({ url: `${appUrl}/colleges/${slug}`, lastModified, priority: 0.6 })),
  ];
}
