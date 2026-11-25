"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarClock, ChevronDown, ImagePlus, Loader2, MapPin, Plus, Trash2, Users, X } from "lucide-react";
import { createEvent, updateEvent } from "@/actions/admin";
import { isImageUrl } from "@/utils/imageUrl";
import { RegistrationFormBuilder } from "@/components/admin/RegistrationFormBuilder";
import type { FormField } from "@/types/admin/registration";

type Category = { id: string; name: string };
type Errors = Partial<Record<"title" | "categoryId" | "otherCategory" | "description" | "date" | "location" | "capacity" | "team" | "banner" | "end" | "closes", string>>;
type Prize = { title: string; cashPrize?: number; goodies?: string };
type Faq = { question: string; answer: string };
// Event.details is the JSON blob the public event page reads; we only touch the keys this form manages
type Details = Record<string, Record<string, unknown> | undefined>;

export interface EventFormInitial {
  id: string;
  status: "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED" | "ARCHIVED";
  title: string;
  categoryId: string;
  description: string;
  date: string; // ISO
  location: string;
  capacity: number;
  eventType: "INDIVIDUAL" | "TEAM";
  teamMinSize: number;
  teamMaxSize: number;
  banner: string;
  additionalQuestions: FormField[];
  details: Details | null;
}

const OTHER = "__other";
const NO_LIMIT = 1_000_000; // stored as a huge capacity; shown as "No limit"
const PLACES = ["1st Prize", "2nd Prize", "3rd Prize"];

const input =
  "w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/10 text-white text-[14px] placeholder:text-white/30 outline-none focus:border-[var(--color-lime)] focus:ring-2 focus:ring-[var(--color-lime)]/30 transition";

// ISO instant -> value for <input type="datetime-local"> in the organizer's own timezone
const toLocalInput = (iso?: unknown) => {
  if (typeof iso !== "string" || !iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const toIso = (local: string) => (local ? new Date(local).toISOString() : "");
const str = (v: unknown) => (typeof v === "string" ? v : "");

// Direct browser -> Cloudinary upload using a server-signed request (see /api/cloudinary/sign)
async function uploadBanner(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Please choose a JPG, PNG or WebP image.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Image must be under 5 MB.");
  const sig = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder: "events" }),
  }).then((r) => r.json());
  if (!sig.success) throw new Error("Image upload isn't available right now. You can paste an image link instead.");
  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", sig.apiKey);
  fd.append("timestamp", String(sig.timestamp));
  fd.append("signature", sig.signature);
  fd.append("folder", sig.folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Upload failed. Please try again.");
  return data.secure_url as string;
}

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-semibold text-white/80 mb-1.5">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-[12px] text-white/40 mt-1.5">{hint}</p>}
      {error && (
        <p role="alert" className="text-[12px] text-red-400 mt-1.5">
          {error}
        </p>
      )}
    </div>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#121212]/60 p-5 sm:p-6 space-y-5">
      <h2 className="flex items-center gap-3 text-[18px] font-anton uppercase tracking-wide text-white">
        <span className="w-7 h-7 rounded-full bg-[var(--color-lime)] text-white text-[13px] font-archivo font-bold flex items-center justify-center">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Collapsible optional section; opens itself when it already has content (e.g. while editing). */
function Extra({ title, hint, defaultOpen, children }: { title: string; hint: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <details open={defaultOpen} className="group rounded-2xl border border-white/10 bg-[#121212]/60 open:bg-[#121212]">
      <summary className="flex items-center gap-3 cursor-pointer list-none p-5 sm:px-6 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold text-white">{title}</span>
          <span className="block text-[12.5px] text-white/45 mt-0.5">{hint}</span>
        </span>
        <ChevronDown aria-hidden className="w-5 h-5 text-white/40 transition group-open:rotate-180" />
      </summary>
      <div className="px-5 sm:px-6 pb-6 space-y-5">{children}</div>
    </details>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return ymd(d);
};
// 6:00 AM … 11:30 PM in 30-minute steps
const TIMES = Array.from({ length: 36 }, (_, i) => {
  const h = 6 + Math.floor(i / 2);
  const m = i % 2 ? 30 : 0;
  return { value: `${pad(h)}:${pad(m)}`, label: `${h % 12 || 12}:${pad(m)} ${h < 12 ? "AM" : "PM"}` };
});
const chip = (on: boolean) =>
  `px-3 py-1.5 rounded-full text-[12.5px] font-semibold border transition cursor-pointer ${
    on ? "bg-[var(--color-lime)] border-transparent text-white" : "border-white/15 text-white/70 hover:text-white hover:bg-white/5"
  }`;

/**
 * Date + time picker: quick-date chips, a calendar that opens on click anywhere in the box,
 * and a friendly time dropdown. Value is a local "YYYY-MM-DDTHH:mm" string (same as datetime-local).
 */
function DateTimePicker({ id, value, onChange, defaultTime = "10:00", quick, clearable }: { id: string; value: string; onChange: (v: string) => void; defaultTime?: string; quick?: boolean; clearable?: boolean }) {
  const [datePart = "", timePart = ""] = value ? value.split("T") : [];
  const set = (dp: string, tp: string) => onChange(dp ? `${dp}T${tp || defaultTime}` : "");
  const sat = (() => {
    const d = new Date();
    return (6 - d.getDay() + 7) % 7 || 7; // days until the coming Saturday
  })();
  const quickDates = [
    { label: "Today", value: addDays(0) },
    { label: "Tomorrow", value: addDays(1) },
    { label: "This Sat", value: addDays(sat) },
    { label: "Next week", value: addDays(7) },
  ];
  const times = timePart && !TIMES.some((t) => t.value === timePart) ? [{ value: timePart, label: timePart }, ...TIMES] : TIMES;

  return (
    <div className="space-y-2">
      {quick && (
        <div className="flex flex-wrap gap-2" aria-label="Quick dates">
          {quickDates.map((q) => (
            <button key={q.label} type="button" className={chip(datePart === q.value)} onClick={() => set(q.value, timePart)}>
              {q.label}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-[1.3fr_1fr] gap-2">
        <div className="relative">
          <CalendarClock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id={id}
            type="date"
            min={addDays(0)}
            value={datePart}
            onChange={(e) => set(e.target.value, timePart)}
            // Open the calendar from anywhere in the box instead of only the tiny icon
            onClick={(e) => { try { e.currentTarget.showPicker?.(); } catch {} }}
           
            className={`${input} pl-10 cursor-pointer`}
          />
        </div>
        <select aria-label="Time" value={timePart} onChange={(e) => set(datePart || addDays(0), e.target.value)} className={`${input} cursor-pointer`}>
          <option value="">Time…</option>
          {times.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      {clearable && value && (
        <button type="button" onClick={() => onChange("")} className="text-[12px] text-white/50 hover:text-white underline underline-offset-2 cursor-pointer">
          Clear
        </button>
      )}
    </div>
  );
}

const addBtn = "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/15 text-[13px] font-semibold text-white/80 hover:bg-white/5 cursor-pointer";
const delBtn = "p-2.5 rounded-lg border border-white/10 text-white/50 hover:text-red-400 hover:border-red-500/40 cursor-pointer shrink-0";

/** One-page event form used for both creating and editing an event. */
export function QuickEventForm({ categories, initial }: { categories: Category[]; initial?: EventFormInitial }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const editing = !!initial;
  const d = initial?.details ?? {};
  const savedRules = d.rules ?? {};
  const savedContact = d.contact ?? {};
  const savedSchedule = d.schedule ?? {};

  const [title, setTitle] = useState(initial?.title ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [otherCategory, setOtherCategory] = useState("");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(toLocalInput(initial?.date));
  const [location, setLocation] = useState(initial?.location ?? "");
  const [mapsLink, setMapsLink] = useState(str(d.venue?.googleMapsLink));
  const [capacity, setCapacity] = useState(String(initial?.capacity ?? 100));
  const [eventType, setEventType] = useState<"INDIVIDUAL" | "TEAM">(initial?.eventType ?? "INDIVIDUAL");
  const [teamMin, setTeamMin] = useState(String(initial?.eventType === "TEAM" ? initial.teamMinSize : 2));
  const [teamMax, setTeamMax] = useState(String(initial?.eventType === "TEAM" ? initial.teamMaxSize : 4));
  const [banner, setBanner] = useState(initial?.banner ?? "");

  // Optional extras (shown on the public event page when filled)
  const [end, setEnd] = useState(toLocalInput(savedSchedule.end));
  const [closes, setCloses] = useState(toLocalInput(savedSchedule.registrationCloses));
  const [eligibility, setEligibility] = useState(str(savedRules.eligibility));
  const [rulesText, setRulesText] = useState(str(savedRules.instructions));
  const [judging, setJudging] = useState(str(savedRules.judgingCriteria));
  const [prizes, setPrizes] = useState<Prize[]>(() => {
    const saved = Array.isArray(savedRules.prizes) ? (savedRules.prizes as Prize[]) : [];
    // Always offer 1st/2nd/3rd rows; empty rows are dropped on save
    return [...PLACES.map((t, i) => saved[i] ?? { title: t }), ...saved.slice(3)];
  });
  const [faqs, setFaqs] = useState<Faq[]>(Array.isArray(savedRules.faqs) ? (savedRules.faqs as Faq[]) : []);
  const [contactName, setContactName] = useState(str(savedContact.coordinatorName));
  const [contactEmail, setContactEmail] = useState(str(savedContact.coordinatorEmail));
  const [contactPhone, setContactPhone] = useState(str(savedContact.coordinatorPhone));
  const [questions, setQuestions] = useState<FormField[]>(initial?.additionalQuestions ?? []);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState<"" | "DRAFT" | "PUBLISHED" | "KEEP">("");
  const [errors, setErrors] = useState<Errors>({});

  const clear = (k: keyof Errors) => setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));

  const validate = (): Errors => {
    const e: Errors = {};
    if (title.trim().length < 3) e.title = "Give your event a name (at least 3 characters).";
    if (!categoryId) e.categoryId = "Pick a category.";
    else if (categoryId === OTHER && otherCategory.trim().length < 2) e.otherCategory = "Type the category name.";
    if (description.trim().length < 10) e.description = "Add a short description (at least 10 characters).";
    if (!date) e.date = "Choose a date and start time.";
    // Editing a past event is fine as long as the date isn't being moved into the past
    else if (new Date(date).getTime() < Date.now() && (!editing || date !== toLocalInput(initial?.date))) e.date = "The start time must be in the future.";
    if (location.trim().length < 3 && !mapsLink.trim()) e.location = "Add the address or a Google Maps link.";
    if (capacity !== String(NO_LIMIT) && !(Number(capacity) >= 1)) e.capacity = "Enter how many people can attend.";
    if (eventType === "TEAM" && !(Number(teamMin) >= 1 && Number(teamMax) >= Number(teamMin))) e.team = "Max team size must be at least the minimum.";
    if (banner && !isImageUrl(banner)) e.banner = "That doesn't look like a direct image link (https…jpg/png/webp).";
    if (end && date && new Date(end) <= new Date(date)) e.end = "The end time must be after the start time.";
    if (closes && date && new Date(closes) > new Date(date)) e.closes = "Registration should close before the event starts.";
    return e;
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    clear("banner");
    try {
      setBanner(await uploadBanner(file));
    } catch (err) {
      setErrors((e) => ({ ...e, banner: (err as Error).message }));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const venueText = location.trim() || "See Google Maps link";
  const catValue = categoryId === OTHER ? otherCategory.trim() : categoryId; // server creates new categories from a name

  const buildDetails = () => {
    const isTeam = eventType === "TEAM";
    return {
      ...d, // keep anything this form doesn't manage (sponsors, map link, links…)
      basic: { tags: [], visibility: "PUBLIC", ...d.basic, title: title.trim(), category: catValue, description: description.trim() },
      schedule: { timezone: "Asia/Kolkata", ...d.schedule, start: toIso(date), end: toIso(end), registrationCloses: toIso(closes) },
      venue: { venueType: "OFFLINE", ...d.venue, venueLocation: venueText, address: location.trim(), googleMapsLink: mapsLink.trim() },
      registration: {
        ...d.registration,
        isTeam,
        minTeamSize: isTeam ? Number(teamMin) : 1,
        maxTeamSize: isTeam ? Number(teamMax) : 1,
        maxRegistrations: Number(capacity),
      },
      // Online payment isn't built yet: a stored fee would block registration, so events are always free
      pricing: { ...d.pricing, isFree: true, fee: 0, ticketingEnabled: false },
      media: { ...d.media, banner },
      rules: {
        ...d.rules,
        eligibility: eligibility.trim(),
        instructions: rulesText.trim(),
        judgingCriteria: judging.trim(),
        prizes: prizes.filter((p) => p.title.trim()).map((p) => ({ ...p, title: p.title.trim() })),
        faqs: faqs.filter((f) => f.question.trim()).map((f) => ({ question: f.question.trim(), answer: f.answer.trim() })),
      },
      contact: { ...d.contact, coordinatorName: contactName.trim(), coordinatorEmail: contactEmail.trim(), coordinatorPhone: contactPhone.trim() },
    };
  };

  const submit = async (mode: "DRAFT" | "PUBLISHED" | "KEEP") => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Please fix the highlighted fields.");
      setTimeout(() => document.querySelector('[role="alert"]')?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      return;
    }
    setSaving(mode);
    const status = mode === "KEEP" ? initial!.status : mode;
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        categoryId: catValue,
        // datetime-local is the organizer's local time; send an absolute instant so the server (UTC) doesn't shift it
        date: new Date(date),
        location: venueText,
        capacity: Number(capacity),
        status,
        imageUrl: banner || "",
        eventType,
        teamMinSize: eventType === "TEAM" ? Number(teamMin) : 1,
        teamMaxSize: eventType === "TEAM" ? Number(teamMax) : 1,
        additionalQuestions: questions.filter((q) => q.label.trim()),
        details: buildDetails(),
      };
      const res = editing ? await updateEvent(initial!.id, payload) : await createEvent(payload);
      if ("error" in res && res.error) {
        toast.error(res.error);
        setSaving("");
        return;
      }
      toast.success(
        editing
          ? mode === "PUBLISHED" ? "Published! Your event is live 🎉" : "Changes saved."
          : status === "PUBLISHED" ? "Your event is live! 🎉" : "Draft saved. Publish it whenever you're ready."
      );
      router.push("/admin/events");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSaving("");
    }
  };

  const busy = uploading || saving !== "";
  const isDraft = !editing || initial!.status === "DRAFT";
  const hasRules = !!(eligibility || rulesText || judging);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit(isDraft ? "PUBLISHED" : "KEEP");
      }}
      className="max-w-3xl mx-auto space-y-6 font-archivo"
    >
      <header>
        <h1 className="text-[34px] sm:text-[40px] font-anton uppercase tracking-wide text-white leading-none">{editing ? "Edit event" : "Create an event"}</h1>
        <p className="text-[14px] text-white/50 mt-2">
          {editing ? "Update anything below and save." : "Fill in the 3 sections and publish — about 2 minutes. Everything under “More details” is optional."}
        </p>
      </header>

      <Section n={1} title="The basics">
        <Field id="ev-title" label="Event name" error={errors.title}>
          <input id="ev-title" className={input} placeholder="e.g. CodeSprint 2026" value={title} maxLength={120} onChange={(e) => { setTitle(e.target.value); clear("title"); }} />
        </Field>
        <Field id="ev-cat" label="Category" error={errors.categoryId}>
          <select id="ev-cat" className={input} value={categoryId} onChange={(e) => { setCategoryId(e.target.value); clear("categoryId"); }}>
            <option value="">Choose a category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value={OTHER}>Other (specify)…</option>
          </select>
          {categoryId === OTHER && (
            <>
              <input aria-label="Other category" className={`${input} mt-2`} placeholder="Type your category, e.g. Quiz" maxLength={40} value={otherCategory} onChange={(e) => { setOtherCategory(e.target.value); clear("otherCategory"); }} />
              {errors.otherCategory && <p role="alert" className="text-[12px] text-red-400 mt-1.5">{errors.otherCategory}</p>}
            </>
          )}
        </Field>
        <Field id="ev-desc" label="What's it about?" hint="Tell students what to expect, who it's for and what they'll get out of it." error={errors.description}>
          <textarea id="ev-desc" rows={4} className={input} value={description} maxLength={5000} onChange={(e) => { setDescription(e.target.value); clear("description"); }} />
        </Field>
      </Section>

      <Section n={2} title="When & where">
        <Field id="ev-date" label="When does it start?" error={errors.date}>
          <DateTimePicker id="ev-date" quick value={date} onChange={(v) => { setDate(v); clear("date"); }} />
        </Field>
        <Field id="ev-cap" label="How many people can attend?" error={errors.capacity}>
          <div className="flex flex-wrap items-center gap-2">
            {[50, 100, 200, 500].map((n) => (
              <button key={n} type="button" className={chip(capacity === String(n))} onClick={() => { setCapacity(String(n)); clear("capacity"); }}>
                {n}
              </button>
            ))}
            <button type="button" className={chip(capacity === String(NO_LIMIT))} onClick={() => { setCapacity(String(NO_LIMIT)); clear("capacity"); }}>
              No limit
            </button>
            <div className="relative w-36">
              <Users className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input id="ev-cap" type="number" min={1} inputMode="numeric" aria-label="Custom number of attendees" className={`${input} pl-10 py-2`} value={capacity === String(NO_LIMIT) ? "" : capacity} placeholder={capacity === String(NO_LIMIT) ? "No limit" : ""} onChange={(e) => { setCapacity(e.target.value); clear("capacity"); }} />
            </div>
          </div>
        </Field>
        <Field id="ev-loc" label="Venue address" error={errors.location}>
          <div className="relative">
            <MapPin className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input id="ev-loc" className={`${input} pl-10`} placeholder="Type the address, e.g. Main Auditorium, IIT Bombay" value={location} onChange={(e) => { setLocation(e.target.value); clear("location"); }} />
          </div>
        </Field>
        <Field id="ev-map" label="Google Maps link" hint="Optional. Paste a link instead of (or along with) the address.">
          <input id="ev-map" type="url" className={input} placeholder="https://maps.google.com/…" value={mapsLink} onChange={(e) => { setMapsLink(e.target.value); clear("location"); }} />
        </Field>
      </Section>

      <Section n={3} title="Who can join & how it looks">
        <div>
          <span className="block text-[13px] font-semibold text-white/80 mb-1.5">Participation</span>
          <div role="radiogroup" aria-label="Participation" className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#181818] border border-white/10">
            {(["INDIVIDUAL", "TEAM"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={eventType === t}
                onClick={() => { setEventType(t); clear("team"); }}
                className={`py-2.5 rounded-lg text-[13.5px] font-semibold transition cursor-pointer ${eventType === t ? "bg-[var(--color-lime)] text-white" : "text-white/60 hover:text-white"}`}
              >
                {t === "INDIVIDUAL" ? "Individuals" : "Teams"}
              </button>
            ))}
          </div>
        </div>
        {eventType === "TEAM" && (
          <div className="grid grid-cols-2 gap-5">
            <Field id="ev-tmin" label="Min team size" error={errors.team}>
              <input id="ev-tmin" type="number" min={1} inputMode="numeric" className={input} value={teamMin} onChange={(e) => { setTeamMin(e.target.value); clear("team"); }} />
            </Field>
            <Field id="ev-tmax" label="Max team size">
              <input id="ev-tmax" type="number" min={1} inputMode="numeric" className={input} value={teamMax} onChange={(e) => { setTeamMax(e.target.value); clear("team"); }} />
            </Field>
          </div>
        )}

        <div>
          <span className="block text-[13px] font-semibold text-white/80 mb-1.5">
            Banner image <span className="text-white/40 font-normal">(optional, recommended)</span>
          </span>
          {banner ? (
            <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-[21/9] bg-[#181818]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={banner} alt="Banner preview" className="w-full h-full object-cover" onError={() => setErrors((e) => ({ ...e, banner: "We couldn't load that image." }))} />
              <button type="button" onClick={() => setBanner("")} aria-label="Remove banner" className="absolute top-2 right-2 p-2 rounded-lg bg-black/70 text-white hover:bg-black cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed border-white/15 hover:border-[var(--color-lime)] py-8 flex flex-col items-center gap-2 text-white/60 hover:text-white transition cursor-pointer disabled:opacity-60"
            >
              {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImagePlus className="w-6 h-6" />}
              <span className="text-[13.5px] font-semibold">{uploading ? "Uploading…" : "Upload a banner image"}</span>
              <span className="text-[12px] text-white/40">JPG, PNG or WebP · up to 5 MB</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Upload banner image" onChange={(e) => onFile(e.target.files?.[0])} />
          {errors.banner && (
            <p role="alert" className="text-[12px] text-red-400 mt-1.5">
              {errors.banner}
            </p>
          )}
          {!banner && (
            <details className="mt-2 text-[12.5px] text-white/50">
              <summary className="cursor-pointer hover:text-white/80">Or paste an image link</summary>
              <input aria-label="Banner image link" className={`${input} mt-2`} placeholder="https://…/banner.jpg" onBlur={(e) => { const v = e.target.value.trim(); if (v) { setBanner(v); clear("banner"); } }} />
            </details>
          )}
        </div>
        <p className="text-[12.5px] text-white/40">Registration is free for now. Paid tickets are coming soon.</p>
      </Section>

      <div className="space-y-3">
        <h2 className="text-[13px] font-bold uppercase tracking-wider text-white/40 pt-2">More details · optional</h2>

        <Extra title="Schedule" hint="End time and when registration closes" defaultOpen={!!(end || closes) || !!errors.end || !!errors.closes}>
          <div className="grid gap-5">
            <Field id="ev-end" label="Ends at" error={errors.end}>
              <DateTimePicker id="ev-end" clearable defaultTime="18:00" value={end} onChange={(v) => { setEnd(v); clear("end"); }} />
            </Field>
            <Field id="ev-closes" label="Registration closes" hint="Leave empty to keep it open until the event starts." error={errors.closes}>
              <DateTimePicker id="ev-closes" clearable defaultTime="23:30" value={closes} onChange={(v) => { setCloses(v); clear("closes"); }} />
            </Field>
          </div>
        </Extra>

        <Extra title="Rules & eligibility" hint="Who can take part, rules, how it's judged" defaultOpen={hasRules}>
          <Field id="ev-elig" label="Who can take part?">
            <textarea id="ev-elig" rows={2} className={input} placeholder="e.g. Open to all college students with a valid ID." value={eligibility} onChange={(e) => setEligibility(e.target.value)} />
          </Field>
          <Field id="ev-rules" label="Rules & instructions">
            <textarea id="ev-rules" rows={3} className={input} placeholder="e.g. 5 minutes per performance. Bring your own instruments." value={rulesText} onChange={(e) => setRulesText(e.target.value)} />
          </Field>
          <Field id="ev-judge" label="Judging criteria">
            <textarea id="ev-judge" rows={2} className={input} placeholder="e.g. Creativity 40%, execution 40%, presentation 20%." value={judging} onChange={(e) => setJudging(e.target.value)} />
          </Field>
        </Extra>

        <Extra title="Prizes" hint="Cash prizes, trophies or goodies" defaultOpen={prizes.some((p) => p.cashPrize || p.goodies)}>
          {prizes.map((p, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1.4fr_1fr_1.2fr_auto] gap-2 items-start">
              <input aria-label={`Prize ${i + 1} title`} className={`${input} col-span-2 sm:col-span-1`} placeholder="e.g. 1st Prize" value={p.title} onChange={(e) => setPrizes(prizes.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
              <input aria-label={`Prize ${i + 1} cash amount in rupees`} type="number" min={0} inputMode="numeric" className={input} placeholder="₹ amount" value={p.cashPrize ?? ""} onChange={(e) => setPrizes(prizes.map((x, j) => (j === i ? { ...x, cashPrize: e.target.value ? Number(e.target.value) : undefined } : x)))} />
              <input aria-label={`Prize ${i + 1} goodies`} className={`${input} hidden sm:block`} placeholder="Goodies (optional)" value={p.goodies ?? ""} onChange={(e) => setPrizes(prizes.map((x, j) => (j === i ? { ...x, goodies: e.target.value } : x)))} />
              <button type="button" aria-label={`Remove prize ${i + 1}`} className={delBtn} onClick={() => setPrizes(prizes.filter((_, j) => j !== i))}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button type="button" className={addBtn} onClick={() => setPrizes([...prizes, { title: "" }])}>
            <Plus className="w-4 h-4" /> Add more prizes
          </button>
        </Extra>

        <Extra title="FAQs" hint="Answer common questions before students ask" defaultOpen={faqs.length > 0}>
          {faqs.map((f, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 space-y-2">
                <input aria-label={`Question ${i + 1}`} className={input} placeholder="Question" value={f.question} onChange={(e) => setFaqs(faqs.map((x, j) => (j === i ? { ...x, question: e.target.value } : x)))} />
                <textarea aria-label={`Answer ${i + 1}`} rows={2} className={input} placeholder="Answer" value={f.answer} onChange={(e) => setFaqs(faqs.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x)))} />
              </div>
              <button type="button" aria-label={`Remove question ${i + 1}`} className={delBtn} onClick={() => setFaqs(faqs.filter((_, j) => j !== i))}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button type="button" className={addBtn} onClick={() => setFaqs([...faqs, { question: "", answer: "" }])}>
            <Plus className="w-4 h-4" /> Add question
          </button>
        </Extra>

        <Extra title="Contact person" hint="Who students can reach with questions" defaultOpen={!!(contactName || contactEmail || contactPhone)}>
          <div className="grid sm:grid-cols-3 gap-5">
            <Field id="ev-cname" label="Name">
              <input id="ev-cname" className={input} value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </Field>
            <Field id="ev-cemail" label="Email">
              <input id="ev-cemail" type="email" className={input} value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </Field>
            <Field id="ev-cphone" label="Phone">
              <input id="ev-cphone" type="tel" className={input} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </Field>
          </div>
        </Extra>

        <Extra title="Extra registration questions" hint="Ask students anything beyond name, email, phone and college" defaultOpen={questions.length > 0}>
          <RegistrationFormBuilder fields={questions} onChange={setQuestions} />
        </Extra>
      </div>

      <div className="sticky bottom-0 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 bg-[#0A0A0A]/95 backdrop-blur border-t border-white/10 flex gap-3 sm:justify-end">
        {editing && (
          <button type="button" disabled={busy} onClick={() => router.push("/admin/events")} className="px-5 py-3.5 rounded-xl text-white/60 hover:text-white font-semibold text-[14px] cursor-pointer disabled:opacity-60">
            Cancel
          </button>
        )}
        {isDraft ? (
          <>
            <button type="button" disabled={busy} onClick={() => submit("DRAFT")} className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl border border-white/15 text-white font-semibold text-[14px] hover:bg-white/5 disabled:opacity-60 cursor-pointer">
              {saving === "DRAFT" ? "Saving…" : "Save draft"}
            </button>
            <button type="submit" disabled={busy} className="flex-[2] sm:flex-none px-8 py-3.5 rounded-xl bg-[var(--color-lime)] text-white font-bold text-[14px] hover:opacity-90 disabled:opacity-60 cursor-pointer inline-flex items-center justify-center gap-2">
              {saving === "PUBLISHED" && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving === "PUBLISHED" ? "Publishing…" : "Publish event"}
            </button>
          </>
        ) : (
          <button type="submit" disabled={busy} className="flex-[2] sm:flex-none px-8 py-3.5 rounded-xl bg-[var(--color-lime)] text-white font-bold text-[14px] hover:opacity-90 disabled:opacity-60 cursor-pointer inline-flex items-center justify-center gap-2">
            {saving === "KEEP" && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving === "KEEP" ? "Saving…" : "Save changes"}
          </button>
        )}
      </div>
    </form>
  );
}
