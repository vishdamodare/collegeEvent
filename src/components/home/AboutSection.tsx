import Link from "next/link";

// A real sequence, so the numbering carries information
const STEPS = [
  { title: "Find an event", body: "Browse fests from colleges across Mumbai by category or date." },
  { title: "Register in a minute", body: "Sign in with Google, confirm your details and you're in. Your ticket is saved to your account." },
  { title: "Scan at the gate", body: "Show the QR code from My Tickets. Organizers scan it and you're checked in." },
];

export function AboutSection() {
  return (
    <section id="about" className="py-16 sm:py-24 bg-[var(--color-bg-elevated)] border-t border-[var(--color-border)]">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-10 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-24">
        <div>
          <h2 className="text-[clamp(28px,3.6vw,40px)]">How it works</h2>
          <p className="mt-4 text-[17px] leading-[1.65] text-[var(--color-text-muted)] max-w-[42ch]">
            One place for inter-college fests, so you don&apos;t have to follow every college&apos;s Instagram page to find them.
          </p>
          <p className="mt-6 text-[16px] leading-[1.65] text-[var(--color-text-muted)] max-w-[42ch]">
            Organising a fest?{" "}
            <Link href="/organizer" className="font-semibold text-[var(--color-lime)] hover:underline underline-offset-4">
              Sign in as an organizer
            </Link>{" "}
            to list your events and check people in with the QR scanner.
          </p>
        </div>

        <ol className="space-y-8">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-5">
              <span className="font-anton text-[32px] leading-none text-[var(--color-lime)] w-8 shrink-0">{i + 1}</span>
              <div>
                <h3 className="text-[20px] leading-snug">{step.title}</h3>
                <p className="mt-1.5 text-[16px] leading-[1.6] text-[var(--color-text-muted)] max-w-[48ch]">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
