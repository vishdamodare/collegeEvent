/**
 * The real campuses shown on the public site (homepage "Trending Campuses" and /colleges).
 * Organizer sign-ups type their college free-hand ("vesit ", "Vivekanand Educational Society's of institude…"),
 * so each campus has a pattern that maps those spellings onto one canonical entry. Anything that matches
 * no campus (test/demo organizers, typos) is simply not listed.
 * To list another campus, add an entry here.
 */
export interface Campus {
  slug: string;
  name: string;
  short: string; // compact name for tight spots (hero)
  area: string; // neighbourhood + city, shown on cards
  city: string;
  state: string;
  /** Real campus photo under /public/campuses; leave unset to show a neutral placeholder (never a wrong-campus stock photo). */
  img?: string;
  /** Required attribution for the photo's licence. */
  credit?: { text: string; url: string };
  /** Editorial rating shown on the card and campus page. Hand-set, NOT computed from reviews (there is no review system). */
  rating?: number;
  /** Official logo under /public/campuses, shown in the college page header. */
  logo?: string;
  /** Official college website. */
  site?: string;
  /** Brand colours + verifiable credentials for the campus's dedicated page. Omit for the neutral default look. */
  brand?: { accent: string; deep: string; /** lighter accent for text on dark backgrounds */ light: string; credentials: [string, string][] };
  match: RegExp;
}

export const CAMPUSES: Campus[] = [
  {
    slug: "iit-bombay",
    name: "IIT Bombay",
    short: "IIT Bombay",
    area: "Powai, Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    img: "/campuses/iit-bombay.jpg",
    logo: "/campuses/iitb-logo.png",
    site: "https://www.iitb.ac.in",
    credit: {
      text: "Photo: Shishirdasika, CC BY-SA 4.0",
      url: "https://commons.wikimedia.org/wiki/File:Main_building_in_IIT_Bombay.jpg",
    },
    match: /\b(iit\s*bombay|iitb)\b/i,
  },
  {
    slug: "atharva-college-of-engineering",
    name: "Atharva College of Engineering",
    short: "Atharva",
    area: "Malad West, Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    img: "/campuses/atharva.jpg",
    credit: { text: "Photo: Atharva College of Engineering", url: "https://atharvacoe.ac.in" },
    rating: 5,
    logo: "/campuses/atharva-logo.png",
    site: "https://atharvacoe.ac.in",
    // Colours sampled from the official logo; credentials as stated on atharvacoe.ac.in
    brand: {
      accent: "#F25E36",
      deep: "#C23E17",
      light: "#FF8A63",
      credentials: [
        ["AICTE approved", "DTE Code EN3203"],
        ["Affiliated to", "University of Mumbai"],
        ["NAAC re-accredited", "'A+' Grade"],
      ],
    },
    match: /atharva/i,
  },
  // Hidden for now (uncomment to list VESIT again):
  // {
  //   slug: "vesit",
  //   name: "Vivekanand Education Society's Institute of Technology",
  //   short: "VESIT",
  //   area: "Chembur, Mumbai",
  //   city: "Mumbai",
  //   state: "Maharashtra",
  //   img: "/campuses/vesit.jpg",
  //   credit: {
  //     text: "Photo: Dude7190, CC BY-SA 3.0",
  //     url: "https://commons.wikimedia.org/wiki/File:VESIT_new_building.JPG",
  //   },
  //   match: /vivekanand|\bvesit\b/i,
  // },
];

/** The listed campus an organizer's free-text college belongs to, or undefined if it isn't one of them. */
export function campusFor(college: string | null | undefined): Campus | undefined {
  const c = college?.trim();
  return c ? CAMPUSES.find((x) => x.match.test(c)) : undefined;
}

export const campusBySlug = (slug: string): Campus | undefined => CAMPUSES.find((c) => c.slug === slug);

const mix = (hex: string, to: number, amt: number) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.round(c + (to - c) * amt));
  return "#" + ch.map((c) => c.toString(16).padStart(2, "0")).join("");
};

/** Accent chosen in the admin panel -> the three shades the college page uses (button, dark-mode text). */
export function brandFromAccent(hex: string | null | undefined) {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return undefined;
  return { accent: hex, deep: mix(hex, 0, 0.22), light: mix(hex, 255, 0.35) };
}

/** Adds https:// to a bare domain; only http(s) links are ever returned. */
export function normalizeWebsite(v: string | null | undefined) {
  const t = v?.trim();
  if (!t) return undefined;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}
