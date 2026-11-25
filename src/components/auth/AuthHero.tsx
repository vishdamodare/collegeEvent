import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";

const BENEFITS = [
  "Register for any fest in about a minute",
  "Your QR ticket is saved in My Tickets",
  "Free for students",
];

// The brand panel next to every auth form. Always dark (like the homepage hero), so it carries white text in both themes.
export function AuthHero() {
  return (
    <aside className="relative isolate overflow-hidden lg:w-[46%] lg:min-h-screen bg-[rgb(var(--hero-ink))] text-white px-5 py-4 sm:px-10 lg:p-14 flex flex-col">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.14)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_80%_70%_at_30%_70%,#000_0%,transparent_75%)]"
      />
      <div
        aria-hidden
        className="absolute -z-10 -bottom-40 -left-32 w-[560px] h-[560px] rounded-full blur-[110px] opacity-50 hidden lg:block"
        style={{ background: "radial-gradient(circle at 40% 40%, rgba(29,78,216,.65), rgba(220,34,41,.3) 60%, transparent 72%)" }}
      />

      <Link href="/" className="inline-flex items-center gap-2.5 w-fit font-archivo font-bold text-[19px]">
        <Image src="/logo-mark.png" alt="" width={34} height={34} className="logo-mark-on-dark w-[34px] h-[34px]" priority />
        CollegeEvents
      </Link>

      <div className="hidden lg:flex flex-1 flex-col justify-center max-w-[440px] py-16">
        <h1 className="text-[clamp(36px,3.4vw,52px)] leading-[1.05] tracking-[-0.025em]">Your ticket to every campus fest.</h1>
        <ul className="mt-10 space-y-4">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-3 text-[17px] text-white/85">
              <span className="mt-0.5 grid place-items-center w-6 h-6 rounded-full bg-white/10 shrink-0">
                <Check className="w-3.5 h-3.5 text-[var(--color-marigold)]" aria-hidden />
              </span>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
