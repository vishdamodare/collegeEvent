import type { MetadataRoute } from "next";
import { EventStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { campusFor } from "@/lib/campuses";
import { indexableTopics } from "@/lib/seo-topics";
import { absoluteUrl } from "@/lib/seo";

// Rebuilt at most hourly so new events show up without a redeploy
export const revalidate = 3600;

/**
 * Only URLs that return 200 and are meant to be indexed:
 * public events, curated campus pages that have an organizer, and landing topics with enough events.
 * (Login/organizer/admin pages are noindex and deliberately left out.)
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // A cold/unreachable DB must not fail the build or the route: fall back to static URLs only
  const [events, organizers, topics] = await Promise.all([
    prisma.event.findMany({
      where: { status: { in: [EventStatus.PUBLISHED, EventStatus.COMPLETED] } },
      select: { slug: true, updatedAt: true },
      orderBy: { date: "asc" },
    }),
    prisma.organizerProfile.findMany({ select: { college: true, updatedAt: true } }),
    indexableTopics(),
  ]).catch((err) => {
    console.error("sitemap: DB unavailable, serving static URLs only:", err);
    return [[], [], []] as [{ slug: string; updatedAt: Date }[], { college: string | null; updatedAt: Date }[], Awaited<ReturnType<typeof indexableTopics>>];
  });

  // Same mapping the /colleges pages use (free-typed college names -> curated campus slugs)
  const campuses = new Map<string, Date>();
  for (const o of organizers) {
    const slug = campusFor(o.college)?.slug;
    if (slug && (!campuses.has(slug) || campuses.get(slug)! < o.updatedAt)) campuses.set(slug, o.updatedAt);
  }
  const latestEvent = events.reduce<Date | undefined>((m, e) => (!m || e.updatedAt > m ? e.updatedAt : m), undefined);

  return [
    { url: absoluteUrl("/"), lastModified: latestEvent, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/events"), lastModified: latestEvent, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/colleges"), changeFrequency: "weekly", priority: 0.7 },
    ...topics.map((t) => ({ url: absoluteUrl(`/college-events/${t.slug}`), lastModified: latestEvent, changeFrequency: "daily" as const, priority: 0.8 })),
    ...events.map((e) => ({ url: absoluteUrl(`/events/${e.slug}`), lastModified: e.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...[...campuses].map(([slug, lastModified]) => ({ url: absoluteUrl(`/colleges/${slug}`), lastModified, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
