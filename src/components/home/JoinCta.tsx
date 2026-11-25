import Link from "next/link";

// One plain prompt for visitors who aren't signed in (replaces the old stats band)
export function JoinCta() {
  return (
    <section className="pt-16 sm:pt-24 pb-16 sm:pb-24">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-10">
        <div className="rounded-2xl bg-[var(--color-lime)] text-[#0B0B08] px-6 py-8 sm:px-10 sm:py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-[clamp(24px,3vw,32px)]">Register once, get into every fest.</h2>
            <p className="mt-2 text-[16px] opacity-85">Sign up with Google and your tickets are saved in one place.</p>
          </div>
          <Link href="/signup" className="btn bg-[#0B0B08] text-white hover:bg-black shrink-0 self-start sm:self-auto">
            Create account
          </Link>
        </div>
      </div>
    </section>
  );
}
