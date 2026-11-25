import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { appUrl } from "@/lib/app-url";
import { JsonLd } from "@/components/seo/JsonLd";
import { SAME_AS, SITE_NAME, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  // Resolves relative og/canonical URLs to the real domain
  metadataBase: new URL(appUrl),
  title: "CollegeEvents — Discover & Register for College Events in India",
  description:
    "Find college fests, hackathons, technical events and cultural competitions across India. See dates and venues, and register free with an instant QR ticket.",
  applicationName: SITE_NAME,
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "en_IN",
    title: "CollegeEvents — Discover & Register for College Events in India",
    description: "Find college fests, hackathons, technical events and cultural competitions across India, and register free.",
    // Image comes from app/opengraph-image.tsx (1200x630) unless a page sets its own
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
  verification: {
    // Google Search Console ownership (public token, safe to commit)
    google: "2EbSs9SstfQ1H6aUohSeGvv8SHKz832Mt_R9ZzfXCMI",
    // Bing Webmaster Tools: set BING_SITE_VERIFICATION to the msvalidate.01 token from Bing to verify by meta tag
    ...(process.env.BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } } : {}),
  },
};

// Site-wide schema.org: who runs the site, and the site's own search (the /events page supports ?q=)
const siteLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/logo-mark.png"),
    sameAs: SAME_AS,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl("/events")}?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // data-palette="spidey" is the Spider-Man trial; delete it to restore the lime theme
    <html lang="en-IN" data-palette="spidey" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                let theme = 'dark'; try { theme = localStorage.getItem('theme') || 'dark'; } catch (e) {}
                document.documentElement.setAttribute('data-theme', theme);
              })()
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <JsonLd data={siteLd} />
        {children}
        <Toaster richColors position="top-right" theme="dark" />
      </body>
    </html>
  );
}
