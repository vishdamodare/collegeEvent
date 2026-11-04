"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarClock, ImagePlus, Loader2, MapPin, SlidersHorizontal, Users, X, Zap } from "lucide-react";
import { createEvent } from "@/actions/admin";
import { isImageUrl } from "@/utils/imageUrl";

type Category = { id: string; name: string };
type Errors = Partial<Record<"title" | "categoryId" | "description" | "date" | "location" | "capacity" | "team" | "banner", string>>;

const input =
  "w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/10 text-white text-[14px] placeholder:text-white/30 outline-none focus:border-[var(--color-lime)] focus:ring-2 focus:ring-[var(--color-lime)]/30 transition";

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

/** Quick <-> Advanced switch shown on both create screens so organizers always know the other option exists. */
export function CreateModeSwitch({ active }: { active: "quick" | "advanced" }) {
  const tab = (on: boolean) =>
    `inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold transition ${
      on ? "bg-[var(--color-lime)] text-white" : "text-white/60 hover:text-white hover:bg-white/5"
    }`;
  return (
    <nav aria-label="Event setup mode" className="inline-grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#181818] border border-white/10">
      <Link href="/admin/events/create" aria-current={active === "quick" ? "page" : undefined} className={tab(active === "quick")}>
        <Zap className="w-4 h-4" /> Quick setup
      </Link>
      <Link href="/admin/events/create?mode=advanced" aria-current={active === "advanced" ? "page" : undefined} className={tab(active === "advanced")}>
        <SlidersHorizontal className="w-4 h-4" /> Advanced setup
      </Link>
    </nav>
  );
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

export function QuickEventForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("100");
  const [eventType, setEventType] = useState<"INDIVIDUAL" | "TEAM">("INDIVIDUAL");
  const [teamMin, setTeamMin] = useState("2");
  const [teamMax, setTeamMax] = useState("4");
  const [banner, setBanner] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState<"" | "DRAFT" | "PUBLISHED">("");
  const [errors, setErrors] = useState<Errors>({});

  const clear = (k: keyof Errors) => setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));

  const validate = (): Errors => {
    const e: Errors = {};
    if (title.trim().length < 3) e.title = "Give your event a name (at least 3 characters).";
    if (!categoryId) e.categoryId = "Pick a category.";
    if (description.trim().length < 10) e.description = "Add a short description (at least 10 characters).";
    if (!date) e.date = "Choose a date and start time.";
    else if (new Date(date).getTime() < Date.now()) e.date = "The start time must be in the future.";
    if (location.trim().length < 3) e.location = "Where is it happening?";
    if (!(Number(capacity) >= 1)) e.capacity = "Enter how many people can attend.";
    if (eventType === "TEAM" && !(Number(teamMin) >= 1 && Number(teamMax) >= Number(teamMin))) e.team = "Max team size must be at least the minimum.";
    if (banner && !isImageUrl(banner)) e.banner = "That doesn't look like a direct image link (https…jpg/png/webp).";
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

  const submit = async (status: "DRAFT" | "PUBLISHED") => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Please fix the highlighted fields.");
      setTimeout(() => document.querySelector('[role="alert"]')?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      return;
    }
    setSaving(status);
    try {
      const res = await createEvent({
        title: title.trim(),
        description: description.trim(),
        categoryId,
        // datetime-local is the organizer's local time; send an absolute instant so the server (UTC) doesn't shift it
        date: new Date(date),
        location: location.trim(),
        capacity: Number(capacity),
        status,
        imageUrl: banner || "",
        eventType,
        ...(eventType === "TEAM" ? { teamMinSize: Number(teamMin), teamMaxSize: Number(teamMax) } : {}),
      });
      if ("error" in res && res.error) {
        toast.error(res.error);
        setSaving("");
        return;
      }
      toast.success(status === "PUBLISHED" ? "Your event is live! 🎉" : "Draft saved. Publish it whenever you're ready.");
      router.push("/admin/events");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSaving("");
    }
  };

  const busy = uploading || saving !== "";

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit("PUBLISHED");
      }}
      className="max-w-3xl mx-auto space-y-6 font-archivo"
    >
      <header>
        <div className="mb-5">
          <CreateModeSwitch active="quick" />
        </div>
        <h1 className="text-[34px] sm:text-[40px] font-anton uppercase tracking-wide text-white leading-none">Create an event</h1>
        <p className="text-[14px] text-white/50 mt-2">Takes about 2 minutes. You can add tickets, sponsors and more any time later.</p>
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
          </select>
        </Field>
        <Field id="ev-desc" label="What's it about?" hint="Tell students what to expect, who it's for and what they'll get out of it." error={errors.description}>
          <textarea id="ev-desc" rows={4} className={input} value={description} maxLength={5000} onChange={(e) => { setDescription(e.target.value); clear("description"); }} />
        </Field>
      </Section>

      <Section n={2} title="When & where">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field id="ev-date" label="Date & start time" error={errors.date}>
            <div className="relative">
              <CalendarClock className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input id="ev-date" type="datetime-local" className={`${input} pl-10`} value={date} onChange={(e) => { setDate(e.target.value); clear("date"); }} />
            </div>
          </Field>
          <Field id="ev-cap" label="How many people can attend?" error={errors.capacity}>
            <div className="relative">
              <Users className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input id="ev-cap" type="number" min={1} inputMode="numeric" className={`${input} pl-10`} value={capacity} onChange={(e) => { setCapacity(e.target.value); clear("capacity"); }} />
            </div>
          </Field>
        </div>
        <Field id="ev-loc" label="Venue" error={errors.location}>
          <div className="relative">
            <MapPin className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input id="ev-loc" className={`${input} pl-10`} placeholder="e.g. Main Auditorium, IIT Bombay" value={location} onChange={(e) => { setLocation(e.target.value); clear("location"); }} />
          </div>
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

      <Link
        href="/admin/events/create?mode=advanced"
        className="flex items-center gap-4 rounded-2xl border border-white/10 hover:border-[var(--color-lime)] bg-[#121212]/60 hover:bg-white/[0.03] p-4 sm:p-5 transition group"
      >
        <span className="w-11 h-11 shrink-0 rounded-xl bg-[var(--color-lime)]/15 text-[var(--color-lime)] flex items-center justify-center">
          <SlidersHorizontal className="w-5 h-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-[14.5px] font-bold text-white">Need more control? Use Advanced setup</span>
          <span className="block text-[12.5px] text-white/50 mt-0.5">Tickets &amp; coupons, sponsors, schedule, registration questions, certificates and more.</span>
        </span>
        <span aria-hidden className="ml-auto text-white/40 group-hover:text-white text-[20px]">→</span>
      </Link>

      <div className="sticky bottom-0 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 bg-[#0A0A0A]/95 backdrop-blur border-t border-white/10 flex gap-3 sm:justify-end">
        <button type="button" disabled={busy} onClick={() => submit("DRAFT")} className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl border border-white/15 text-white font-semibold text-[14px] hover:bg-white/5 disabled:opacity-60 cursor-pointer">
          {saving === "DRAFT" ? "Saving…" : "Save draft"}
        </button>
        <button type="submit" disabled={busy} className="flex-[2] sm:flex-none px-8 py-3.5 rounded-xl bg-[var(--color-lime)] text-white font-bold text-[14px] hover:opacity-90 disabled:opacity-60 cursor-pointer inline-flex items-center justify-center gap-2">
          {saving === "PUBLISHED" && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving === "PUBLISHED" ? "Publishing…" : "Publish event"}
        </button>
      </div>
    </form>
  );
}
