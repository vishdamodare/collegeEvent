/**
 * Typo-tolerant search used by the public site, the organizer console and the super admin.
 * Pure TypeScript, no dependencies, safe on server and client.
 *
 * Forgives: letter case, accents/punctuation, missing/extra/swapped/wrong letters ("hakathon", "atharv"),
 * sound-alike spellings ("atharwa", "jafar"/"jaffar"), words run together or split apart ("tech fest"/"techfest"),
 * half-typed words ("hack"), plural/suffix ("hackathons"), and a few well-known synonyms ("programming" -> "coding").
 * Every word in the query must match something in the item (so "ai workshop" does not match any workshop).
 */

export type FuzzyField = string | null | undefined | { text: string | null | undefined; weight?: number };

const SYNONYMS = [
  ["coding", "programming", "code", "developer", "software"],
  ["hackathon", "hacking", "hack"],
  ["fest", "festival", "fiesta"],
  ["workshop", "bootcamp", "masterclass"],
  ["robotics", "robot", "robo"],
  ["quiz", "trivia"],
  ["music", "singing", "song", "concert", "band"],
  ["dance", "dancing", "choreography"],
  ["sports", "sport", "tournament", "athletics"],
  ["art", "painting", "drawing", "sketch"],
  ["startup", "entrepreneurship", "pitch", "ecell"],
];
const SYN = new Map<string, string[]>();
for (const group of SYNONYMS) for (const w of group) SYN.set(w, group.filter((x) => x !== w));

/** Lowercase, strip accents, turn anything that isn't a letter/digit into a space. */
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

/** Rough "how it sounds" key, tuned for English and Indian-English spellings. */
function soundKey(w: string) {
  const k = w
    .replace(/ph/g, "f")
    .replace(/(th|dh|bh|kh|gh)/g, (m) => m[0]) // Indian aspirates: Atharva ~ Atarva
    .replace(/ck|q/g, "k")
    .replace(/x/g, "ks")
    .replace(/[zj]/g, "s")
    .replace(/w/g, "v")
    .replace(/(.)\1+/g, "$1");
  return k[0] + k.slice(1).replace(/[aeiouy]/g, "");
}

/** Edit distance counting a swap of two neighbouring letters as one edit (optimal string alignment). Gives up early past `max`. */
function distance(a: string, b: string, max: number) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev2: number[] = [];
  let prev: number[] = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev2 = prev;
    prev = cur;
  }
  return prev[b.length];
}

const allowedEdits = (len: number) => (len <= 3 ? 0 : len <= 5 ? 1 : len <= 9 ? 2 : 3);

/** How well query word `q` matches one document word `d`: 0 (no) to 1 (identical). */
function wordScore(q: string, d: string): number {
  if (q === d) return 1;
  const ql = q.length;
  if (ql < 2) return 0;
  if (d.startsWith(q)) return 0.8 + 0.15 * (ql / d.length); // half-typed word
  if (ql >= 4 && d.length >= 3 && ql - d.length <= 2 && q.startsWith(d)) return 0.78; // "hackathons"/"hackathoned" vs "hackathon"
  if (ql >= 3 && d.includes(q)) return 0.62;

  let best = 0;
  const max = allowedEdits(ql);
  if (max > 0) {
    const whole = distance(q, d, max);
    // also compare with the same-length start of the word, so a typo'd half-typed word still finds it
    const part = d.length > ql ? distance(q, d.slice(0, ql), max) + 0.5 : Infinity;
    const dist = Math.min(whole, part);
    if (dist <= max) best = 0.7 - 0.1 * dist;
  }
  if (ql >= 4 && d.length >= 4) {
    const key = soundKey(q);
    if (key.length >= 3 && key === soundKey(d)) best = Math.max(best, 0.58);
  }
  return best;
}

const THRESHOLD = 0.45;

type Doc = { words: string[]; text: string; weight: number };

function prepare(fields: FuzzyField[]): Doc[] {
  const docs: Doc[] = [];
  for (const f of fields) {
    const raw = typeof f === "object" && f ? f.text : (f as string | null | undefined);
    const text = normalize(raw ?? "");
    if (!text) continue;
    const base = text.split(" ");
    const words = [...base];
    for (let i = 0; i + 1 < base.length; i++) words.push(base[i] + base[i + 1]); // "tech fest" is also "techfest"
    docs.push({ words, text, weight: typeof f === "object" && f && f.weight ? f.weight : 1 });
  }
  return docs;
}

/** Best score of one query word (or its synonyms) over every field. */
function bestForWord(q: string, docs: Doc[]) {
  const alts = [q, ...(SYN.get(q) ?? [])];
  let best = 0;
  for (const doc of docs) {
    const w8 = doc.weight >= 1 ? 1 : 0.85 + 0.15 * doc.weight; // low-weight fields (e.g. descriptions) match a bit less; high weights only lift the ranking bonus below
    for (const w of doc.words) {
      for (let i = 0; i < alts.length; i++) {
        const sc = wordScore(alts[i], w) * (i === 0 ? 1 : 0.85) * w8;
        if (sc > best) best = sc;
      }
    }
  }
  return best;
}

/** Score for one item; 0 means "no match". */
export function scoreItem(query: string, fields: FuzzyField[]): number {
  const nq = normalize(query);
  if (!nq) return 1;
  const docs = prepare(fields);
  if (docs.length === 0) return 0;

  const qWords = nq.split(" ");
  // Try the words as typed and, for "tech fest", glued into one word
  const variants = qWords.length > 1 ? [qWords, [qWords.join("")]] : [qWords];
  let best = 0;
  for (const words of variants) {
    let total = 0;
    let ok = true;
    for (const w of words) {
      const s = bestForWord(w, docs);
      if (s < THRESHOLD) {
        ok = false;
        break;
      }
      total += s;
    }
    if (ok) best = Math.max(best, total / words.length);
  }
  if (best === 0) return 0;

  // The exact phrase in a field beats a scattered match; a field starting with the phrase beats both
  for (const d of docs) {
    if (d.text === nq) best += 0.5 * d.weight;
    else if (d.text.startsWith(nq)) best += 0.3 * d.weight;
    else if (d.text.includes(nq)) best += 0.2 * d.weight;
  }
  return best;
}

/**
 * Filter and rank `items` by `query`, best match first. An empty query returns the items untouched.
 * `fields` lists an item's searchable texts; give a field `{ text, weight }` to count it more (title > description).
 */
export function fuzzyRank<T>(items: T[], query: string, fields: (item: T) => FuzzyField[], limit?: number): T[] {
  if (!normalize(query)) return items;
  const scored: { item: T; score: number; i: number }[] = [];
  items.forEach((item, i) => {
    const score = scoreItem(query, fields(item));
    if (score > 0) scored.push({ item, score, i });
  });
  scored.sort((a, b) => b.score - a.score || a.i - b.i);
  const out = scored.map((s) => s.item);
  return limit ? out.slice(0, limit) : out;
}
