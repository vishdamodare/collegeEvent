import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { 
  MapPin, Globe, Calendar, Users, Award, 
  CheckCircle2, Mail, Phone, BookOpen, Clock, Star, ArrowLeft, Image as ImageIcon 
} from "lucide-react";
import Image from "next/image";

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
            include: { category: true, images: true, registrations: true }
          }
        }
      }
    }
  });

  const organizer = organizers.find(org => 
    org.college.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") === slug
  );

  if (!organizer) {
    notFound();
  }

  const collegeName = organizer.college;
  const events = organizer.user.events;
  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.date) >= now);
  const pastEvents = events.filter(e => new Date(e.date) < now);

  // Aggregate stats
  const totalRegistrations = events.reduce((sum, e) => sum + e.registrations.length, 0);
  const hash = collegeName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const followersCount = Math.round(totalRegistrations * 2.8 + (hash % 100) * 8 + 140);
  const averageRating = (4.5 + (hash % 5) * 0.1).toFixed(1);
  const responseTime = hash % 2 === 0 ? "Within 2 hours" : "Within 24 hours";

  // Gallery images from events
  const gallery = events
    .flatMap(e => e.images.map(img => img.url))
    .filter(Boolean)
    .slice(0, 6);

  // Fallback banner
  const bannerUrl = hash % 3 === 0 
    ? "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1200&auto=format&fit=crop"
    : hash % 3 === 1
      ? "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop"
      : "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop";

  // Mock team members
  const team = [
    { name: organizer.user.name, role: `${organizer.position} (Lead Coordinator)`, img: organizer.user.image },
    { name: "Aditya Verma", role: "Co-Lead (Student Affairs)", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop" },
    { name: "Shruti Hegde", role: "Treasurer (Logistics)", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" }
  ];

  // Determine city & state
  let city = "Mumbai";
  let state = "Maharashtra";
  if (organizer.address) {
    const parts = organizer.address.split(",");
    if (parts.length >= 2) {
      city = parts[parts.length - 2].trim();
      state = parts[parts.length - 1].trim();
    }
  } else {
    const upperName = collegeName.toUpperCase();
    if (upperName.includes("PUNE")) { city = "Pune"; }
    else if (upperName.includes("DELHI")) { city = "Delhi"; state = "Delhi"; }
    else if (upperName.includes("PILANI")) { city = "Pilani"; state = "Rajasthan"; }
  }

  // Get dynamic categories
  const categoryNames = Array.from(new Set(events.map(e => e.category.name))).slice(0, 3);
  const popularCategories = categoryNames.length > 0 ? categoryNames.join(", ") : "Cultural, Technical";

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-archivo pb-16">
      
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-white/50 hover:text-[var(--color-lime)] transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Discover
        </Link>
      </div>

      {/* College Hero Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        <div className="rounded-3xl border border-white/10 bg-[#121212]/40 relative overflow-hidden h-[300px] md:h-[400px]">
          <Image 
            src={bannerUrl} 
            alt={collegeName}
            fill
            className="object-cover opacity-40 blur-xs"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/40 to-transparent" />
          
          {/* Hero details float */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold text-[var(--color-lime)] bg-[var(--color-lime)]/10 border border-[var(--color-lime)]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Campus Organizer
                </span>
                {organizer.verificationStatus === "APPROVED" && (
                  <span className="text-[var(--color-lime)] flex items-center gap-1 text-[12px] font-medium bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-[var(--color-lime)] text-black" /> Verified Campus
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-anton text-white tracking-wide uppercase leading-none max-w-3xl">
                {collegeName}
              </h1>
              <p className="flex items-center gap-1.5 text-xs md:text-sm text-white/60">
                <MapPin className="w-4 h-4 text-coral shrink-0" />
                {city}, {state} {organizer.address ? `• ${organizer.address}` : ""}
              </p>
            </div>

            {/* Social Header buttons */}
            <div className="flex items-center gap-2">
              {organizer.website && (
                <a 
                  href={organizer.website.startsWith("http") ? organizer.website : `https://${organizer.website}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {organizer.instagram && (
                <a 
                  href={`https://instagram.com/${organizer.instagram}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {organizer.linkedin && (
                <a 
                  href={organizer.linkedin.startsWith("http") ? organizer.linkedin : `https://linkedin.com/in/${organizer.linkedin}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all"
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/5 bg-[#121212]/30 p-5 text-center">
            <Calendar className="w-5 h-5 text-[var(--color-lime)] mx-auto mb-2" />
            <p className="text-[20px] font-anton text-white leading-none">{upcomingEvents.length}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1.5">Live Events</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-[#121212]/30 p-5 text-center">
            <Users className="w-5 h-5 text-[var(--color-cobalt)] mx-auto mb-2" />
            <p className="text-[20px] font-anton text-white leading-none">{totalRegistrations}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1.5">Signups</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-[#121212]/30 p-5 text-center">
            <Award className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <p className="text-[20px] font-anton text-white leading-none">{followersCount}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1.5">Followers</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-[#121212]/30 p-5 text-center">
            <Star className="w-5 h-5 text-orange-400 mx-auto mb-2" />
            <p className="text-[20px] font-anton text-white leading-none">{averageRating} ★</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1.5">Avg Rating</p>
          </div>
        </div>
      </div>

      {/* Main Grid content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-10 grid grid-cols-1 lg:grid-cols-[1.8fr_1.2fr] gap-10">
        
        {/* Left Column: Events & Gallery */}
        <div className="space-y-12">
          
          {/* About section */}
          <div className="space-y-4">
            <h2 className="text-xl font-anton uppercase tracking-wider text-white">About the Campus Organizer</h2>
            <p className="text-white/60 text-sm leading-relaxed font-archivo">
              {organizer.description || `${collegeName} Event Organizing Team orchestrates campus activities, manages dynamic student fests, and builds high-quality inter-collegiate events. Our team collaborates with different branches like ${organizer.department || "Engineering"} to bring students together across technical, sports, and cultural milestones.`}
            </p>
          </div>

          {/* Upcoming Events Grid */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h2 className="text-xl font-anton uppercase tracking-wider text-white">Upcoming Schedule</h2>
              <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">{upcomingEvents.length} events found</span>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-12 text-center text-white/30 text-xs font-bold uppercase tracking-wider">
                No upcoming events scheduled currently.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingEvents.map((evt) => (
                  <div key={evt.id} className="group rounded-2xl border border-white/5 bg-[#121212]/30 overflow-hidden flex flex-col hover:border-white/15 transition-all">
                    <div className="h-40 relative bg-white/5">
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
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-white/10 text-[10px] font-bold text-[var(--color-lime)] uppercase tracking-wider">
                        {evt.category.name}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] text-white/40 font-semibold">{new Date(evt.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        <h3 className="text-sm font-bold text-white leading-snug group-hover:text-[var(--color-lime)] transition-colors">{evt.title}</h3>
                        <p className="text-[11px] text-white/40 line-clamp-2 mt-1">{evt.description}</p>
                      </div>
                      <Link 
                        href={`/events/${evt.slug}`}
                        className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-center font-bold text-[11px] rounded-lg mt-4 transition-colors block"
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
            <h2 className="text-xl font-anton uppercase tracking-wider text-white border-b border-white/5 pb-3">Past Fests & Events</h2>
            
            {pastEvents.length === 0 ? (
              <p className="text-xs text-white/30 font-bold uppercase tracking-wider text-center py-6 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                No past events recorded.
              </p>
            ) : (
              <div className="space-y-3">
                {pastEvents.map((evt) => (
                  <div key={evt.id} className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-[#121212]/20 text-xs hover:border-white/10 transition-all font-archivo">
                    <div>
                      <h4 className="font-bold text-white text-sm">{evt.title}</h4>
                      <p className="text-[10.5px] text-white/40 mt-0.5">
                        Held on {new Date(evt.date).toLocaleDateString("en-US", { month: "long", year: "numeric" })} • {evt.category.name}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-white/50 bg-white/5 border border-white/5 px-2 py-0.5 rounded">
                      Completed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gallery Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-anton uppercase tracking-wider text-white">Campus Gallery</h2>
            {gallery.length === 0 ? (
              <div className="p-8 border border-dashed border-white/10 rounded-2xl bg-white/[0.01] text-center text-white/30 text-xs flex flex-col items-center gap-2">
                <ImageIcon className="w-8 h-8 opacity-40" />
                No pictures in gallery yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {gallery.map((img, i) => (
                  <div key={i} className="aspect-video bg-white/5 border border-white/10 rounded-xl overflow-hidden relative group">
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
          <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-6 space-y-6">
            <h3 className="text-base font-anton uppercase tracking-wider text-white border-b border-white/5 pb-2">Organizer Team</h3>
            <div className="space-y-4">
              {team.map((t, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 overflow-hidden relative shrink-0">
                    {t.img ? (
                      <Image src={t.img} alt={t.name} fill className="object-cover" sizes="40px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold bg-[var(--color-lime)]/10 text-[var(--color-lime)]">
                        {t.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{t.name}</h4>
                    <p className="text-[10px] text-white/40 mt-0.5">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-6 space-y-5">
            <h3 className="text-base font-anton uppercase tracking-wider text-white border-b border-white/5 pb-2">Contact Details</h3>
            <div className="space-y-3.5 text-xs text-white/70 font-archivo">
              <div className="flex items-start gap-2.5">
                <Mail className="w-4.5 h-4.5 text-[var(--color-lime)] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-white/30 block uppercase font-bold tracking-wider leading-none mb-1">Email Address</span>
                  <span className="text-white font-semibold">{organizer.user.email}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <BookOpen className="w-4.5 h-4.5 text-[var(--color-lime)] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-white/30 block uppercase font-bold tracking-wider leading-none mb-1">Academic Department</span>
                  <span className="text-white font-semibold">{organizer.department}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4.5 h-4.5 text-[var(--color-lime)] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-white/30 block uppercase font-bold tracking-wider leading-none mb-1">Average Response</span>
                  <span className="text-white font-semibold">{responseTime}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4.5 h-4.5 text-[var(--color-lime)] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-white/30 block uppercase font-bold tracking-wider leading-none mb-1">Support Helpline</span>
                  <span className="text-white font-semibold">+91 90000 12345 (Public)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location Map mockup */}
          <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-6 space-y-4">
            <h3 className="text-base font-anton uppercase tracking-wider text-white border-b border-white/5 pb-2">Location Map</h3>
            <div className="h-48 rounded-xl bg-card border border-border relative overflow-hidden flex items-center justify-center text-center">
              {/* Stylized mockup map */}
              <div className="absolute inset-0 bg-[#0E0E0E] opacity-55 bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] [background-size:16px_16px]" />
              
              {/* Stamen mockup lines */}
              <div className="absolute w-[150%] h-[1px] bg-white/5 rotate-12" />
              <div className="absolute w-[150%] h-[1px] bg-white/5 -rotate-45" />
              <div className="absolute w-[150%] h-[1px] bg-white/5 rotate-60" />

              <div className="relative z-10 space-y-2">
                <div className="w-10 h-10 rounded-full bg-coral/10 border border-coral/30 flex items-center justify-center mx-auto text-coral animate-bounce">
                  <MapPin className="w-5 h-5 fill-coral text-[#0A0A0A]" />
                </div>
                <h4 className="text-xs font-bold text-white">{city} Campus</h4>
                <p className="text-[10px] text-white/40 font-medium max-w-[200px] leading-relaxed mx-auto">
                  {organizer.address || `Located in ${city}, ${state}`}
                </p>
              </div>
            </div>
          </div>

          {/* Reviews section */}
          <div className="space-y-4">
            <h3 className="text-base font-anton uppercase tracking-wider text-white">Student Reviews</h3>
            <div className="space-y-3">
              {[
                { name: "Rahul S.", rating: 5, text: "Excellent fests! The technical seminars organized by this college are outstanding." },
                { name: "Neha D.", rating: 4, text: "Very smooth registrations and great coordination during cultural events." }
              ].map((rev, idx) => (
                <div key={idx} className="rounded-xl border border-white/5 bg-[#121212]/20 p-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{rev.name}</span>
                    <span className="text-orange-400 font-bold">{rev.rating} ★</span>
                  </div>
                  <p className="text-white/60 leading-relaxed font-archivo">{rev.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
