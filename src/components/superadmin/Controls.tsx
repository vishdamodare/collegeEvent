"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Building2, CalendarDays, ClipboardList, Inbox, LayoutDashboard, Moon, ShieldCheck, Sun, Users } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { registerCollege, deleteEventAsSuperAdmin, deleteInquiryAsSuperAdmin, setEventStatus, setInquiryStatus, setOrganizerStatus } from "@/actions/superadmin";

/**
 * Theme for the super admin area. The site-wide theme is pinned to dark (so a saved site theme can't leak in),
 * and the area's own light/dark choice lives on #sa-root as `.sa-light`, remembered in localStorage.
 * (No inline <script>: React warns on those in client renders. Light users see dark for a moment on first paint.)
 */
const SA_KEY = "sa-theme";
const root = () => document.getElementById("sa-root");

export function SuperTheme() {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    try {
      if (localStorage.getItem(SA_KEY) === "light") root()?.classList.add("sa-light");
    } catch {}
    window.dispatchEvent(new Event(SA_KEY));
  }, []);
  return null;
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const sync = () => setLight(!!root()?.classList.contains("sa-light"));
    sync();
    window.addEventListener(SA_KEY, sync);
    return () => window.removeEventListener(SA_KEY, sync);
  }, []);
  return (
    <button
      type="button"
      onClick={() => {
        const next = !root()?.classList.contains("sa-light");
        root()?.classList.toggle("sa-light", next);
        try {
          localStorage.setItem(SA_KEY, next ? "light" : "dark");
        } catch {}
        window.dispatchEvent(new Event(SA_KEY));
      }}
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      title={light ? "Switch to dark mode" : "Switch to light mode"}
      className={`grid place-items-center size-10 lg:size-9 rounded-lg border border-sa-fg/15 text-sa-fg/70 hover:text-sa-fg hover:bg-sa-fg/5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-lime)] ${className}`}
    >
      {light ? <Moon aria-hidden className="size-4" /> : <Sun aria-hidden className="size-4" />}
    </button>
  );
}

/* ───────── Navigation ───────── */

const TABS = [
  { href: "/superadmin", label: "Overview", exact: true, Icon: LayoutDashboard },
  { href: "/superadmin/colleges", label: "Colleges", Icon: Building2 },
  { href: "/superadmin/organizers", label: "Organizers", Icon: ShieldCheck },
  { href: "/superadmin/events", label: "Events", Icon: CalendarDays },
  { href: "/superadmin/participants", label: "Participants", Icon: ClipboardList },
  { href: "/superadmin/users", label: "Users", Icon: Users },
  { href: "/superadmin/inquiries", label: "Inquiries", Icon: Inbox },
];

export function SuperNav({ pending, newInquiries = 0, name }: { pending: number; newInquiries?: number; name: string }) {
  const pathname = usePathname();
  return (
    <aside className="lg:sticky lg:top-0 lg:h-screen lg:w-64 shrink-0 flex flex-col gap-3 lg:gap-6 border-b lg:border-b-0 lg:border-r border-sa-fg/10 bg-sa-side px-4 py-3 lg:px-4 lg:py-6">
      <div className="flex items-center justify-between gap-3 lg:px-3">
        <Link href="/superadmin" className="flex items-center gap-2.5 text-sa-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-lime)] rounded-lg">
          <Image src="/logo-mark.png" alt="" width={42} height={42} priority className="logo-mark sa-logo size-[42px] shrink-0" />
          <span className="flex flex-col justify-between h-[42px] font-anton text-[22px] tracking-wide uppercase leading-none">
            <span>College<span className="text-[#FF4B50]">Event</span></span>
            <span className="font-archivo normal-case tracking-normal text-[12px] leading-none text-sa-fg/45">Platform admin</span>
          </span>
        </Link>
        <ThemeToggle className="lg:hidden ml-auto" />
      </div>

      <nav aria-label="Super admin" className="flex lg:flex-col gap-1 overflow-x-auto -mx-1 px-1 lg:mx-0 lg:px-0">
        {TABS.map(({ href, label, exact, Icon }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          const count = label === "Organizers" ? pending : label === "Inquiries" ? newInquiries : 0;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-lime)] ${
                active ? "bg-sa-fg/[0.07] text-sa-fg" : "text-sa-fg/55 hover:text-sa-fg hover:bg-sa-fg/[0.04]"
              }`}
            >
              {active && <span aria-hidden className="hidden lg:block absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-[var(--color-lime)]" />}
              <Icon aria-hidden className={`size-[18px] ${active ? "text-[var(--color-lime)]" : ""}`} />
              {label}
              {count > 0 && (
                <span className="lg:ml-auto min-w-5 h-5 px-1.5 rounded-full bg-amber-400 text-black text-[11px] font-bold flex items-center justify-center">{count}</span>
              )}
            </Link>
          );
        })}
        {/* Desktop keeps these in the sidebar footer; on phones they trail the tab row */}
        <Link href="/admin" className="lg:hidden flex items-center px-3 py-2.5 rounded-xl text-[14px] font-semibold whitespace-nowrap text-sa-fg/55 hover:text-sa-fg">
          Organizer console
        </Link>
        <LogoutButton className="lg:hidden whitespace-nowrap py-2.5" />
      </nav>

      <div className="hidden lg:flex lg:mt-auto flex-col gap-1 border-t border-sa-fg/10 pt-4">
        <div className="flex items-center gap-3 px-3 pb-2">
          <Monogram name={name} size={36} />
          <p className="min-w-0 flex-1 text-[13.5px] font-semibold truncate">{name}</p>
          <ThemeToggle />
        </div>
        <Link href="/admin" className="px-3 py-2 rounded-lg text-[13.5px] text-sa-fg/70 hover:text-sa-fg hover:bg-sa-fg/5">
          Organizer console
        </Link>
        <LogoutButton />
      </div>
    </aside>
  );
}

function LogoutButton({ className = "" }: { className?: string }) {
  return (
    <button
      onClick={async () => {
        await authClient.signOut();
        window.location.replace("/login"); // hard nav: router.push keeps cached protected pages after logout
      }}
      className={`px-3 py-2 rounded-lg text-[13.5px] text-left text-red-400 hover:bg-red-500/10 cursor-pointer ${className}`}
    >
      Log out
    </button>
  );
}

/* ───────── Badges ───────── */

const BADGE: Record<string, string> = {
  APPROVED: "bg-green-500/10 text-green-400 border-green-500/25",
  PUBLISHED: "bg-green-500/10 text-green-400 border-green-500/25",
  PENDING: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  DRAFT: "bg-sa-fg/5 text-sa-fg/60 border-sa-fg/15",
  REJECTED: "bg-red-500/10 text-red-400 border-red-500/25",
  BLOCKED: "bg-red-500/10 text-red-400 border-red-500/25",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/25",
  ARCHIVED: "bg-sa-fg/5 text-sa-fg/50 border-sa-fg/15",
  COMPLETED: "bg-blue-500/10 text-blue-300 border-blue-500/25",
  SUPER_ADMIN: "bg-[var(--color-lime)]/15 text-[#FF8A8E] border-[var(--color-lime)]/30",
  ORGANIZER: "bg-blue-500/10 text-blue-300 border-blue-500/25",
  STUDENT: "bg-sa-fg/5 text-sa-fg/60 border-sa-fg/15",
  NEW: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  READ: "bg-blue-500/10 text-blue-300 border-blue-500/25",
  RESOLVED: "bg-green-500/10 text-green-400 border-green-500/25",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wide ${BADGE[value] ?? BADGE.DRAFT}`}>
      {value.replace("_", " ")}
    </span>
  );
}

/* ───────── Action buttons ───────── */

function useAct() {
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ error?: string; success?: boolean }>, okMsg: string) =>
    start(async () => {
      try {
        const res = await fn();
        if (res?.error) toast.error(res.error);
        else {
          toast.success(okMsg); // server action's revalidatePath already refreshes the page
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  return { pending, run };
}

const btn = "px-3.5 py-2.5 sm:py-2 rounded-lg text-[12.5px] font-bold transition disabled:opacity-50 cursor-pointer";

export function OrganizerActions({ userId, status, name }: { userId: string; status: string; name: string }) {
  const { pending, run } = useAct();
  const set = (s: string, msg: string) => run(() => setOrganizerStatus(userId, s), msg);
  return (
    <div className="flex flex-wrap gap-2">
      {status !== "APPROVED" && (
        <button disabled={pending} onClick={() => set("APPROVED", `${name} approved`)} className={`${btn} bg-green-600 text-white hover:bg-green-500`}>
          {status === "PENDING" ? "Approve" : "Reinstate"}
        </button>
      )}
      {status === "PENDING" && (
        <button disabled={pending} onClick={() => set("REJECTED", `${name} rejected`)} className={`${btn} border border-sa-fg/15 text-sa-fg hover:bg-sa-fg/5`}>
          Reject
        </button>
      )}
      {status === "APPROVED" && (
        <button
          disabled={pending}
          onClick={() => confirm(`Block ${name}? They will lose access to the organizer console.`) && set("BLOCKED", `${name} blocked`)}
          className={`${btn} border border-red-500/40 text-red-400 hover:bg-red-500/10`}
        >
          Block
        </button>
      )}
    </div>
  );
}

export function EventActions({ id, status, title, registrations, slug }: { id: string; status: string; title: string; registrations: number; slug: string }) {
  const { pending, run } = useAct();
  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/events/${slug}`} target="_blank" className={`${btn} border border-sa-fg/15 text-sa-fg hover:bg-sa-fg/5`}>
        View
      </Link>
      {status === "PUBLISHED" ? (
        <button
          disabled={pending}
          onClick={() => confirm(`Unpublish "${title}"? It disappears from the public site and the organizer is notified.`) && run(() => setEventStatus(id, "ARCHIVED"), "Event unpublished")}
          className={`${btn} border border-amber-400/40 text-amber-300 hover:bg-amber-400/10`}
        >
          Unpublish
        </button>
      ) : (
        <button disabled={pending} onClick={() => run(() => setEventStatus(id, "PUBLISHED"), "Event published")} className={`${btn} bg-green-600 text-white hover:bg-green-500`}>
          Publish
        </button>
      )}
      <button
        disabled={pending}
        onClick={() =>
          confirm(
            `PERMANENTLY delete "${title}"?\n\nThis also deletes its ${registrations} registration(s) and tickets. This cannot be undone.`
          ) && run(() => deleteEventAsSuperAdmin(id), "Event deleted")
        }
        className={`${btn} border border-red-500/40 text-red-400 hover:bg-red-500/10`}
      >
        Delete
      </button>
    </div>
  );
}

export function InquiryActions({ id, status, email, subject }: { id: string; status: string; email: string; subject: string }) {
  const { pending, run } = useAct();
  const set = (s: string, msg: string) => run(() => setInquiryStatus(id, s), msg);
  const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`Re: ${subject}`)}`;

  return (
    <div className="flex flex-wrap gap-2">
      <a href={mailto} className={`${btn} border border-sa-fg/15 text-sa-fg hover:bg-sa-fg/5`}>
        Reply
      </a>
      {status === "NEW" && (
        <button disabled={pending} onClick={() => set("READ", "Marked as read")} className={`${btn} border border-blue-500/40 text-blue-300 hover:bg-blue-500/10`}>
          Mark read
        </button>
      )}
      {status !== "RESOLVED" ? (
        <button disabled={pending} onClick={() => set("RESOLVED", "Inquiry marked resolved")} className={`${btn} bg-green-600 text-white hover:bg-green-500`}>
          Resolve
        </button>
      ) : (
        <button disabled={pending} onClick={() => set("READ", "Inquiry reopened")} className={`${btn} border border-sa-fg/15 text-sa-fg hover:bg-sa-fg/5`}>
          Reopen
        </button>
      )}
      <button
        disabled={pending}
        onClick={() => confirm("Delete this inquiry permanently?") && run(() => deleteInquiryAsSuperAdmin(id), "Inquiry deleted")}
        className={`${btn} border border-red-500/40 text-red-400 hover:bg-red-500/10`}
      >
        Delete
      </button>
    </div>
  );
}

export function RegisterCollegeForm() {
  const { pending, run } = useAct();
  return (
    <form
      className="flex flex-col sm:flex-row gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const name = new FormData(form).get("name") as string;
        run(async () => {
          const res = await registerCollege(name);
          if (res.success) form.reset();
          return res;
        }, "College registered");
      }}
    >
      <input
        name="name"
        required
        placeholder="Full college name, e.g. Atharva College of Engineering"
        aria-label="College name"
        className="flex-1 rounded-xl bg-sa-fg/5 border border-sa-fg/15 px-4 py-3 text-[14px] outline-none focus:border-[var(--color-lime)]"
      />
      <button disabled={pending} className={`${btn} bg-[var(--color-lime)] text-white py-3 px-5`}>
        {pending ? "Registering…" : "Register college"}
      </button>
    </form>
  );
}

/** Round badge with the first letters of a name; stands in for a logo. */
export function Monogram({ name, size = 44 }: { name: string; size?: number }) {
  const letters = name.split(/\s+/).filter((w) => /^[a-z]/i.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className="shrink-0 grid place-items-center rounded-full bg-[var(--color-lime)]/15 text-[#FF8A8E] border border-[var(--color-lime)]/30 font-anton tracking-wide"
    >
      {letters}
    </span>
  );
}
