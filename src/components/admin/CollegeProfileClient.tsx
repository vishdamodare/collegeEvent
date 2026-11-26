"use client";

import { useState, useTransition } from "react";
import { 
  Globe, 
  CheckCircle, 
  Save,
  Loader2,
  Plus,
  Trash2,
  ExternalLink
} from "lucide-react";
import { updateOrganizerProfile } from "@/actions/admin";
import { toast } from "sonner";

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

interface CollegeProfileClientProps {
  initialProfile: {
    name: string;
    college: string;
    department: string;
    position: string;
    description: string;
    website: string;
    instagram: string;
    linkedin: string;
    address: string;
    verificationStatus: string;
    pageTagline: string;
    pageCredentials: { label: string; detail: string }[] | null;
    pageLogo: string;
    pageHero: string;
    pageAccent: string;
  };
  /** What the public page shows when a field is left empty (from the campus config) */
  pageDefaults: { slug: string | null; credentials: [string, string][]; accent: string | null };
}

const fieldCls = "w-full px-4 py-3 rounded-xl bg-[#141414] border border-white/5 text-white text-[13.5px] outline-none focus:border-[var(--color-lime)] transition-colors";
const labelCls = "block text-[13px] font-bold mb-2 text-white/70";

export default function CollegeProfileClient({ initialProfile, pageDefaults }: CollegeProfileClientProps) {
  const [collegeName, setCollegeName] = useState(initialProfile.college);
  const [department, setDepartment] = useState(initialProfile.department);
  const [description, setDescription] = useState(initialProfile.description);
  const [website, setWebsite] = useState(initialProfile.website);
  const [instagram, setInstagram] = useState(initialProfile.instagram);
  const [linkedin, setLinkedin] = useState(initialProfile.linkedin);
  const [address, setAddress] = useState(initialProfile.address);
  const [tagline, setTagline] = useState(initialProfile.pageTagline);
  // null = show the default badges; an array (even empty) = the admin's own list
  const [credentials, setCredentials] = useState<{ label: string; detail: string }[] | null>(initialProfile.pageCredentials);
  const [logo, setLogo] = useState(initialProfile.pageLogo);
  const [hero, setHero] = useState(initialProfile.pageHero);
  const [accent, setAccent] = useState(initialProfile.pageAccent);

  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    if (!collegeName.trim() || !department.trim()) {
      toast.error("College Name and Department are required.");
      return;
    }

    startTransition(async () => {
      const res = await updateOrganizerProfile({
        name: initialProfile.name,
        college: collegeName,
        department,
        position: initialProfile.position || "Organizer",
        description: description || "",
        website: website || "",
        instagram: instagram || "",
        linkedin: linkedin || "",
        address: address || "",
        pageTagline: tagline,
        pageCredentials: credentials,
        pageLogo: logo,
        pageHero: hero,
        pageAccent: accent
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Saved. Your public page is updated.");
      }
    });
  };

  return (
    <div className="space-y-8 font-archivo">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-anton uppercase tracking-wider text-white">College Profile</h1>
        <p className="text-[13px] text-white/40">Manage institutional branding, official contact handles, and campus coordinates.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-6 md:p-8 backdrop-blur-xl relative">
        <div className="space-y-6">
          <div className="flex items-start gap-4 pb-6 border-b border-white/5">
            <div className="w-16 h-16 rounded-xl bg-[var(--color-cobalt)]/20 border border-[var(--color-cobalt)]/30 flex items-center justify-center font-bold text-white text-[24px]">
              {collegeName ? collegeName.substring(0, 3).toUpperCase() : "ORG"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[16px] font-bold text-white leading-tight">{collegeName || "Unnamed College"}</h3>
                {initialProfile.verificationStatus === "APPROVED" && (
                  <span className="text-[var(--color-lime)]" title="Official Verified Badge">
                    <CheckCircle className="w-4 h-4 fill-[var(--color-lime)] text-[#0B0B08]" />
                  </span>
                )}
              </div>
              <p className="text-[11.5px] text-white/40 mt-1">{department || "No Department Assigned"}</p>
              <span className="text-[10px] font-bold text-[var(--color-lime)] uppercase px-2 py-0.5 mt-2 inline-block rounded bg-[var(--color-lime)]/10 border border-[var(--color-lime)]/20">
                {initialProfile.verificationStatus} Institution
              </span>
            </div>
          </div>

          {/* Form details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-bold mb-2 text-white/70">College / Institution Name</label>
              <input 
                type="text" 
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="e.g. Vidyalankar Institute of Technology"
                className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-white/5 text-white text-[13.5px] outline-none focus:border-[var(--color-lime)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold mb-2 text-white/70">Department Name</label>
              <input 
                type="text" 
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Information Technology"
                className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-white/5 text-white text-[13.5px] outline-none focus:border-[var(--color-lime)] transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[13px] font-bold mb-2 text-white/70">About text <span className="font-normal text-white/40">(shown on your public page)</span></label>
              <textarea 
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your campus or organization..."
                className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-white/5 text-white text-[13.5px] outline-none focus:border-[var(--color-lime)] transition-colors"
              ></textarea>
            </div>
            <div>
              <label className="block text-[13px] font-bold mb-2 text-white/70">Official Address</label>
              <input 
                type="text" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Wadala East, Mumbai, Maharashtra 400037"
                className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-white/5 text-white text-[13.5px] outline-none focus:border-[var(--color-lime)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold mb-2 text-white/70">Website URL</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.edu"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#141414] border border-white/5 text-white text-[13.5px] outline-none focus:border-[var(--color-lime)] transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-bold mb-2 text-white/70">Instagram Handle</label>
              <div className="relative">
                <Instagram className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/handle"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#141414] border border-white/5 text-white text-[13.5px] outline-none focus:border-[var(--color-lime)] transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-bold mb-2 text-white/70">LinkedIn Page</label>
              <div className="relative">
                <Linkedin className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/company/page"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#141414] border border-white/5 text-white text-[13.5px] outline-none focus:border-[var(--color-lime)] transition-colors"
                />
              </div>
            </div>
          </div>


          {/* Public page */}
          <div className="pt-6 border-t border-white/5 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-[16px] font-bold text-white">Public page</h3>
                <p className="text-[12.5px] text-white/40 mt-1">What visitors see on your college page. Leave a field empty to use the default.</p>
              </div>
              {pageDefaults.slug && (
                <a href={`/colleges/${pageDefaults.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-lime)] hover:underline">
                  View page <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              )}
            </div>

            <div>
              <label htmlFor="page-tagline" className={labelCls}>Tagline <span className="font-normal text-white/40">(under your college name)</span></label>
              <input id="page-tagline" type="text" value={tagline} maxLength={160} onChange={(e) => setTagline(e.target.value)} placeholder="Fests, hackathons and competitions from Malad West, Mumbai." className={fieldCls} />
              <p className="text-[11.5px] text-white/30 mt-1.5 text-right">{tagline.length}/160</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={labelCls + " mb-0"}>Accreditation badges</span>
                {credentials === null ? (
                  pageDefaults.credentials.length > 0 && (
                    <button type="button" onClick={() => setCredentials(pageDefaults.credentials.map(([label, detail]) => ({ label, detail })))} className="text-[12.5px] font-semibold text-[var(--color-lime)] hover:underline cursor-pointer">
                      Customise
                    </button>
                  )
                ) : (
                  <button type="button" onClick={() => setCredentials(null)} className="text-[12.5px] font-semibold text-white/50 hover:text-white cursor-pointer">
                    Use defaults
                  </button>
                )}
              </div>

              {credentials === null ? (
                <p className="text-[12.5px] text-white/40 rounded-xl border border-dashed border-white/10 px-4 py-3">
                  {pageDefaults.credentials.length > 0
                    ? `Showing the default badges: ${pageDefaults.credentials.map(([l]) => l).join(", ")}.`
                    : "No badges shown."}{" "}
                  <button type="button" onClick={() => setCredentials([{ label: "", detail: "" }])} className="font-semibold text-[var(--color-lime)] hover:underline cursor-pointer">Add your own</button>
                </p>
              ) : (
                <div className="space-y-2.5">
                  {credentials.map((c, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2.5">
                      <input aria-label={`Badge ${i + 1} title`} value={c.label} maxLength={40} onChange={(e) => setCredentials(credentials.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="NAAC re-accredited" className={fieldCls} />
                      <input aria-label={`Badge ${i + 1} detail`} value={c.detail} maxLength={50} onChange={(e) => setCredentials(credentials.map((x, j) => (j === i ? { ...x, detail: e.target.value } : x)))} placeholder="'A+' Grade" className={fieldCls} />
                      <button type="button" aria-label={`Remove badge ${i + 1}`} onClick={() => setCredentials(credentials.filter((_, j) => j !== i))} className="w-11 rounded-xl border border-white/5 bg-[#141414] text-white/50 hover:text-red-400 flex items-center justify-center cursor-pointer">
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                  {credentials.length < 6 && (
                    <button type="button" onClick={() => setCredentials([...credentials, { label: "", detail: "" }])} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-lime)] hover:underline cursor-pointer">
                      <Plus className="w-4 h-4" aria-hidden="true" /> Add badge
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {([
                { id: "page-logo", label: "Logo", note: "direct https link to an image", value: logo, set: setLogo, contain: true },
                { id: "page-hero", label: "Hero photo", note: "direct https link to an image", value: hero, set: setHero, contain: false },
              ] as const).map((f) => (
                <div key={f.id}>
                  <label htmlFor={f.id} className={labelCls}>{f.label} <span className="font-normal text-white/40">({f.note})</span></label>
                  <div className="flex gap-3">
                    <input id={f.id} type="url" value={f.value} onChange={(e) => f.set(e.target.value)} placeholder="https://…" className={fieldCls} />
                    {f.value && (
                      <span className="w-12 h-12 shrink-0 rounded-lg bg-white overflow-hidden self-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={f.value} alt="" className={`w-full h-full ${f.contain ? "object-contain p-1" : "object-cover"}`} />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label htmlFor="page-accent" className={labelCls}>Brand colour <span className="font-normal text-white/40">(buttons, timeline, footer line)</span></label>
              <div className="flex items-center gap-3">
                <input aria-label="Pick brand colour" type="color" value={/^#[0-9a-fA-F]{6}$/.test(accent) ? accent : pageDefaults.accent || "#2451FF"} onChange={(e) => setAccent(e.target.value)} className="w-12 h-12 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
                <input id="page-accent" type="text" value={accent} onChange={(e) => setAccent(e.target.value)} placeholder={pageDefaults.accent || "#2451FF"} maxLength={7} className={fieldCls + " max-w-[180px]"} />
                {accent && <button type="button" onClick={() => setAccent("")} className="text-[12.5px] font-semibold text-white/50 hover:text-white cursor-pointer">Use default</button>}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-2 py-3 px-6 rounded-xl bg-[var(--color-lime)] hover:bg-[var(--color-lime)]/90 text-[#0b0b0b] font-bold text-[14px] transition-all cursor-pointer disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Profile Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
