"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { CheckCircle2, PartyPopper } from "lucide-react";
import { getCheckInStatus } from "@/actions/registrations";

interface CheckInWatcherProps {
  ticketId: string;
  eventTitle: string;
  initialCheckedIn: boolean;
  initialCheckedInAt?: Date | string | null;
}

// ponytail: 3s polling while the ticket page is open and visible; switch to SSE/realtime if traffic grows
const POLL_MS = 3000;

/**
 * Shows the attendee live feedback when an organizer scans their QR:
 * a full-screen "You're in!" celebration, then a persistent "Checked in" banner.
 */
export function CheckInWatcher({ ticketId, eventTitle, initialCheckedIn, initialCheckedInAt }: CheckInWatcherProps) {
  const [checkedInAt, setCheckedInAt] = useState<string | null>(
    initialCheckedIn ? (initialCheckedInAt ? new Date(initialCheckedInAt).toISOString() : new Date().toISOString()) : null
  );
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (checkedInAt) return;
    let stopped = false;
    let timer: number | undefined;

    const poll = async () => {
      if (stopped) return;
      if (document.visibilityState === "visible") {
        try {
          const res = await getCheckInStatus(ticketId);
          if (!stopped && res.checkedIn) {
            setCheckedInAt(res.checkedInAt ?? new Date().toISOString());
            setCelebrate(true);
            try { navigator.vibrate?.([120, 60, 120]); } catch {}
            return; // done: stop polling
          }
        } catch {
          // network blip: try again next tick
        }
      }
      timer = window.setTimeout(poll, POLL_MS);
    };

    timer = window.setTimeout(poll, POLL_MS);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [ticketId, checkedInAt]);

  // Auto-dismiss the celebration; the banner stays
  useEffect(() => {
    if (!celebrate) return;
    const t = setTimeout(() => setCelebrate(false), 6000);
    return () => clearTimeout(t);
  }, [celebrate]);

  return (
    <>
      {checkedInAt ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 no-print"
          role="status"
        >
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <p className="font-bold text-emerald-300 text-sm">You&apos;re checked in — head inside!</p>
            <p className="text-xs text-text-muted">Entry confirmed at {format(new Date(checkedInAt), "h:mm a, MMM d")}</p>
          </div>
        </motion.div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 no-print" role="status">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-lime)] opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--color-lime)]" />
          </span>
          <p className="text-sm text-text-muted">
            Show this QR at the entry desk. This page updates automatically once you&apos;re scanned.
          </p>
        </div>
      )}

      <AnimatePresence>
        {celebrate && (
          <motion.div
            key="checkin-celebration"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 no-print"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCelebrate(false)}
            role="alertdialog"
            aria-live="assertive"
            aria-label="Check-in successful"
          >
            <motion.div
              className="relative w-full max-w-sm rounded-[28px] border border-emerald-500/30 bg-[#0E1A12] p-8 text-center shadow-[0_0_80px_rgba(16,185,129,0.35)]"
              initial={{ scale: 0.6, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Pulsing rings behind the check */}
              <div className="relative mx-auto mb-6 h-28 w-28">
                {[0, 1].map((i) => (
                  <motion.span
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-emerald-400"
                    initial={{ scale: 1, opacity: 0.7 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.8 }}
                  />
                ))}
                <motion.div
                  className="relative flex h-28 w-28 items-center justify-center rounded-full bg-emerald-500"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                >
                  <svg viewBox="0 0 24 24" className="h-16 w-16 text-white" fill="none" stroke="currentColor" strokeWidth={3}>
                    <motion.path
                      d="M5 12.5l4.5 4.5L19 7.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.35 }}
                    />
                  </svg>
                </motion.div>
              </div>

              {/* Confetti burst */}
              {Array.from({ length: 14 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute left-1/2 top-[30%] h-2 w-2 rounded-sm"
                  style={{ background: ["#34D399", "#A3E635", "#FBBF24", "#F472B6"][i % 4] }}
                  initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                  animate={{
                    x: Math.cos((i / 14) * Math.PI * 2) * 140,
                    y: Math.sin((i / 14) * Math.PI * 2) * 110 + 40,
                    opacity: 0,
                    rotate: 360,
                  }}
                  transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                />
              ))}

              <motion.h2
                className="text-3xl font-anton uppercase text-white"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                You&apos;re in!
              </motion.h2>
              <motion.p
                className="mt-2 text-sm text-emerald-100/80 leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                Check-in confirmed for <span className="font-semibold text-white">{eventTitle}</span>. Head inside and enjoy the event
                <PartyPopper className="inline w-4 h-4 ml-1 -mt-0.5 text-amber-300" />
              </motion.p>
              <button
                onClick={() => setCelebrate(false)}
                className="mt-6 w-full rounded-full bg-emerald-500 py-3 font-bold text-[#04130B] hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                Let&apos;s go
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
