// Run: npx tsx src/lib/fuzzy.check.ts   (throws on the first failing case)
import assert from "node:assert/strict";
import { fuzzyRank } from "./fuzzy";

const events = [
  "IEEE Atharva - HackAtharva 24-Hour Hackathon",
  "Techfest 2026 - RoboReach Robotic Arm Challenge",
  "Techfest 2026 - ZeroCode Vibe Coding Challenge",
  "Annual Cultural Night: Dance and Music",
  "Mumbai Startup Pitch Day",
];
const find = (q: string) => fuzzyRank(events, q, (e) => [e]);

// Should find (case, typos, missing/extra/swapped letters, sound-alikes, spacing, partial words, synonyms)
const hits: [string, number][] = [
  ["hackathon", 0], ["HACKATHON", 0], ["hakathon", 0], ["hackaton", 0], ["hackthon", 0], ["hackathons", 0], ["hack", 0],
  ["atharva", 0], ["athrva", 0], ["atharwa", 0], ["atarva", 0], ["atharv", 0],
  ["tech fest", 1], ["techfest", 1], ["tech fst", 1], ["techfes", 1],
  ["robtics", 1], ["robotic arm", 1], ["robo", 1],
  ["programming", 2], ["vibe codng", 2],
  ["culturl night", 3], ["danse", 3], ["muisc", 3],
  ["startap", 4], ["pich day", 4], ["mumbi", 4],
];
for (const [q, i] of hits) assert.ok(find(q).includes(events[i]), `"${q}" should find "${events[i]}"`);

// Should NOT find (gibberish, wrong words, every word must match)
for (const q of ["zzzzqq", "football", "cricket match", "blockchain", "hackathon dance"])
  assert.equal(find(q).length, 0, `"${q}" should find nothing, got ${JSON.stringify(find(q))}`);

// Ranking: the closest match comes first
assert.equal(find("robotic")[0], events[1]);
assert.equal(find("coding")[0], events[2]);

// Names and emails (super admin / organizer lists)
const people = [{ n: "Furquan Shaikh", e: "spencerbits4@gmail.com" }, { n: "Jaffar Mala", e: "jaffarmala2@gmail.com" }, { n: "Saif Salmani", e: "offfstage.co@gmail.com" }];
const p = (q: string) => fuzzyRank(people, q, (x) => [x.n, x.e]).map((x) => x.n);
assert.deepEqual(p("jafar mala"), ["Jaffar Mala"]);
assert.deepEqual(p("furkan"), ["Furquan Shaikh"]);
assert.deepEqual(p("saif salmni"), ["Saif Salmani"]);
assert.deepEqual(p("SPENCER"), ["Furquan Shaikh"]);
assert.equal(p("").length, 3); // empty query = everything

console.log("fuzzy: all checks passed");
