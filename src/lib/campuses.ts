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
  area: string; // neighbourhood + city, shown on cards
  city: string;
  state: string;
  /** Real campus photo under /public/campuses; leave unset to show a neutral placeholder (never a wrong-campus stock photo). */
  img?: string;
  /** Required attribution for the photo's licence. */
  credit?: { text: string; url: string };
  /** Editorial rating shown on the card and campus page. Hand-set, NOT computed from reviews (there is no review system). */
  rating?: number;
  match: RegExp;
}

export const CAMPUSES: Campus[] = [
  {
    slug: "iit-bombay",
    name: "IIT Bombay",
    area: "Powai, Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    img: "/campuses/iit-bombay.jpg",
    credit: {
      text: "Photo: Shishirdasika, CC BY-SA 4.0",
      url: "https://commons.wikimedia.org/wiki/File:Main_building_in_IIT_Bombay.jpg",
    },
    match: /\b(iit\s*bombay|iitb)\b/i,
  },
  {
    slug: "atharva-college-of-engineering",
    name: "Atharva College of Engineering",
    area: "Malad West, Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    img: "/campuses/atharva.jpg",
    credit: { text: "Photo: Atharva College of Engineering", url: "https://atharvacoe.ac.in" },
    rating: 5,
    match: /atharva/i,
  },
  {
    slug: "vesit",
    name: "Vivekanand Education Society's Institute of Technology",
    area: "Chembur, Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    img: "/campuses/vesit.jpg",
    credit: {
      text: "Photo: Dude7190, CC BY-SA 3.0",
      url: "https://commons.wikimedia.org/wiki/File:VESIT_new_building.JPG",
    },
    match: /vivekanand|\bvesit\b/i,
  },
];

/** The listed campus an organizer's free-text college belongs to, or undefined if it isn't one of them. */
export function campusFor(college: string | null | undefined): Campus | undefined {
  const c = college?.trim();
  return c ? CAMPUSES.find((x) => x.match.test(c)) : undefined;
}

export const campusBySlug = (slug: string): Campus | undefined => CAMPUSES.find((c) => c.slug === slug);
