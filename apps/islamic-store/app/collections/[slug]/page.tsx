import { type Metadata } from "next";
import { eq } from "drizzle-orm";
import { buildSeoMetadata } from "@/lib/seo";
import { collectionsTable, db } from "@workspace/db";
import { CollectionDetail } from "@/views/CollectionDetail";

async function getCollectionSeoData(slug: string) {
  const rows = await db
    .select()
    .from(collectionsTable)
    .where(eq(collectionsTable.slug, slug))
    .limit(1);

  return rows[0] ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionSeoData(slug);

  if (!collection || !collection.isActive) {
    return buildSeoMetadata({
      title: "Collection Not Found | Urban Ummati",
      description: "The requested collection could not be found or is unavailable.",
      path: `/collections/${slug}`,
      noIndex: true,
    });
  }

  const description = collection.description
    ? collection.description.length > 160
      ? `${collection.description.slice(0, 157)}...`
      : collection.description
    : `Browse ${collection.name} from Urban Ummati.`;

  return buildSeoMetadata({
    title: `${collection.name} | Urban Ummati`,
    description,
    path: `/collections/${slug}`,
    image: collection.imageUrl ?? "/og-image.jpg",
    keywords: [collection.name, "Islamic decor", "Ramadan collection", "Islamic wall art"],
  });
}

export default function Page() {
  return <CollectionDetail />;
}

