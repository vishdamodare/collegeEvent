import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer id="footer" className="border-t border-[var(--color-border)] pt-14 sm:pt-[80px] pb-[30px]">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-x-6 gap-y-10 mb-10 sm:mb-[60px]">
          
          {/* Brand Col */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="#" className="flex items-center gap-[10px] font-archivo font-bold text-[19px]">
              <Image src="/logo-mark.png" alt="CollegeEvents logo" width={30} height={30} className="w-[30px] h-[30px] rounded-[8px] bg-white p-[2px]" />
              CollegeEvents
            </Link>
            <p className="text-[var(--color-text-faint)] text-[14px] my-4 max-w-[280px] leading-[1.6]">
              The platform where students discover, register for, and live campus life across every university.
            </p>
            <div className="flex gap-[10px]">
              {["𝕏", "◎", "in", "▶"].map((icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="w-[38px] h-[38px] rounded-full bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-center m-0 hover:bg-[var(--color-card-hover)] transition-colors"
                >
                  {icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Links Cols */}
          <div className="flex flex-col">
            <h5 className="text-[13px] tracking-[.06em] uppercase text-[var(--color-text-faint)] mb-[18px]">Explore</h5>
            <Link href="#events" className="text-[14.5px] text-[var(--color-text-muted)] mb-[13px] hover:text-[var(--color-text-main)] transition-colors">Events</Link>
            <Link href="#colleges" className="text-[14.5px] text-[var(--color-text-muted)] mb-[13px] hover:text-[var(--color-text-main)] transition-colors">Colleges</Link>
            <Link href="#" className="text-[14.5px] text-[var(--color-text-muted)] mb-[13px] hover:text-[var(--color-text-main)] transition-colors">Categories</Link>
            <Link href="#" className="text-[14.5px] text-[var(--color-text-muted)] mb-[13px] hover:text-[var(--color-text-main)] transition-colors">Cities</Link>
          </div>

          <div className="flex flex-col">
            <h5 className="text-[13px] tracking-[.06em] uppercase text-[var(--color-text-faint)] mb-[18px]">Company</h5>
            <Link href="#about" className="text-[14.5px] text-[var(--color-text-muted)] mb-[13px] hover:text-[var(--color-text-main)] transition-colors">About</Link>
            <Link href="#" className="text-[14.5px] text-[var(--color-text-muted)] mb-[13px] hover:text-[var(--color-text-main)] transition-colors">Careers</Link>
            <Link href="#" className="text-[14.5px] text-[var(--color-text-muted)] mb-[13px] hover:text-[var(--color-text-main)] transition-colors">Press</Link>
            <Link href="#" className="text-[14.5px] text-[var(--color-text-muted)] mb-[13px] hover:text-[var(--color-text-main)] transition-colors">Blog</Link>
          </div>

          <div className="flex flex-col">
            <h5 className="text-[13px] tracking-[.06em] uppercase text-[var(--color-text-faint)] mb-[18px]">Support</h5>
            <Link href="#" className="text-[14.5px] text-[var(--color-text-muted)] mb-[13px] hover:text-[var(--color-text-main)] transition-colors">Help center</Link>
            <Link href="/organizer" className="text-[14.5px] text-[var(--color-text-muted)] mb-[13px] hover:text-[var(--color-text-main)] transition-colors">Organizer login</Link>
            <Link href="#" className="text-[14.5px] text-[var(--color-text-muted)] mb-[13px] hover:text-[var(--color-text-main)] transition-colors">Privacy</Link>
            <Link href="#" className="text-[14.5px] text-[var(--color-text-muted)] mb-[13px] hover:text-[var(--color-text-main)] transition-colors">Terms</Link>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-[26px] border-t border-[var(--color-border)] text-[13px] text-[var(--color-text-faint)] gap-4">
          <span>© 2026 CollegeEvents. Made for every campus.</span>
          <span>Built for students, by students.</span>
        </div>
      </div>
    </footer>
  );
}
