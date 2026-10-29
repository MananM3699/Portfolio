import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { profile, seoKeywords } from "@/content/site";
import "./globals.css";

// Space Grotesk for headings, Inter for text, mono for small data. globals.css reads the variables.
const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const codeFont = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin"],
});

const siteTitle = `${profile.name} · Senior Frontend / Full Stack Engineer (React, TypeScript, Next.js)`;

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: {
    default: siteTitle,
    template: `%s · ${profile.name}`,
  },
  description: profile.summary,
  keywords: [...seoKeywords],
  authors: [{ name: profile.name, url: profile.siteUrl }],
  creator: profile.name,
  publisher: profile.name,
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    title: siteTitle,
    description: profile.headline,
    url: "/",
    siteName: `${profile.name} Portfolio`,
    locale: "en_US",
    type: "website",
    images: [{ url: profile.photo, alt: profile.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: profile.headline,
    images: [profile.photo],
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  description: profile.summary,
  url: profile.siteUrl,
  image: `${profile.siteUrl}${profile.photo}`,
  email: `mailto:${profile.email}`,
  worksFor: { "@type": "Organization", name: profile.company },
  address: { "@type": "PostalAddress", addressLocality: "Vadodara", addressCountry: "IN" },
  sameAs: [profile.linkedin, ...(profile.github ? [profile.github] : [])],
  knowsAbout: [...seoKeywords],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${displayFont.variable} ${bodyFont.variable} ${codeFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-foreground"
        >
          Skip to content
        </a>
        <TooltipProvider delayDuration={150}>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </TooltipProvider>
      </body>
    </html>
  );
}
