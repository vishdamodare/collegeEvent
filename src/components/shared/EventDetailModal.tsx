"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Event, CollegeInfo } from "@/types";
import { cn } from "@/utils/cn";

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  collegeInfo?: CollegeInfo;
  onRegister: () => void;
}

export function EventDetailModal({ isOpen, onClose, event, collegeInfo, onRegister }: EventDetailModalProps) {
  // Remember which logo URL failed, so a different college's logo still gets a chance
  const [failedLogo, setFailedLogo] = useState<string | null>(null);

  // Lock page scroll and close on Esc while open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!event) return null;

  const register = () => {
    onClose();
    setTimeout(onRegister, 400);
  };

  const share = async () => {
    const url = event.slug ? `${window.location.origin}/events/${event.slug}` : window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: event.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      // User dismissed the share sheet — nothing to do
    }
  };

  const details = [
    { label: "Date", value: event.date },
    { label: "Venue", value: event.venue },
    { label: "College", value: event.college },
    { label: "Expected", value: event.participants },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={event.title}
      className={cn(
        "fixed inset-0 z-[2000] bg-[var(--color-background)] text-[var(--color-text-main)] overflow-y-auto overscroll-contain transition-all duration-500 ease-[var(--ease-custom)]",
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      )}
    >
      {/* Top bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between gap-3 px-5 sm:px-10 py-3.5 sm:py-5 bg-[color-mix(in_srgb,var(--color-background)_88%,transparent)] backdrop-blur-md border-b border-[var(--color-border)]">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-sm font-semibold hover:bg-[var(--color-card-hover)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={share}
          aria-label="Share event"
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-sm font-semibold hover:bg-[var(--color-card-hover)] transition-colors"
        >
          <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      <div className="max-w-[1280px] mx-auto px-5 sm:px-10 pt-5 sm:pt-10 pb-10">
        {/* Event photo */}
        {event.img && (
          <div className="relative w-full aspect-[16/10] sm:aspect-[21/9] rounded-[22px] sm:rounded-[28px] overflow-hidden mb-6 sm:mb-10 border border-[var(--color-border)]">
            <Image src={event.img} alt={event.title} fill priority className="object-cover" sizes="(max-width: 1280px) 100vw, 1280px" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            {/* On a photo, so a fixed white-on-glass style rather than the theme's badge colors */}
            <span className="cat-badge absolute left-4 bottom-4 sm:left-6 sm:bottom-6 bg-black/45 text-white border border-white/20 backdrop-blur-md">{event.cat}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 lg:gap-20">
          {/* LEFT COLUMN: Main Content */}
          <div className="min-w-0">
            <div className="mb-10 sm:mb-12">
              <h1 className="text-[clamp(36px,6vw,84px)] font-anton leading-[0.95] tracking-tight uppercase mb-5">
                {event.title}
              </h1>

              <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
                <span className="meta-chip !text-[12.5px] !py-1.5 !px-3">🏫 <b>{event.college}</b></span>
                <span className="meta-chip !text-[12.5px] !py-1.5 !px-3">📅 <b>{event.date}</b></span>
                <span className="meta-chip !text-[12.5px] !py-1.5 !px-3">📍 <b>{event.venue}</b></span>
                <span className="meta-chip !text-[12.5px] !py-1.5 !px-3">👥 <b>{event.participants}</b></span>
              </div>

              <p className="text-[16px] sm:text-[17px] text-[var(--color-text-muted)] leading-[1.7] max-w-[700px]">
                {event.sub}
              </p>
            </div>

            {/* About the Host College */}
            {collegeInfo && (
              <section className="mb-12 sm:mb-16">
                <h3 className="font-anton text-[22px] sm:text-[24px] tracking-wide uppercase mb-5">About the host college</h3>

                <div className="p-5 sm:p-6 rounded-[22px] bg-[var(--color-card)] border border-[var(--color-border)] mb-4">
                  <div className="flex gap-4 items-center mb-4">
                    <div className="w-14 h-14 rounded-[14px] overflow-hidden bg-[var(--color-bg-elevated)] flex-none relative flex items-center justify-center font-anton text-[18px] text-[var(--color-lime)]">
                      {failedLogo === collegeInfo.img ? (
                        event.college.split(/\s+/).map((w) => w[0]).join("").slice(0, 3)
                      ) : (
                        <Image src={collegeInfo.img} alt="" fill className="object-cover" sizes="56px" onError={() => setFailedLogo(collegeInfo.img)} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[18px] font-bold font-archivo leading-tight">{event.college}</h4>
                      <div className="text-[13px] text-[var(--color-text-faint)] mt-1">
                        📍 {collegeInfo.loc} · Est. {collegeInfo.founded}
                      </div>
                    </div>
                  </div>

                  <p className="text-[14px] text-[var(--color-text-muted)] leading-[1.6] mb-4">
                    {collegeInfo.about}
                  </p>

                  <div className="flex gap-6 text-[13px] text-[var(--color-text-muted)]">
                    <div><b className="text-[var(--color-lime)] text-[15px]">{collegeInfo.students}</b> students</div>
                    <div><b className="text-[var(--color-lime)] text-[15px]">{collegeInfo.events}</b> events hosted</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
                  {collegeInfo.gallery.map((img, i) => (
                    <div key={i} className="aspect-square sm:aspect-auto sm:h-[140px] rounded-[14px] sm:rounded-[16px] overflow-hidden relative border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
                      <Image src={img} alt="" fill className="object-cover" sizes="(max-width: 768px) 33vw, 150px" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Past Events */}
            {collegeInfo && collegeInfo.past.length > 0 && (
              <section className="mb-12 sm:mb-16">
                <h3 className="font-anton text-[22px] sm:text-[24px] tracking-wide uppercase mb-5">Past events here</h3>
                <div className="flex flex-col gap-3">
                  {collegeInfo.past.map((past, i) => (
                    <div key={i} className="p-4 sm:p-5 rounded-[18px] bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-[12px] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center text-[20px] flex-none">
                          {past.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold font-archivo text-[15px] mb-0.5 truncate">{past.name}</div>
                          <div className="text-[12px] text-[var(--color-text-faint)] truncate">{past.type}</div>
                        </div>
                      </div>
                      <div className="text-[10.5px] font-bold text-[var(--color-lime)] tracking-wider flex-none">COMPLETED</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Event Timeline */}
            {event.timeline && event.timeline.length > 0 && (
              <section className="mb-12 sm:mb-16">
                <h3 className="font-anton text-[22px] sm:text-[24px] tracking-wide uppercase mb-6">Event timeline</h3>
                <div className="relative pl-[30px]">
                  <div className="absolute left-[5px] top-[10px] bottom-[10px] w-[2px] bg-[var(--color-border)]" />
                  {event.timeline.map((item, i) => (
                    <div key={i} className="relative pb-8 last:pb-0">
                      <div
                        className={cn(
                          "absolute left-[-30px] top-[4px] w-[12px] h-[12px] rounded-full",
                          i === 0
                            ? "bg-[var(--color-lime)] shadow-[0_0_0_4px_rgba(var(--lime-rgb),0.2)]"
                            : "bg-[var(--color-border-bright)]"
                        )}
                      />
                      <div className="text-[12.5px] text-[var(--color-text-faint)] mb-1">{item.subtitle}</div>
                      <div className="text-[16px] font-bold mb-1.5">{item.title}</div>
                      <div className="text-[13.5px] text-[var(--color-text-muted)] leading-[1.5] max-w-[500px]">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN: registration panel (desktop) */}
          <div className="relative hidden lg:block">
            <div className="sticky top-[110px] p-8 rounded-[24px] bg-[var(--color-card)] border border-[var(--color-border)] backdrop-blur-lg">
              {event.prize && (
                <>
                  <div className="text-[13px] text-[var(--color-text-faint)] mb-1">Prize</div>
                  <div className="text-[20px] font-bold mb-6">{event.prize}</div>
                </>
              )}
              <button className="btn btn-primary w-full mb-8" onClick={register}>
                Register for this event
              </button>
              <div className="flex flex-col text-[13px]">
                {details.map(({ label, value }, i) => (
                  <div
                    key={label}
                    className={cn(
                      "flex justify-between items-center gap-4 py-3",
                      i < details.length - 1 && "border-b border-[var(--color-border)]"
                    )}
                  >
                    <span className="text-[var(--color-text-faint)]">{label}</span>
                    <span className="font-semibold text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: register bar pinned to the bottom of the sheet */}
      <div className="lg:hidden sticky bottom-0 z-50 px-5 pt-3 pb-[max(14px,env(safe-area-inset-bottom))] bg-[color-mix(in_srgb,var(--color-background)_92%,transparent)] backdrop-blur-md border-t border-[var(--color-border)] flex items-center gap-4">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-[var(--color-text-faint)] font-semibold">{event.date}</div>
          <div className="text-[14px] font-bold truncate">{event.prize || event.venue}</div>
        </div>
        <button className="btn btn-primary ml-auto !py-3.5 !px-6 shrink-0" onClick={register}>
          Register
        </button>
      </div>
    </div>
  );
}
