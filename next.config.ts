import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Title/description/canonical always in the initial <head>, for every crawler. By default Next streams
  // metadata into the body for browsers and "capable" bots; Brave Search's crawler and HTML-only tools
  // don't identify as a known bot, so they'd miss it. Cost is small: pages fetch the same cached data anyway.
  htmlLimitedBots: /.*/,
  images: {
    // Organizers paste arbitrary image URLs; a strict allowlist makes next/image throw and 500 whole pages.
    // ponytail: any https host; restrict to Cloudinary-only once uploads replace pasted URLs.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;

