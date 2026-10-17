import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/app-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private / per-user areas have nothing worth indexing
      disallow: ["/admin", "/dashboard", "/api/", "/auth-callback", "/pending-approval", "/signup/student-onboarding"],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
