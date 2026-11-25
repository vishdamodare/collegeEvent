import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/app-url";

/**
 * One rule for every crawler (Googlebot, Bingbot — which also powers Yahoo and DuckDuckGo results —
 * Brave, Applebot, Yandex…). robots.txt only steers crawling; private areas are protected by auth,
 * and they also send noindex, so nothing here is relied on for access control.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/superadmin", "/dashboard", "/api/", "/auth-callback", "/pending-approval", "/signup/student-onboarding"],
    },
    sitemap: `${appUrl.replace(/\/$/, "")}/sitemap.xml`,
  };
}
