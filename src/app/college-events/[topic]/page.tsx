import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EventGridCard } from "@/components/events/EventGridCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { campusFor, type Campus } from "@/lib/campuses";
import { MIN_EVENTS, TOPICS, getTopicEvents, topicBySlug } from "@/lib/seo-topics";
import { absoluteUrl, breadcrumbLd } from "@/lib/seo";

// Only the topics in TOPICS exist; anything else is a real 404 (no soft-404 pages)
export const dynamicParams = false;
export const generateStaticParams = () => TOPICS.map((t) => ({ topic: t.slug }));
// Event lists change when organizers publish; refresh at most every 10 minutes
export const revalidate = 600;

interface Props {
  params: Promise<{ topic: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const topic = topicBySlug((await params).topic);
  if (!topic) return {};
  const { total } = await getTopicEvents(topic);
  const path = `/college-events/${topic.slug}`;
  return {
    title: topic.title,
    description: topic.description,
    alternates: { canonical: path },
    // Too few events = thin page: keep it out of the index until real events exist
    robots: total >= MIN_EVENTS ? undefined : { index: false, follow: true },
    openGraph: { title: topic.title, description: topic.description, url: path, type: "website", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: topic.h1 }] },
    twitter: { card: "summary_large_image", title: topic.title, description: topic.description, images: ["/opengraph-image"] },
  };
}

type Ev = Awaited<ReturnType<typeof getTopicEvents>>["upcoming"][number];
const Card = ({ e, i }: { e: Ev; i: number }) => (
  <EventGridCard
    id={e.id}
    slug={e.slug}
    title={e.title}
    description={e.description}
    date={e.date}
    location={e.location}
    capacity={e.capacity}
    status={e.status}
    categoryName={e.category.name}
    categoryColor={e.category.color}
    imageUrl={e.images[0]?.url}
    organizerName={e.organizer.name}
    registrationCount={e._count.registrations}
    savedCount={0}
    index={i}
  />
);

const pill = "inline-block px-3.5 py-2 rounded-full border border-border text-[14px] text-text-muted hover:text-text-main";

export default async function TopicPage({ params }: Props) {
  const topic = topicBySlug((await params).topic);
  if (!topic) notFound();
  const { upcoming, past, colleges } = await getTopicEvents(topic);
  const path = `/college-events/${topic.slug}`;
  // Only link colleges that actually host events here (their campus pages exist)
  const campuses = [...new Map([...upcoming, ...past].map((e) => campusFor(e.organizer.organizerProfile?.college)).filter((c): c is Campus => !!c).map((c) => [c.slug, c])).values()];

  const ld = [
    breadcrumbLd([["Home", "/"], ["Events", "/events"], [topic.h1, path]]),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: topic.h1,
      itemListElement: upcoming.map((e, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(`/events/${e.slug}`), name: e.title })),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-main">
      <JsonLd data={ld} />
      <Navbar />
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-5 sm:px-10 pt-[110px] sm:pt-32 pb-16 space-y-12">
        <nav aria-label="Breadcrumb" className="text-[13px] text-text-faint">
          <Link href="/" className="hover:text-text-main">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/events" className="hover:text-text-main">Events</Link>
          <span aria-hidden> / </span>
          <span className="text-text-muted">{topic.label}</span>
        </nav>

        <header className="max-w-3xl space-y-3">
          <h1 className="font-anton text-[34px] sm:text-[48px] font-bold tracking-tight leading-[1.05]">{topic.h1}</h1>
          <p className="text-[16px] sm:text-[17px] text-text-muted leading-relaxed">{topic.intro}</p>
          <p className="text-[14px] text-text-faint">
            {upcoming.length > 0
              ? `${upcoming.length} upcoming ${upcoming.length === 1 ? "event" : "events"}${colleges.length ? ` from ${colleges.slice(0, 3).join(", ")}${colleges.length > 3 ? ` and ${colleges.length - 3} more` : ""}` : ""}. Registration is free.`
              : "No upcoming events right now."}
          </p>
        </header>

        <section aria-labelledby="upcoming-heading" className="space-y-5">
          <h2 id="upcoming-heading" className="font-anton text-[24px] font-bold tracking-tight">Upcoming events</h2>
          {upcoming.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map((e, i) => <Card key={e.id} e={e} i={i} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-border p-8 text-center text-text-muted">
              <p>Nothing scheduled here yet. New events appear as soon as colleges publish them.</p>
              <Link href="/events" className="inline-block mt-4 font-semibold text-lime hover:underline">Browse all upcoming college events</Link>
            </div>
          )}
        </section>

        {past.length > 0 && (
          <section aria-labelledby="past-heading" className="space-y-5">
            <h2 id="past-heading" className="font-anton text-[24px] font-bold tracking-tight">Recently held</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {past.map((e, i) => <Card key={e.id} e={e} i={i} />)}
            </div>
          </section>
        )}

        {/* Internal links: other topics and the colleges that host these events */}
        <section aria-labelledby="explore-heading" className="grid gap-8 sm:grid-cols-2 border-t border-border pt-10">
          <div>
            <h2 id="explore-heading" className="text-[16px] font-semibold mb-3">Explore more college events</h2>
            <ul className="flex flex-wrap gap-2">
              {TOPICS.filter((t) => t.slug !== topic.slug).map((t) => (
                <li key={t.slug}>
                  <Link href={`/college-events/${t.slug}`} className={pill}>{t.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-[16px] font-semibold mb-3">Colleges hosting these events</h2>
            <ul className="flex flex-wrap gap-2">
              {campuses.map((c) => (
                <li key={c.slug}>
                  <Link href={`/colleges/${c.slug}`} className={pill}>{c.name}</Link>
                </li>
              ))}
              <li>
                <Link href="/colleges" className={pill}>All colleges</Link>
              </li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
