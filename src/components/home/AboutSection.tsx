import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// A real sequence, so the numbering carries information
const STEPS = [
  { title: "Find an event", body: "Browse fests from colleges across Mumbai by category or date." },
  { title: "Register in a minute", body: "Sign in with Google, confirm your details and you're in. Your ticket is saved to your account." },
  { title: "Scan at the gate", body: "Show the QR code from My Tickets. Organizers scan it and you're checked in." },
];

export function AboutSection() {
  return (
    <section id="about" className="py-12 sm:py-24 bg-[var(--color-bg-elevated)] border-t border-[var(--color-border)]">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-10 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-9 lg:gap-24">
        <div>
          <h2 className="text-[clamp(28px,3.6vw,40px)]">How it works</h2>
          <p className="mt-3 sm:mt-4 text-[16px] sm:text-[17px] leading-[1.6] text-[var(--color-text-muted)] max-w-[42ch]">
            One place for inter-college fests, so you don&apos;t have to follow every college&apos;s Instagram page to find them.
          </p>

          <Link
            href="/organizer"
            className="group mt-6 flex items-center justify-between gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3.5 max-w-[460px] transition-colors hover:border-[var(--color-lime)] focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span className="text-[14.5px] leading-snug">
              <span className="block font-semibold text-[var(--color-text-main)]">Organising a fest?</span>
              <span className="block mt-0.5 text-[var(--color-text-muted)]">
                <span className="font-semibold text-[var(--color-lime)]">Sign in as an organizer</span> to list your events and check people in with the QR scanner.
              </span>
            </span>
            <ArrowUpRight
              className="w-5 h-5 shrink-0 text-[var(--color-lime)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* Steps as a timeline: numbered circles joined by a line */}
        <ol>
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative flex gap-4 pb-8 last:pb-0">
              {i < STEPS.length - 1 && (
                <span aria-hidden className="absolute left-5 -translate-x-1/2 top-11 bottom-0 w-px bg-[var(--color-border-bright,var(--color-border))]" />
              )}
              <span className="relative z-10 grid place-items-center w-10 h-10 shrink-0 rounded-full border border-[color-mix(in_srgb,var(--color-lime)_45%,transparent)] bg-[color-mix(in_srgb,var(--color-lime)_12%,var(--color-bg-elevated))] font-anton text-[18px] leading-none text-[var(--color-lime)]">
                {i + 1}
              </span>
              <div className="pt-1">
                <h3 className="text-[19px] sm:text-[20px] leading-snug">{step.title}</h3>
                <p className="mt-1 text-[15.5px] sm:text-[16px] leading-[1.55] text-[var(--color-text-muted)] max-w-[48ch]">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
