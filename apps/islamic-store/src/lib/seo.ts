import type { Metadata } from "next";

export const siteName = "Urban Ummati";
export const defaultSeoDescription =
  "Shop modern Islamic wall art, Kun artwork, Arabic calligraphy prints, and premium Muslim home decor by Urban Ummati.";

export const defaultSeoKeywords = [
  "Urban Ummati",
  "Islamic wall art",
  "Kun artwork",
  "Arabic calligraphy",
  "Muslim home decor",
  "Islamic prints",
];

type SeoOptions = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string[];
  noIndex?: boolean;
  type?: "website" | "article";
};

export function buildSeoMetadata({
  title,
  description,
  path = "/",
  image = "/og-image.jpg",
  keywords = defaultSeoKeywords,
  noIndex = false,
  type = "website",
}: SeoOptions): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: path,
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: path,
      siteName,
      locale: "en_CA",
      type,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}