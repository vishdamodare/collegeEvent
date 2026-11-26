"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { Event } from "@/types";
import { TicketWelcome } from "./TicketWelcome";

interface HeroSectionProps {
  events: Event[];
  campuses: string[];
  /** QR code image (data URL) shown on the phone's ticket */
  qr: string;
  onOpenDetails: (eventId: string) => void;
  onOpenRegister: (eventId: string) => void;
}

const HEADLINE = ["Find the fest.", "Register in a minute.", "Walk in with a QR."];

// Event.date arrives as "Dec 15" (or "Dec 15–17")
function splitDate(date: string) {
  const [month = "", day = ""] = date.split(" ");
  return { month, day };
}

function joinNames(names: string[]) {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function HeroSection({ events, campuses, qr, onOpenDetails, onOpenRegister }: HeroSectionProps) {
  const event = events[0];
  const reduce = useReducedMotion();

  // The phone leans slightly toward the cursor (desktop only; springs keep it calm)
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-9, 9]), { stiffness: 110, damping: 16 });
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), { stiffness: 110, damping: 16 });

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onPointerLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <section
      id="home"
      className="relative isolate overflow-hidden pt-[92px] sm:pt-[120px] pb-8 sm:pb-12"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {/* Backdrop: faint grid fading out, with one soft glow behind the phone */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-60 [background-image:linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_70%_60%_at_72%_35%,#000_0%,transparent_75%)]"
      />
      <div
        aria-hidden
        className="absolute -z-10 -top-24 right-[-12%] w-[760px] h-[760px] rounded-full blur-[110px] opacity-50"
        style={{ background: "radial-gradient(circle at 35% 35%, rgba(29,78,216,.6), rgba(220,34,41,.3) 55%, transparent 72%)" }}
      />

      <div className="max-w-[1360px] mx-auto px-5 sm:px-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-14 lg:gap-8 items-center">
        {/* What we do, in one read */}
        <div>
          <h1 className="text-[clamp(30px,8.2vw,44px)] lg:text-[clamp(44px,4.5vw,68px)] font-bold leading-[1.05] tracking-[-0.03em] lg:whitespace-nowrap">
            {HEADLINE.map((line, i) => (
              <span key={line} className="line-mask">
                <span className={i === 2 ? "text-[var(--color-lime)]" : undefined} style={{ ["--d" as string]: `${0.1 + i * 0.14}s` }}>
                  {line}
                </span>
              </span>
            ))}
          </h1>
          <p
            className="rise-in mt-6 text-[18px] sm:text-[20px] leading-[1.6] text-[var(--color-text-muted)] max-w-[52ch]"
            style={{ ["--d" as string]: "0.55s" }}
          >
            One place for inter-college fests{campuses.length > 0 ? ` at ${joinNames(campuses)}` : " across Mumbai"}.
            <span className="hidden sm:inline"> Pick an event, register with Google, and your QR ticket is waiting in your account.</span>
          </p>
          <div className="rise-in mt-7 sm:mt-9 flex flex-wrap gap-3" style={{ ["--d" as string]: "0.7s" }}>
            <Link href="/events" className="btn btn-primary !px-7 !py-4 !text-[16px]">
              Browse events
            </Link>
            <Link href="/organizer" className="btn btn-glass !px-7 !py-4 !text-[16px]">
              List your fest
            </Link>
          </div>
        </div>

        {/* The product: a phone holding a ticket, with the registration and check-in moments beside it */}
        {event && (
          <div className="relative mx-auto w-full max-w-[420px] lg:max-w-none flex justify-center pt-2 pb-8 sm:py-6 [perspective:1100px]">
            <motion.div style={{ rotateX, rotateY, rotate: 2.5 }} className="relative">
              <div className="stub-in">
                <div className="sway-touch">
                <div className="float-slow">
                  <div className="relative w-[294px] sm:w-[314px] rounded-[50px] p-[2.5px] bg-gradient-to-b from-[#555B70] via-[#252A3A] to-[#121520] shadow-[0_45px_95px_-28px_rgba(0,0,0,.85),inset_0_1px_1px_rgba(255,255,255,.42),inset_0_-1px_1px_rgba(255,255,255,.1)]">
                    {/* Hardware side buttons */}
                    <span aria-hidden className="absolute -left-[3px] top-[88px] w-[3px] h-[20px] rounded-l-[2px] bg-gradient-to-b from-[#6B728A] via-[#3A4054] to-[#1F2331] shadow-[-1px_0_2px_rgba(0,0,0,.5)]" />
                    <span aria-hidden className="absolute -left-[3px] top-[124px] w-[3px] h-[38px] rounded-l-[2px] bg-gradient-to-b from-[#6B728A] via-[#3A4054] to-[#1F2331] shadow-[-1px_0_2px_rgba(0,0,0,.5)]" />
                    <span aria-hidden className="absolute -left-[3px] top-[172px] w-[3px] h-[38px] rounded-l-[2px] bg-gradient-to-b from-[#6B728A] via-[#3A4054] to-[#1F2331] shadow-[-1px_0_2px_rgba(0,0,0,.5)]" />
                    <span aria-hidden className="absolute -right-[3px] top-[138px] w-[3px] h-[56px] rounded-r-[2px] bg-gradient-to-b from-[#6B728A] via-[#3A4054] to-[#1F2331] shadow-[1px_0_2px_rgba(0,0,0,.5)]" />

                    {/* Antenna bands on titanium frame */}
                    <span aria-hidden className="absolute top-[52px] left-0 w-[2.5px] h-[5px] bg-black/50" />
                    <span aria-hidden className="absolute top-[52px] right-0 w-[2.5px] h-[5px] bg-black/50" />
                    <span aria-hidden className="absolute bottom-[52px] left-0 w-[2.5px] h-[5px] bg-black/50" />
                    <span aria-hidden className="absolute bottom-[52px] right-0 w-[2.5px] h-[5px] bg-black/50" />

                    {/* Ceramic Shield black glass bezel */}
                    <div className="rounded-[47.5px] bg-[#07080D] p-[8.5px] ring-1 ring-black/90">
                      <div className="relative rounded-[39px] bg-[#F5F7FC] text-[#0A1024] overflow-hidden ring-1 ring-white/[0.08]">
                        {/* Subtle screen glass sheen */}
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-50"
                        />

                        {/* iOS status bar + Dynamic Island */}
                        <div className="relative z-20 px-5 pt-2.5 pb-1 flex items-center justify-between select-none" aria-hidden>
                          <span className="w-[42px] text-[11px] font-semibold tracking-[-0.02em] text-[#0A1024] tabular-nums">
                            9:41
                          </span>

                          <div className="w-[86px] h-[23px] rounded-full bg-[#05060A] shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)] flex items-center justify-end pr-[7px]">
                            <span className="w-[9px] h-[9px] rounded-full bg-[#0B0F1E] ring-1 ring-[#1D2540] flex items-center justify-center">
                              <span
                                className="w-[4px] h-[4px] rounded-full"
                                style={{ background: "radial-gradient(circle at 35% 35%, #5B8CFF 0%, #16285A 60%, #05070E 100%)" }}
                              />
                            </span>
                          </div>

                          <div className="w-[46px] flex items-center justify-end gap-[4px] text-[#0A1024]">
                            {/* Cellular signal */}
                            <svg className="w-[13px] h-[9px]" viewBox="0 0 16 11" fill="currentColor">
                              <rect x="0.5" y="7" width="2.4" height="3.5" rx="0.8" />
                              <rect x="4.5" y="5" width="2.4" height="5.5" rx="0.8" />
                              <rect x="8.5" y="2.8" width="2.4" height="7.7" rx="0.8" />
                              <rect x="12.5" y="0.5" width="2.4" height="10" rx="0.8" />
                            </svg>
                            {/* Wi-Fi */}
                            <svg className="w-[12px] h-[9px]" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                              <path d="M1.5 4.2a9.8 9.8 0 0 1 13 0" />
                              <path d="M4.2 7a6 6 0 0 1 7.6 0" />
                              <circle cx="8" cy="10" r="1.1" fill="currentColor" stroke="none" />
                            </svg>
                            {/* Battery */}
                            <svg className="w-[20px] h-[10px]" viewBox="0 0 25 12" fill="none">
                              <rect x="0.75" y="1" width="20.5" height="10" rx="2.8" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.2" />
                              <rect x="2.2" y="2.5" width="15.5" height="7" rx="1.6" fill="currentColor" />
                              <path d="M22.5 4.2v3.6a1.4 1.4 0 0 0 0-3.6z" fill="currentColor" fillOpacity="0.45" />
                            </svg>
                          </div>
                        </div>

                        <div className="px-4 pt-2 pb-1 text-[12px] font-semibold text-[#5A6382]">Your ticket</div>

                        <div className="px-3">
                          <div className="relative h-[126px] rounded-2xl overflow-hidden bg-[#DDE2F0]">
                            {event.img ? <Image src={event.img} alt="" fill priority sizes="314px" className="object-cover" aria-hidden /> : <TicketWelcome />}
                          </div>
                        </div>

                        <div className="px-4 pt-3 flex gap-3">
                          <div className="shrink-0 w-[46px] rounded-lg bg-[var(--color-marigold)] text-[#0B0B08] py-1.5 text-center leading-none">
                            <div className="text-[11px] font-bold">{splitDate(event.date).month}</div>
                            <div className="mt-0.5 font-anton text-[22px]">{splitDate(event.date).day}</div>
                          </div>
                          <div className="min-w-0">
                            <div className="text-[15px] font-bold leading-tight line-clamp-2">{event.title}</div>
                            <div className="mt-1 text-[12px] text-[#5A6382] line-clamp-1">
                              {event.venue}, {event.college}
                            </div>
                          </div>
                        </div>

                        {/* Perforation */}
                        <div className="relative mt-4 h-0" aria-hidden>
                          <div className="absolute left-4 right-4 border-t-2 border-dashed border-[#0A1024]/20" />
                          <span className="absolute -left-2.5 -top-2.5 w-5 h-5 rounded-full bg-[#07080D]" />
                          <span className="absolute -right-2.5 -top-2.5 w-5 h-5 rounded-full bg-[#07080D]" />
                        </div>

                        <div className="px-4 pt-5 pb-3 flex flex-col items-center">
                          <div className="relative w-[164px] h-[164px]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={qr} alt="Example QR code" width={164} height={164} className="w-[164px] h-[164px]" />
                            <span
                              aria-hidden
                              className="qr-scan absolute -left-2 -right-2 h-[3px] rounded-full bg-[var(--color-lime)] shadow-[0_0_16px_2px_var(--color-lime)] opacity-0"
                            />
                          </div>
                          <div className="mt-2 text-[12px] text-[#5A6382]">Show this at the gate</div>
                        </div>

                        {/* iOS Home Indicator */}
                        <div className="pb-2 pt-0.5 flex justify-center" aria-hidden>
                          <span className="w-[104px] h-[4px] rounded-full bg-[#0A1024]/75" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>

              {/* The outcome of registering */}
              <div className="float-slow absolute left-2 sm:left-0 -bottom-5 lg:-bottom-0 lg:-left-[205px] lg:bottom-4" style={{ ["--fd" as string]: "-2s" }}>
                <button
                  type="button"
                  onClick={() => onOpenRegister(event.id)}
                  className="chip-in flex items-center gap-3 rounded-2xl bg-[var(--color-ticket)] text-[var(--color-ticket-ink)] pl-3 pr-4 py-3 text-left shadow-[0_18px_40px_-16px_rgba(0,0,0,.7)] border border-[var(--color-border)] hover:-translate-y-0.5 transition-transform cursor-pointer"
                  style={{ animationDelay: "0.9s" }}
                >
                  <span className="grid place-items-center w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-[14px] font-bold leading-tight">You&apos;re registered</span>
                    <span className="block text-[12px] text-[var(--color-ticket-muted)]">Ticket saved to your account</span>
                  </span>
                </button>
              </div>

              {/* Answers the scan line: appears once the first scan has landed, then pulses on every scan */}
              <div className="float-slow absolute right-0 sm:-right-2 lg:right-0 top-20" style={{ ["--fd" as string]: "-4s" }}>
                <button
                  type="button"
                  onClick={() => onOpenDetails(event.id)}
                  className="chip-in flex items-center gap-3 rounded-2xl bg-[var(--color-ticket)] text-[var(--color-ticket-ink)] pl-3 pr-4 py-3 text-left shadow-[0_18px_40px_-16px_rgba(0,0,0,.7)] border border-[var(--color-border)] hover:-translate-y-0.5 transition-transform cursor-pointer"
                  style={{ animationDelay: "3.9s" }}
                >
                  <span className="check-pop grid place-items-center w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-[14px] font-bold leading-tight">Checked in</span>
                    <span className="block text-[12px] text-[var(--color-ticket-muted)]">Scanned at the gate</span>
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
