import "@/index.css";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Urban Ummati | Modern Islamic Wall Art",
    template: "%s | Urban Ummati",
  },
  description: "Modern Islamic wall art and handcrafted decor for contemporary Muslim homes.",
  keywords: ["Islamic wall art", "Muslim home decor", "Islamic gifts", "Modern Islamic art"],
  authors: [{ name: "Urban Ummati" }],
  icons: {
    icon: "/title-shidle.png",
    apple: "/title-shidle.png",
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://urbanummati.store",
    siteName: "Urban Ummati",
    images: [
      {
        url: "/opengraph.jpg",
        width: 1200,
        height: 630,
        alt: "Urban Ummati - Modern Islamic Wall Art",
      },
    ],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
