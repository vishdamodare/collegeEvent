import { after } from "next/server";
import { absoluteUrl } from "@/lib/seo";

/**
 * IndexNow: tells participating engines (Bing — which also feeds Yahoo and DuckDuckGo — Yandex, Seznam,
 * Naver…) that URLs changed, so new/edited/removed events get recrawled within minutes.
 * Google does not use IndexNow; it relies on the sitemap + Search Console.
 * The key is public by design: it is served at /<key>.txt (src/app/<key>.txt/route.ts) to prove ownership.
 */
export const INDEXNOW_KEY = "8c06b61c4b4362732cf03de96c6fff8a";

/** Fire-and-forget after the response; only production pings (previews/dev must not submit URLs). */
export function notifySearchEngines(paths: string[]) {
  if (process.env.VERCEL_ENV !== "production" || paths.length === 0) return;
  const host = new URL(absoluteUrl("/")).host;
  after(async () => {
    try {
      const res = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ host, key: INDEXNOW_KEY, urlList: [...new Set(paths)].map((p) => absoluteUrl(p)) }),
      });
      // 200/202 = accepted. Anything else is logged only: a failed ping must never affect the organizer's save.
      if (!res.ok) console.warn("IndexNow ping rejected:", res.status);
    } catch (e) {
      console.warn("IndexNow ping failed:", e);
    }
  });
}
