import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { appUrl } from "@/lib/app-url";

export const metadata: Metadata = {
  // Resolves relative og/canonical URLs to the real domain
  metadataBase: new URL(appUrl),
  title: "CollegeEvents — Where Campus Life Happens",
  description: "The platform where students discover, register for, and live campus life across every university.",
  keywords: ["college events", "campus events", "hackathons", "college fests", "student events India", "event registration"],
  openGraph: {
    siteName: "CollegeEvents",
    type: "website",
    locale: "en_IN",
    title: "CollegeEvents — Where Campus Life Happens",
    description: "Discover and register for hackathons, fests, sports and cultural events across colleges.",
    images: [{ url: "/logo-mark.png", width: 512, height: 512, alt: "CollegeEvents" }],
  },
  twitter: { card: "summary", title: "CollegeEvents — Where Campus Life Happens" },
  // Google Search Console ownership (public token, safe to commit)
  verification: { google: "2EbSs9SstfQ1H6aUohSeGvv8SHKz832Mt_R9ZzfXCMI" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // data-palette="spidey" is the Spider-Man trial; delete it to restore the lime theme
    <html lang="en" data-palette="spidey" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:ital,wght@0,100..900;1,100..900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'dark';
                document.documentElement.setAttribute('data-theme', theme);
              })()
            `,
          }}
        />
      </head>
      <body className="antialiased">
        {children}
        <Toaster richColors position="top-right" theme="dark" />
      </body>
    </html>
  );
}
