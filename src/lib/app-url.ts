// Explicit env wins; on Vercel fall back to the auto-set production domain so prod never links to localhost
export const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.BETTER_AUTH_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  "http://localhost:3000";
