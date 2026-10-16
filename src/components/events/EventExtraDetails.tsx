import { format } from "date-fns";

export interface PublicEventDetails {
  end: string | null;
  registrationCloses: string | null;
  venueType: "OFFLINE" | "ONLINE" | "HYBRID";
  address: string;
  googleMapsLink: string;
  platform: string;
  meetingLink: string;
  meetingPassword: string;
  isFree: boolean;
  fee: number;
  tickets: { name: string; price: number; description: string }[];
  refundPolicy: string;
  rules: Record<"eligibility" | "requirements" | "instructions" | "dressCode" | "codeOfConduct" | "judgingCriteria", string>;
  prizes: { title: string; cashPrize?: number; goodies?: string; description?: string }[];
  faqs: { question: string; answer: string }[];
  contact: { name: string; email: string; phone: string };
  sponsors: { name: string; category: string; logoUrl: string; websiteUrl: string }[];
  links: { promoVideo: string; brochure: string; rulebook: string };
}

const RULE_LABELS: Record<keyof PublicEventDetails["rules"], string> = {
  eligibility: "Eligibility",
  requirements: "Requirements",
  instructions: "Instructions",
  dressCode: "Dress Code",
  codeOfConduct: "Code of Conduct",
  judgingCriteria: "Judging Criteria",
};

const heading = "text-xl font-bold font-[family-name:var(--font-archivo)] normal-case text-text-main";
const card = "rounded-xl border border-border bg-card p-4";
const fmt = (d: string) => format(new Date(d), "EEE, MMM d · h:mm a");
const safeUrl = (u: string) => (/^https?:\/\//i.test(u) ? u : "");

/** Price label for the registration sidebar. */
export function priceLabel(d: PublicEventDetails | null) {
  if (!d || d.isFree) return "Free";
  const prices = [d.fee, ...d.tickets.map((t) => t.price)].filter((p) => p > 0);
  return prices.length ? `₹${Math.min(...prices).toLocaleString("en-IN")}${prices.length > 1 ? " onwards" : ""}` : "Free";
}

export function EventExtraDetails({ details: d }: { details: PublicEventDetails }) {
  const rules = (Object.keys(RULE_LABELS) as (keyof typeof RULE_LABELS)[]).filter((k) => d.rules[k]);
  const links = [
    ["Watch Promo", safeUrl(d.links.promoVideo)],
    ["Brochure (PDF)", safeUrl(d.links.brochure)],
    ["Rulebook (PDF)", safeUrl(d.links.rulebook)],
  ].filter(([, url]) => url);

  return (
    <>
      {/* Schedule & Venue */}
      <section className="space-y-4">
        <h2 className={heading}>Schedule & Venue</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-[14px]">
          {d.end && (
            <div className={card}>
              <p className="text-text-faint text-xs uppercase tracking-wider mb-1">Ends</p>
              <p className="text-text-main">{fmt(d.end)}</p>
            </div>
          )}
          {d.registrationCloses && (
            <div className={card}>
              <p className="text-text-faint text-xs uppercase tracking-wider mb-1">Registration closes</p>
              <p className="text-text-main">{fmt(d.registrationCloses)}</p>
            </div>
          )}
          <div className={card}>
            <p className="text-text-faint text-xs uppercase tracking-wider mb-1">Mode</p>
            <p className="text-text-main capitalize">
              {d.venueType.toLowerCase()}
              {d.platform && ` · ${d.platform}`}
            </p>
          </div>
          {(d.address || d.googleMapsLink) && (
            <div className={card}>
              <p className="text-text-faint text-xs uppercase tracking-wider mb-1">Address</p>
              {d.address && <p className="text-text-main">{d.address}</p>}
              {safeUrl(d.googleMapsLink) && (
                <a href={safeUrl(d.googleMapsLink)} target="_blank" rel="noopener noreferrer" className="text-lime text-sm hover:underline">
                  Open in Google Maps →
                </a>
              )}
            </div>
          )}
          {safeUrl(d.meetingLink) && (
            <div className={card}>
              <p className="text-text-faint text-xs uppercase tracking-wider mb-1">Join online</p>
              <a href={safeUrl(d.meetingLink)} target="_blank" rel="noopener noreferrer" className="text-lime break-all hover:underline">
                {d.meetingLink}
              </a>
              {d.meetingPassword && <p className="text-text-muted text-sm mt-1">Password: {d.meetingPassword}</p>}
            </div>
          )}
        </div>
      </section>

      {/* Tickets */}
      {d.tickets.length > 0 && (
        <section className="space-y-4">
          <h2 className={heading}>Tickets</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {d.tickets.map((t, i) => (
              <div key={i} className={card}>
                <div className="flex justify-between gap-3">
                  <p className="font-bold text-text-main">{t.name}</p>
                  <p className="font-bold text-lime">{t.price > 0 ? `₹${t.price.toLocaleString("en-IN")}` : "Free"}</p>
                </div>
                {t.description && <p className="text-text-muted text-sm mt-1">{t.description}</p>}
              </div>
            ))}
          </div>
          {d.refundPolicy && <p className="text-text-faint text-sm">Refund policy: {d.refundPolicy}</p>}
        </section>
      )}

      {/* Prizes */}
      {d.prizes.length > 0 && (
        <section className="space-y-4">
          <h2 className={heading}>Prizes</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {d.prizes.map((p, i) => (
              <div key={i} className={card}>
                <p className="font-bold text-text-main">{p.title}</p>
                {Number(p.cashPrize) > 0 && <p className="text-lime font-bold text-lg">₹{Number(p.cashPrize).toLocaleString("en-IN")}</p>}
                {p.goodies && <p className="text-text-muted text-sm">{p.goodies}</p>}
                {p.description && <p className="text-text-faint text-sm mt-1">{p.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Rules */}
      {rules.length > 0 && (
        <section className="space-y-4">
          <h2 className={heading}>Rules & Guidelines</h2>
          <div className="space-y-3">
            {rules.map((k) => (
              <div key={k} className={card}>
                <p className="text-text-faint text-xs uppercase tracking-wider mb-1">{RULE_LABELS[k]}</p>
                <p className="text-text-muted whitespace-pre-line text-[14px]">{d.rules[k]}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {links.length > 0 && (
        <section className="flex flex-wrap gap-3">
          {links.map(([label, url]) => (
            <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl border border-border bg-card text-sm text-text-main hover:border-lime">
              {label}
            </a>
          ))}
        </section>
      )}

      {/* FAQs */}
      {d.faqs.length > 0 && (
        <section className="space-y-4">
          <h2 className={heading}>FAQs</h2>
          <div className="space-y-2">
            {d.faqs.map((f, i) => (
              <details key={i} className={`${card} group`}>
                <summary className="cursor-pointer font-semibold text-text-main list-none flex justify-between">
                  {f.question}
                  <span className="text-text-faint group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-text-muted text-sm mt-2 whitespace-pre-line">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Sponsors */}
      {d.sponsors.length > 0 && (
        <section className="space-y-4">
          <h2 className={heading}>Sponsors</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {d.sponsors.map((s, i) => {
              const body = (
                <>
                  {safeUrl(s.logoUrl) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={safeUrl(s.logoUrl)} alt={s.name} className="h-10 object-contain mb-2" />
                  )}
                  <p className="font-semibold text-text-main text-sm">{s.name}</p>
                  <p className="text-text-faint text-[11px] uppercase tracking-wider">{s.category}</p>
                </>
              );
              return safeUrl(s.websiteUrl) ? (
                <a key={i} href={safeUrl(s.websiteUrl)} target="_blank" rel="noopener noreferrer" className={`${card} hover:border-lime`}>
                  {body}
                </a>
              ) : (
                <div key={i} className={card}>{body}</div>
              );
            })}
          </div>
        </section>
      )}

      {/* Event coordinator */}
      {(d.contact.name || d.contact.email || d.contact.phone) && (
        <section className="space-y-4">
          <h2 className={heading}>Event Coordinator</h2>
          <div className={`${card} text-[14px] space-y-1`}>
            {d.contact.name && <p className="font-semibold text-text-main">{d.contact.name}</p>}
            {d.contact.email && <a href={`mailto:${d.contact.email}`} className="block text-lime hover:underline">{d.contact.email}</a>}
            {d.contact.phone && <a href={`tel:${d.contact.phone}`} className="block text-text-muted">{d.contact.phone}</a>}
          </div>
        </section>
      )}
    </>
  );
}
