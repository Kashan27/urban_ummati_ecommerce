import "@/index.css";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant-garamond",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://urban-ummati.vercel.app"),
  title: {
    default: "Urban Ummati | Modern Islamic Wall Art",
    template: "%s | Urban Ummati",
  },
  description:
    "Shop modern Islamic wall art, Kun artwork, Arabic calligraphy prints, and premium Muslim home decor by Urban Ummati.",
  keywords: [
    "Urban Ummati",
    "Islamic wall art",
    "Kun artwork",
    "Arabic calligraphy",
    "Muslim home decor",
    "Islamic prints",
  ],
  authors: [{ name: "Urban Ummati" }],
  icons: {
    icon: "/title-shidle.png",
    apple: "/title-shidle.png",
  },
  openGraph: {
    title: "Urban Ummati | Modern Islamic Wall Art",
    description:
      "Shop modern Islamic wall art, Kun artwork, Arabic calligraphy prints, and premium Muslim home decor by Urban Ummati.",
    url: "https://urban-ummati.vercel.app",
    siteName: "Urban Ummati",
    locale: "en_CA",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Urban Ummati Islamic Wall Art",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Urban Ummati | Modern Islamic Wall Art",
    description:
      "Shop modern Islamic wall art, Kun artwork, Arabic calligraphy prints, and premium Muslim home decor by Urban Ummati.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://urban-ummati.vercel.app",
  },
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://urban-ummati.vercel.app/#organization",
      name: "Urban Ummati",
      url: "https://urban-ummati.vercel.app",
      logo: {
        "@type": "ImageObject",
        url: "https://urban-ummati.vercel.app/title-shidle.png",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://urban-ummati.vercel.app/#website",
      url: "https://urban-ummati.vercel.app",
      name: "Urban Ummati",
      publisher: {
        "@id": "https://urban-ummati.vercel.app/#organization",
      },
      inLanguage: "en-CA",
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${cormorantGaramond.variable} ${manrope.variable}`}>
      <body className="antialiased font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
