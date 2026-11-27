// Explicit env wins; on Vercel fall back to the auto-set production domain so prod never links to localhost
const raw =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.BETTER_AUTH_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  "http://localhost:3000";

// Tolerate a value typed without its scheme ("collegeevent.in", "localhost:3001") or with a trailing slash,
// since emails and PDFs build absolute links and image URLs from this.
export const appUrl = (/^https?:\/\//i.test(raw) ? raw : `${/^localhost|^127\./.test(raw) ? "http" : "https"}://${raw}`).replace(/\/+$/, "");
