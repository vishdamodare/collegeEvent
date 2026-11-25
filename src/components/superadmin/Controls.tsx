"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { deleteEventAsSuperAdmin, deleteInquiryAsSuperAdmin, setEventStatus, setInquiryStatus, setOrganizerStatus } from "@/actions/superadmin";

/* ───────── Navigation ───────── */

const TABS = [
  { href: "/superadmin", label: "Overview", exact: true },
  { href: "/superadmin/organizers", label: "Organizers" },
  { href: "/superadmin/events", label: "Events" },
  { href: "/superadmin/users", label: "Users" },
  { href: "/superadmin/inquiries", label: "Inquiries" },
];

export function SuperNav({ pending, newInquiries = 0 }: { pending: number; newInquiries?: number }) {
  const pathname = usePathname();
  return (
    <header className="border-b border-white/10 bg-[#0A0A0A]/95 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center gap-x-6 gap-y-2 py-3">
        <Link href="/superadmin" className="font-anton text-[20px] tracking-wide uppercase text-white">
          College<span className="text-[#FF4B50]">Events</span> <span className="text-white/40 text-[13px] font-archivo normal-case tracking-normal ml-1">Super Admin</span>
        </Link>
        <nav aria-label="Super admin" className="flex gap-1 overflow-x-auto order-3 sm:order-none w-full sm:w-auto">
          {TABS.map((t) => {
            const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
            const count = t.label === "Organizers" ? pending : t.label === "Inquiries" ? newInquiries : 0;
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`px-3.5 py-2 rounded-lg text-[13.5px] font-semibold whitespace-nowrap flex items-center gap-2 transition ${
                  active ? "bg-[var(--color-lime)] text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {t.label}
                {count > 0 && (
                  <span className="min-w-5 h-5 px-1.5 rounded-full bg-amber-400 text-black text-[11px] font-bold flex items-center justify-center">{count}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2 text-[13px]">
          <Link href="/admin" className="px-3 py-2 rounded-lg border border-white/15 text-white/80 hover:text-white hover:bg-white/5">
            Organizer console
          </Link>
          <button
            onClick={async () => {
              await authClient.signOut();
              window.location.replace("/login"); // hard nav: router.push keeps cached protected pages after logout
            }}
            className="px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 cursor-pointer"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}

/* ───────── Badges ───────── */

const BADGE: Record<string, string> = {
  APPROVED: "bg-green-500/10 text-green-400 border-green-500/25",
  PUBLISHED: "bg-green-500/10 text-green-400 border-green-500/25",
  PENDING: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  DRAFT: "bg-white/5 text-white/60 border-white/15",
  REJECTED: "bg-red-500/10 text-red-400 border-red-500/25",
  BLOCKED: "bg-red-500/10 text-red-400 border-red-500/25",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/25",
  ARCHIVED: "bg-white/5 text-white/50 border-white/15",
  COMPLETED: "bg-blue-500/10 text-blue-300 border-blue-500/25",
  SUPER_ADMIN: "bg-[var(--color-lime)]/15 text-[#FF8A8E] border-[var(--color-lime)]/30",
  ORGANIZER: "bg-blue-500/10 text-blue-300 border-blue-500/25",
  STUDENT: "bg-white/5 text-white/60 border-white/15",
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

const btn = "px-3.5 py-2 rounded-lg text-[12.5px] font-bold transition disabled:opacity-50 cursor-pointer";

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
        <button disabled={pending} onClick={() => set("REJECTED", `${name} rejected`)} className={`${btn} border border-white/15 text-white hover:bg-white/5`}>
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
      <Link href={`/events/${slug}`} target="_blank" className={`${btn} border border-white/15 text-white hover:bg-white/5`}>
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
      <a href={mailto} className={`${btn} border border-white/15 text-white hover:bg-white/5`}>
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
        <button disabled={pending} onClick={() => set("READ", "Inquiry reopened")} className={`${btn} border border-white/15 text-white hover:bg-white/5`}>
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
