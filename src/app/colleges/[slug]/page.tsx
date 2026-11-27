import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EventTimeline } from "@/components/colleges/EventTimeline";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { MapPin, Globe, Mail, BookOpen, ArrowLeft, ArrowUpRight, BadgeCheck } from "lucide-react";
import Image from "next/image";
import { brandFromAccent, campusBySlug, campusFor, normalizeWebsite } from "@/lib/campuses";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl, breadcrumbLd } from "@/lib/seo";

const Instagram = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Linkedin = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface CollegePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: CollegePageProps): Promise<Metadata> {
  const campus = campusBySlug((await params).slug);
  if (!campus) return { title: "College not found — CollegeEvent", robots: { index: false, follow: true } };
  const title = `${campus.name} Events, Fests & Competitions | CollegeEvent`;
  const description = `Upcoming fests, hackathons and competitions at ${campus.name}, ${campus.area}. See event dates and venues, and register free on CollegeEvent.`;
  const path = `/colleges/${campus.slug}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "website", ...(campus.img ? { images: [{ url: campus.img, alt: campus.name }] } : {}) },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CollegeDetailPage({ params }: CollegePageProps) {
  const { slug } = await params;

  // Fetch organizers and match by slug
  const organizers = await prisma.organizerProfile.findMany({
    include: {
      user: {
        include: {
          events: {
            where: { status: "PUBLISHED" },
            include: { category: true, images: true, registrations: { where: { status: { not: "CANCELLED" } }, select: { id: true } } }
          }
        }
      }
    }
  });

  const campus = campusBySlug(slug);
  if (!campus) notFound();

  // All organizer accounts of this campus; the one with the most events supplies the contact/social details
  const campusOrgs = organizers.filter((org) => campusFor(org.college)?.slug === slug);
  const organizer = [...campusOrgs].sort((x, y) => y.user.events.length - x.user.events.length)[0];
  if (!organizer) notFound();

  const collegeName = campus.name;
  // Skip events held at a different listed campus (e.g. an IIT Bombay fest filed under this organizer)
  const events = campusOrgs
    .flatMap((org) => org.user.events)
    .filter((e) => {
      const heldAt = campusFor(e.location);
      return !heldAt || heldAt.slug === slug;
    });
  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.date) >= now);
  const pastEvents = events.filter(e => new Date(e.date) < now);
  const totalRegistrations = events.reduce((sum, e) => sum + e.registrations.length, 0);

  // Only organizers who actually run events are listed as the team (no demo/placeholder accounts)
  const team = campusOrgs
    .filter((org) => org.user.events.length > 0)
    .map((org) => ({ name: org.user.name, role: org.position, img: org.user.image }));

  // Gallery images from events
  const seen = new Set<string>();
  const gallery = events
    .flatMap((e) => e.images.map((img) => ({ url: img.url, title: e.title, slug: e.slug, category: e.category.name })))
    .filter((g) => g.url && !seen.has(g.url) && seen.add(g.url))
    .slice(0, 7);

  const { state } = campus;

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "CollegeOrUniversity",
      name: campus.name,
      url: absoluteUrl(`/colleges/${campus.slug}`),
      address: { "@type": "PostalAddress", addressLocality: campus.city, addressRegion: campus.state, addressCountry: "IN" },
      ...(campus.img ? { image: absoluteUrl(campus.img) } : {}),
      // Only the events actually listed on this page
      event: upcomingEvents.slice(0, 20).map((e) => ({
        "@type": "Event",
        name: e.title,
        startDate: e.date.toISOString(),
        url: absoluteUrl(`/events/${e.slug}`),
        location: { "@type": "Place", name: e.location, address: { "@type": "PostalAddress", streetAddress: e.location, addressLocality: campus.city, addressRegion: campus.state, addressCountry: "IN" } },
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
      })),
    },
    breadcrumbLd([["Home", "/"], ["Colleges", "/colleges"], [campus.name, `/colleges/${campus.slug}`]]),
  ];

  // Brand: the page wears the college's own colours, in light mode regardless of the site theme
  // Content edited in Admin > College Profile wins over the built-in defaults
  const cms = campusOrgs.find((o) => o.pageTagline || o.pageCredentials || o.pageLogo || o.pageHero || o.pageAccent || o.description || o.website) ?? organizer;
  const custom = brandFromAccent(cms.pageAccent);
  const accent = custom?.accent ?? campus.brand?.accent ?? "#2451FF";
  const deep = custom?.deep ?? campus.brand?.deep ?? "#1D3FCC";
  const light = custom?.light ?? campus.brand?.light ?? "#7C9BFF";
  const credentials: [string, string][] = Array.isArray(cms.pageCredentials)
    ? (cms.pageCredentials as { label: string; detail: string }[]).map((c) => [c.label, c.detail])
    : (campus.brand?.credentials ?? []);
  const logo = cms.pageLogo || campus.logo;
  const heroImg = cms.pageHero || campus.img;
  const site = normalizeWebsite(cms.website) ?? campus.site;
  const tagline = cms.pageTagline || `Fests, hackathons and competitions from ${campus.area}. Find what is on, then register free.`;
  const about = cms.description || `${collegeName} hosts its fests, technical events and competitions on CollegeEvent. Browse the schedule, pick an event and register in a minute.`;
  const upcoming = [...upcomingEvents].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const next = upcoming[0];
  const categoryCount = new Set(events.map((e) => e.category.name)).size;
  const fmt = (d: Date | string, o: Intl.DateTimeFormatOptions) =>
    new Date(d).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", ...o });
  const siteHost = site?.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  const mapQuery = encodeURIComponent(`${campus.name}, ${campus.area}`);

  const nav: [string, string][] = [
    ["About", "#about"],
    ["Events", "#events"],
    ...(gallery.length ? ([["Gallery", "#gallery"]] as [string, string][]) : []),
    ...(team.length ? ([["Team", "#team"]] as [string, string][]) : []),
    ["Contact", "#contact"],
  ];
  const btn = "inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

  return (
    <div
      style={{ "--a": accent, "--d": deep, "--dl": light } as React.CSSProperties}
      className="college-theme min-h-screen bg-[color:var(--c-bg)] text-[color:var(--c-fg)] font-archivo [&_a:focus-visible]:outline-[var(--dt)]"
    >
      <JsonLd data={ld} />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[color:var(--c-line)] bg-[color-mix(in_srgb,var(--c-bg)_92%,transparent)] backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          <a href="#top" className="flex items-center gap-3 min-w-0 flex-1 md:flex-none">
            <span className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-lg bg-white overflow-hidden">
              {logo ? (
                <Image src={logo} alt={`${collegeName} logo`} fill className="object-contain p-0.5" sizes="48px" priority />
              ) : (
                <span className="w-12 h-12 rounded-lg bg-[var(--a)] text-white flex items-center justify-center text-xl font-anton">{campus.short.charAt(0)}</span>
              )}
            </span>
            <span className="min-w-0">
              <span className="block font-anton text-base sm:text-lg leading-tight truncate">{collegeName}</span>
              <span className="block text-xs text-[color:var(--c-faint)]">{campus.area}</span>
            </span>
          </a>
          <nav aria-label="College sections" className="order-3 md:order-none w-full md:w-auto md:ml-auto flex items-center gap-6 overflow-x-auto whitespace-nowrap py-1 text-sm font-medium text-[color:var(--c-muted)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {nav.map(([label, href]) => (
              <a key={href} href={href} className="hover:text-[var(--dt)]">{label}</a>
            ))}
          </nav>
          {upcoming.length > 0 && (
            <a href="#events" className={`${btn} max-md:hidden bg-[var(--d)] text-white hover:brightness-110 py-2`}>
              Register for an event
            </a>
          )}
          <ThemeToggle />
        </div>
      </header>

      <main id="top">
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4">
          <Link href="/colleges" className="group inline-flex items-center gap-2 rounded-full border border-[color:var(--c-line2)] bg-[color:var(--c-soft)] pl-3 pr-4 h-9 text-sm font-semibold text-[color:var(--c-fg)] transition-colors hover:border-[var(--d)] hover:text-[var(--dt)] active:scale-95">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> All colleges
          </Link>
        </div>
        {/* Hero */}
        <section className="relative">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.05fr]">
            <div className="px-4 md:px-8 pt-8 pb-8 lg:py-20 flex flex-col justify-center order-2 lg:order-1">
              {organizer.verificationStatus === "APPROVED" && (
                <p className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--dt)] mb-5">
                  <BadgeCheck className="w-4 h-4" /> Verified campus on CollegeEvent
                </p>
              )}
              <h1 className="font-anton text-[clamp(40px,6vw,84px)] leading-[0.95] tracking-tight">{collegeName}</h1>
              <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-[color:var(--c-muted)]">
                {tagline}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3 [&>a]:w-full sm:[&>a]:w-auto">
                <a href="#events" className={`${btn} bg-[var(--d)] text-white hover:brightness-110`}>See upcoming events</a>
                {site && (
                  <a href={site} target="_blank" rel="noopener noreferrer" className={`${btn} border border-[color:var(--c-line2)] hover:border-[var(--d)] hover:text-[var(--dt)]`}>
                    Visit {siteHost} <ArrowUpRight className="w-4 h-4" />
                  </a>
                )}
              </div>
              <dl className="mt-8 lg:mt-12 grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-x-10 sm:gap-y-4">
                {[
                  { label: "Live events", value: upcoming.length, show: true },
                  { label: "Event categories", value: categoryCount, show: categoryCount > 1 },
                  { label: "Past events", value: pastEvents.length, show: pastEvents.length > 0 },
                  { label: "Registrations", value: totalRegistrations, show: totalRegistrations >= 25 },
                ]
                  .filter((x) => x.show)
                  .map((x) => (
                    <div key={x.label} className="max-sm:rounded-xl max-sm:border max-sm:border-[color:var(--c-line)] max-sm:bg-[color:var(--c-card)] max-sm:px-4 max-sm:py-3">
                      <dt className="text-[13px] sm:text-sm text-[color:var(--c-faint)]">{x.label}</dt>
                      <dd className="font-anton text-3xl sm:text-4xl leading-none mt-1">{x.value}</dd>
                    </div>
                  ))}
              </dl>
            </div>

            <div className="relative order-1 lg:order-2 lg:py-12 lg:pr-8">
              {/* Photo: its own box on mobile, fills the column on desktop */}
              <div className="relative h-[240px] sm:h-[340px] lg:h-full lg:min-h-[560px] lg:rounded-[32px] overflow-hidden bg-[color:var(--c-thumb)]">
                {heroImg ? (
                  <Image src={heroImg} alt={`${collegeName} campus`} fill priority sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-[var(--a)]/15" />
                )}
                {!cms.pageHero && campus.credit && (
                  <a href={campus.credit.url} target="_blank" rel="noopener noreferrer" className="absolute top-3 right-4 text-[10px] text-white/80 hover:text-white [text-shadow:0_1px_2px_rgba(0,0,0,.8)]">
                    {campus.credit.text}
                  </a>
                )}
              </div>
              {next && (
                <Link
                  href={`/events/${next.slug}`}
                  className="relative z-10 -mt-6 mx-4 sm:mx-8 lg:mx-0 lg:mt-0 lg:absolute lg:right-14 lg:bottom-[72px] lg:w-[340px] rounded-xl bg-[color:var(--c-card)] p-2.5 sm:p-4 shadow-[0_18px_50px_-12px_rgba(35,35,43,.45)] border border-[color:var(--c-line)] flex gap-3 sm:gap-4 items-center group"
                >
                  <span className="shrink-0 w-12 sm:w-16 rounded-lg bg-[var(--a)] text-white text-center py-1.5 sm:py-2">
                    <span className="block text-xs font-medium">{fmt(next.date, { month: "short" })}</span>
                    <span className="block font-anton text-2xl sm:text-3xl leading-none">{fmt(next.date, { day: "numeric" })}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] sm:text-xs text-[color:var(--c-faint)]">Next at {campus.short}</span>
                    <span className="block text-sm sm:text-base font-bold leading-snug line-clamp-2 group-hover:text-[var(--dt)]">{next.title}</span>
                    <span className="hidden sm:block text-xs text-[var(--dt)] font-semibold mt-1">Register free</span>
                  </span>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Credentials */}
        {credentials.length > 0 && (
          <section aria-label="Accreditation" className="bg-[color:var(--c-tint)] border-y border-[color:var(--c-tintline)]">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 sm:py-6 flex gap-3 overflow-x-auto snap-x scroll-px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible">
              {credentials.map(([a, b]) => (
                <div key={a} className="flex items-center gap-2.5 sm:gap-3 shrink-0 snap-start max-sm:rounded-xl max-sm:border max-sm:border-[color:var(--c-tintline)] max-sm:bg-[color:var(--c-card)] max-sm:px-3.5 max-sm:py-2.5">
                  <BadgeCheck className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--a)] shrink-0" aria-hidden="true" />
                  <p><span className="block font-anton text-[15px] sm:text-lg leading-tight whitespace-nowrap">{a}</span><span className="block text-xs sm:text-sm text-[color:var(--c-faint)] whitespace-nowrap">{b}</span></p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* About */}
        <section id="about" className="scroll-mt-20 max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 grid md:grid-cols-[1fr_1.2fr] gap-8 md:gap-16">
          <h2 className="font-anton text-[clamp(28px,3.4vw,44px)] leading-tight">What is happening at {campus.short}</h2>
          <p className="text-lg leading-relaxed text-[color:var(--c-muted)] max-w-[62ch]">
            {about}
          </p>
        </section>

        {/* Events */}
        <section id="events" className="scroll-mt-20 bg-[color:var(--c-soft)] border-y border-[color:var(--c-line)]">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
              <h2 className="font-anton text-[clamp(28px,3.4vw,44px)] leading-tight">Upcoming events</h2>
              <p className="text-[color:var(--c-faint)]">{upcoming.length} open for registration</p>
            </div>
            {upcoming.length === 0 ? (
              <p className="rounded-lg border border-dashed border-[color:var(--c-line2)] bg-[color:var(--c-card)] p-10 text-center text-[color:var(--c-faint)]">No events are scheduled right now. Check back soon.</p>
            ) : (
              <EventTimeline
                events={upcoming.map((e) => ({
                  id: e.id,
                  slug: e.slug,
                  title: e.title,
                  dateISO: new Date(e.date).toISOString(),
                  category: e.category.name,
                  location: e.location,
                  imageUrl: e.images[0]?.url,
                }))}
              />
            )}

            {pastEvents.length > 0 && (
              <div className="mt-12">
                <h3 className="font-anton text-2xl mb-4">Past events</h3>
                <ul className="grid sm:grid-cols-2 gap-x-8">
                  {pastEvents.map((evt) => (
                    <li key={evt.id} className="py-2.5 border-b border-[color:var(--c-line)] flex justify-between gap-4 text-sm">
                      <span className="font-medium">{evt.title}</span>
                      <span className="text-[color:var(--c-faint)] shrink-0">{fmt(evt.date, { month: "short", year: "numeric" })}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Gallery */}
        {gallery.length > 0 && (
          <section id="gallery" className="scroll-mt-20 max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
              <h2 className="font-anton text-[clamp(28px,3.4vw,44px)] leading-tight">From the events</h2>
              <a href="#events" className="text-sm font-semibold text-[var(--dt)] hover:underline underline-offset-2">See the schedule</a>
            </div>
            <ul className="grid grid-cols-2 md:grid-cols-4 auto-rows-[150px] md:auto-rows-[200px] gap-3">
              {gallery.map((g, i) => (
                <li key={g.url} className={i === 0 ? "col-span-2 row-span-2" : i === 3 || (i === 6 && gallery.length === 7) ? "md:col-span-2" : ""}>
                  <Link href={`/events/${g.slug}`} className="group relative block h-full overflow-hidden rounded-xl bg-[color:var(--c-thumb)] focus-visible:outline-2 focus-visible:outline-offset-2">
                    <Image
                      src={g.url}
                      alt={`${g.title} at ${collegeName}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes={i === 0 ? "(min-width:768px) 50vw, 100vw" : "(min-width:768px) 25vw, 50vw"}
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 md:p-4 pt-14 text-white">
                      <span className="block text-xs text-white/80">{g.category}</span>
                      <span className={`block font-bold leading-snug line-clamp-2 ${i === 0 ? "text-base md:text-xl" : "text-[13px] md:text-sm"}`}>{g.title}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Team */}
        {team.length > 0 && (
          <section id="team" className="scroll-mt-20 max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 border-t border-[color:var(--c-line)]">
            <h2 className="font-anton text-[clamp(28px,3.4vw,44px)] leading-tight mb-8">Who runs the events</h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.map((t, i) => (
                <li key={i} className="flex items-center gap-4 rounded-xl border border-[color:var(--c-line)] p-4">
                  <span className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-[color:var(--c-tint)] text-[var(--dt)] flex items-center justify-center font-anton text-xl">
                    {t.img ? <Image src={t.img} alt="" fill className="object-cover" sizes="48px" /> : t.name.charAt(0)}
                  </span>
                  <span><span className="block font-bold">{t.name}</span><span className="text-sm text-[color:var(--c-faint)]">{t.role}</span></span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Contact */}
        <section id="contact" className="scroll-mt-20 bg-[color:var(--c-soft)] border-t border-[color:var(--c-line)]">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 grid lg:grid-cols-[1fr_1.3fr] gap-10">
            <div>
              <h2 className="font-anton text-[clamp(28px,3.4vw,44px)] leading-tight mb-8">Find us</h2>
              <ul className="space-y-5">
                <li className="flex gap-3"><MapPin className="w-5 h-5 text-[var(--dt)] mt-0.5 shrink-0" /><span>{collegeName}<br /><span className="text-[color:var(--c-faint)]">{campus.area}, {state}</span></span></li>
                <li className="flex gap-3"><Mail className="w-5 h-5 text-[var(--dt)] mt-0.5 shrink-0" /><a href={`mailto:${organizer.user.email}`} className="hover:text-[var(--dt)] break-all">{organizer.user.email}</a></li>
                <li className="flex gap-3"><BookOpen className="w-5 h-5 text-[var(--dt)] mt-0.5 shrink-0" /><span>{organizer.department}</span></li>
                {site && (
                  <li className="flex gap-3"><Globe className="w-5 h-5 text-[var(--dt)] mt-0.5 shrink-0" /><a href={site} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--dt)]">{siteHost}</a></li>
                )}
                <li className="flex gap-4 pt-1">
                  {organizer.instagram && <a href={`https://instagram.com/${organizer.instagram}`} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-[color:var(--c-muted)] hover:text-[var(--dt)]"><Instagram className="w-5 h-5" /></a>}
                  {organizer.linkedin && <a href={organizer.linkedin.startsWith("http") ? organizer.linkedin : `https://linkedin.com/in/${organizer.linkedin}`} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-[color:var(--c-muted)] hover:text-[var(--dt)]"><Linkedin className="w-5 h-5" /></a>}
                </li>
              </ul>
            </div>
            <iframe
              title={`Map of ${collegeName}`}
              src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-72 lg:h-full min-h-72 rounded-xl border border-[color:var(--c-line)]"
            />
          </div>
        </section>
      </main>

      {/* Footer: small co-brand strip */}
      <footer className="bg-[color:var(--c-footer)] text-white/80 border-t-2 border-[var(--a)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
          <div className="flex items-center gap-3">
            <span className="relative w-11 h-11 rounded-lg bg-white shrink-0 flex items-center justify-center text-black font-anton text-lg">
              {logo ? <Image src={logo} alt={`${collegeName} logo`} fill className="object-contain p-1" sizes="44px" /> : campus.short.charAt(0)}
            </span>
            <span className="font-anton text-xl text-white/40 leading-none" aria-hidden="true">×</span>
            <Link href="/" aria-label="CollegeEvent home" className="flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              <Image src="/logo-mark.png" alt="" width={36} height={36} className="w-9 h-9" />
              <span className="font-anton text-lg text-white tracking-tight">CollegeEvent</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
