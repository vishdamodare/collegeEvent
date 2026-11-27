// One-off: register the campuses already listed on the site, so existing colleges keep working. Run: npx tsx prisma/seedColleges.ts
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { CAMPUSES } from "../src/lib/campuses";

(async () => {
  for (const c of CAMPUSES) await prisma.college.upsert({ where: { name: c.name }, update: {}, create: { name: c.name } });
  console.log((await prisma.college.findMany()).map((c) => c.name));
  process.exit(0);
})();
