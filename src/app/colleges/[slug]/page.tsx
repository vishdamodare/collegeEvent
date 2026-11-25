import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { 
  MapPin, Globe, Calendar, Users, Award, 
  CheckCircle2, Mail, BookOpen, Star, ArrowLeft, Image as ImageIcon 
} from "lucide-react";
import Image from "next/image";
import { campusBySlug, campusFor } from "@/lib/campuses";

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
  const events = campusOrgs.flatMap((org) => org.user.events);
  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.date) >= now);
  const pastEvents = events.filter(e => new Date(e.date) < now);
  const totalRegistrations = events.reduce((sum, e) => sum + e.registrations.length, 0);

  // Only organizers who actually run events are listed as the team (no demo/placeholder accounts)
  const team = campusOrgs
    .filter((org) => org.user.events.length > 0)
    .map((org) => ({ name: org.user.name, role: org.position, img: org.user.image }));

  // Gallery images from events
  const gallery = events
    .flatMap(e => e.images.map(img => img.url))
    .filter(Boolean)
    .slice(0, 6);

  const { city, state } = campus;

  return (
    <div className="min-h-screen bg-background text-text-main font-archivo pb-16">
      
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-[var(--color-lime)] transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Discover
        </Link>
      </div>

      {/* College Hero Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        <div className="rounded-3xl border border-border bg-card relative overflow-hidden h-[300px] md:h-[400px]">
          {campus.img ? (
            <Image
              src={campus.img}
              alt={collegeName}
              fill
              className="object-cover opacity-60"
              priority
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cobalt)]/40 via-card-hover to-card" />
          )}
          {campus.credit && (
            <a
              href={campus.credit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-3 right-4 z-10 text-[10px] text-white/70 hover:text-white [text-shadow:0_1px_2px_rgba(0,0,0,.8)] underline-offset-2 hover:underline"
            >
              {campus.credit.text}
            </a>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
          
          {/* Hero details float */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold text-white bg-[var(--color-lime)] border border-[var(--color-lime)] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Campus Organizer
                </span>
                {organizer.verificationStatus === "APPROVED" && (
                  <span className="text-emerald-300 flex items-center gap-1 text-[12px] font-medium bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-400 text-black" /> Verified Campus
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-anton text-white tracking-wide uppercase leading-none max-w-3xl">
                {collegeName}
              </h1>
              <p className="flex items-center gap-1.5 text-xs md:text-sm text-white/80">
                <MapPin className="w-4 h-4 text-[#7FA3FF] shrink-0" />
                {campus.area}, {state}
              </p>
            </div>

            {/* Social Header buttons */}
            <div className="flex items-center gap-2">
              {organizer.website && (
                <a 
                  href={organizer.website.startsWith("http") ? organizer.website : `https://${organizer.website}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-xl bg-white/10 border border-white/25 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {organizer.instagram && (
                <a 
                  href={`https://instagram.com/${organizer.instagram}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-xl bg-white/10 border border-white/25 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {organizer.linkedin && (
                <a 
                  href={organizer.linkedin.startsWith("http") ? organizer.linkedin : `https://linkedin.com/in/${organizer.linkedin}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-xl bg-white/10 border border-white/25 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Quickbar */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        <div className={`grid gap-4 ${campus.rating ? "grid-cols-2 md:grid-cols-4" : "grid-cols-3"}`}>
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <Calendar className="w-5 h-5 text-[var(--color-lime)] mx-auto mb-2" />
            <p className="text-[20px] font-anton text-text-main leading-none">{upcomingEvents.length}</p>
            <p className="text-[10px] text-text-faint uppercase tracking-widest font-bold mt-1.5">Live Events</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <Users className="w-5 h-5 text-[var(--color-cobalt)] mx-auto mb-2" />
            <p className="text-[20px] font-anton text-text-main leading-none">{totalRegistrations}</p>
            <p className="text-[10px] text-text-faint uppercase tracking-widest font-bold mt-1.5">Signups</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <Award className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <p className="text-[20px] font-anton text-text-main leading-none">{pastEvents.length}</p>
            <p className="text-[10px] text-text-faint uppercase tracking-widest font-bold mt-1.5">Past Events</p>
          </div>
          {campus.rating && (
            <div className="rounded-2xl border border-border bg-card p-5 text-center">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400 mx-auto mb-2" />
              <p className="text-[20px] font-anton text-text-main leading-none">{campus.rating.toFixed(1)}</p>
              <p className="text-[10px] text-text-faint uppercase tracking-widest font-bold mt-1.5">Rating</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-10 grid grid-cols-1 lg:grid-cols-[1.8fr_1.2fr] gap-10">
        
        {/* Left Column: Events & Gallery */}
        <div className="space-y-12">
          
          {/* About section */}
          <div className="space-y-4">
            <h2 className="text-xl font-anton uppercase tracking-wider text-text-main">About the Campus Organizer</h2>
            <p className="text-text-muted text-sm leading-relaxed font-archivo">
              {organizer.description || `Events hosted by ${collegeName} on CollegeEvents.`}
            </p>
          </div>

          {/* Upcoming Events Grid */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="text-xl font-anton uppercase tracking-wider text-text-main">Upcoming Schedule</h2>
              <span className="text-[11px] font-bold text-text-faint uppercase tracking-wider">{upcomingEvents.length} events found</span>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-text-faint text-xs font-bold uppercase tracking-wider">
                No upcoming events scheduled currently.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingEvents.map((evt) => (
                  <div key={evt.id} className="group rounded-2xl border border-border bg-card overflow-hidden flex flex-col hover:border-border transition-all">
                    <div className="h-40 relative bg-card">
                      {evt.images[0]?.url ? (
                        <Image 
                          src={evt.images[0].url} 
                          alt={evt.title} 
                          fill
                          className="object-cover group-hover:scale-103 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, 350px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">🎉</div>
                      )}
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-border text-[10px] font-bold text-[var(--color-lime)] uppercase tracking-wider">
                        {evt.category.name}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] text-text-faint font-semibold">{new Date(evt.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        <h3 className="text-sm font-bold text-text-main leading-snug group-hover:text-[var(--color-lime)] transition-colors">{evt.title}</h3>
                        <p className="text-[11px] text-text-faint line-clamp-2 mt-1">{evt.description}</p>
                      </div>
                      <Link 
                        href={`/events/${evt.slug}`}
                        className="w-full py-2 bg-card hover:bg-card border border-border text-center font-bold text-[11px] rounded-lg mt-4 transition-colors block"
                      >
                        View Event Detail
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Events Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-anton uppercase tracking-wider text-text-main border-b border-border pb-3">Past Fests & Events</h2>
            
            {pastEvents.length === 0 ? (
              <p className="text-xs text-text-faint font-bold uppercase tracking-wider text-center py-6 border border-dashed border-border rounded-2xl bg-card">
                No past events recorded.
              </p>
            ) : (
              <div className="space-y-3">
                {pastEvents.map((evt) => (
                  <div key={evt.id} className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card text-xs hover:border-border transition-all font-archivo">
                    <div>
                      <h4 className="font-bold text-text-main text-sm">{evt.title}</h4>
                      <p className="text-[10.5px] text-text-faint mt-0.5">
                        Held on {new Date(evt.date).toLocaleDateString("en-US", { month: "long", year: "numeric" })} • {evt.category.name}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-text-muted bg-card border border-border px-2 py-0.5 rounded">
                      Completed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gallery Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-anton uppercase tracking-wider text-text-main">Campus Gallery</h2>
            {gallery.length === 0 ? (
              <div className="p-8 border border-dashed border-border rounded-2xl bg-card text-center text-text-faint text-xs flex flex-col items-center gap-2">
                <ImageIcon className="w-8 h-8 opacity-40" />
                No pictures in gallery yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {gallery.map((img, i) => (
                  <div key={i} className="aspect-video bg-card border border-border rounded-xl overflow-hidden relative group">
                    <Image 
                      src={img} 
                      alt="Gallery campus image"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, 250px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Team & Details */}
        <div className="space-y-8">
          
          {/* Team section */}
          {team.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
            <h3 className="text-base font-anton uppercase tracking-wider text-text-main border-b border-border pb-2">Organizer Team</h3>
            <div className="space-y-4">
              {team.map((t, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-border bg-card overflow-hidden relative shrink-0">
                    {t.img ? (
                      <Image src={t.img} alt={t.name} fill className="object-cover" sizes="40px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold bg-[var(--color-lime)]/10 text-[var(--color-lime)]">
                        {t.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-main">{t.name}</h4>
                    <p className="text-[10px] text-text-faint mt-0.5">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Contact Details */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            <h3 className="text-base font-anton uppercase tracking-wider text-text-main border-b border-border pb-2">Contact Details</h3>
            <div className="space-y-3.5 text-xs text-text-muted font-archivo">
              <div className="flex items-start gap-2.5">
                <Mail className="w-4.5 h-4.5 text-[var(--color-lime)] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-text-faint block uppercase font-bold tracking-wider leading-none mb-1">Email Address</span>
                  <span className="text-text-main font-semibold">{organizer.user.email}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <BookOpen className="w-4.5 h-4.5 text-[var(--color-lime)] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-text-faint block uppercase font-bold tracking-wider leading-none mb-1">Academic Department</span>
                  <span className="text-text-main font-semibold">{organizer.department}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location Map mockup */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-base font-anton uppercase tracking-wider text-text-main border-b border-border pb-2">Location Map</h3>
            <div className="h-48 rounded-xl bg-card border border-border relative overflow-hidden flex items-center justify-center text-center">
              {/* Stylized mockup map */}
              <div className="absolute inset-0 bg-bg-elevated bg-[radial-gradient(var(--color-border-bright)_1px,transparent_1px)] [background-size:16px_16px]" />
              
              {/* Stamen mockup lines */}
              <div className="absolute w-[150%] h-[1px] bg-border-bright rotate-12" />
              <div className="absolute w-[150%] h-[1px] bg-border-bright -rotate-45" />
              <div className="absolute w-[150%] h-[1px] bg-card rotate-60" />

              <div className="relative z-10 space-y-2">
                <div className="w-10 h-10 rounded-full bg-coral/10 border border-coral/30 flex items-center justify-center mx-auto text-coral animate-bounce">
                  <MapPin className="w-5 h-5 fill-coral text-[#0A0A0A]" />
                </div>
                <h4 className="text-xs font-bold text-text-main">{city} Campus</h4>
                <p className="text-[10px] text-text-faint font-medium max-w-[200px] leading-relaxed mx-auto">
                  {campus.area}, {state}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
