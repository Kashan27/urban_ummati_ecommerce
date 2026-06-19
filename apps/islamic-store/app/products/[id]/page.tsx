import { type Metadata } from "next";
import { and, eq } from "drizzle-orm";
import { categoriesTable, db, productsTable } from "@workspace/db";
import { cache } from "react";
import { loadProductMediaMaps } from "@/lib/api-formatters";
import { buildSeoMetadata } from "@/lib/seo";
import { getProductIdFromSlug } from "@/lib/utils";
import { ProductDetail } from "@/views/ProductDetail";

const siteUrl = "https://urban-ummati.vercel.app";
const brandName = "Urban Ummati";

function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toAbsoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return new URL(pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`, siteUrl).toString();
}

const getProductSeoData = cache(async (productId: number) => {
  const rows = await db
    .select({ product: productsTable, category: categoriesTable })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(and(eq(productsTable.id, productId), eq(productsTable.status, "active")))
    .limit(1);

  const row = rows[0] ?? null;
  if (!row) {
    return null;
  }

  const { imagesByProductId } = await loadProductMediaMaps([productId]);

  return {
    ...row,
    galleryImages: imagesByProductId.get(productId) ?? [],
  };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const productId = Number.parseInt(getProductIdFromSlug(id), 10);

  if (Number.isNaN(productId)) {
    return buildSeoMetadata({
      title: "Product Not Found | Urban Ummati",
      description: "The requested product could not be found.",
      path: `/products/${id}`,
      noIndex: true,
    });
  }

  const productRow = await getProductSeoData(productId);

  if (!productRow) {
    return buildSeoMetadata({
      title: "Product Not Found | Urban Ummati",
      description: "The requested product could not be found or is unavailable.",
      path: `/products/${id}`,
      noIndex: true,
    });
  }

  const productName = productRow.product.name;
  const categoryName = productRow.category?.name;
  const cleanDescription = stripHtml(productRow.product.description);
  const description =
    cleanDescription.length > 160 ? `${cleanDescription.slice(0, 157)}...` : cleanDescription;

  return buildSeoMetadata({
    title: categoryName ? `${productName} | ${categoryName}` : productName,
    description,
    path: `/products/${id}`,
    image: productRow.product.imageUrl,
    keywords: [
      productName,
      categoryName ?? "",
      "Islamic wall art",
      "Arabic calligraphy",
      "Muslim home decor",
    ].filter(Boolean),
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number.parseInt(getProductIdFromSlug(id), 10);

  let productJsonLd = null;
  let breadcrumbJsonLd = null;
  if (!Number.isNaN(productId)) {
    const row = await getProductSeoData(productId);
    if (row) {
      const productUrl = `${siteUrl}/products/${id}`;
      const cleanDescription = stripHtml(row.product.description);
      const allImages = [...new Set([row.product.imageUrl, ...row.galleryImages].filter(Boolean))].map(toAbsoluteUrl);

      productJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: row.product.name,
        description: cleanDescription,
        image: allImages,
        url: productUrl,
        sku: row.product.sku ?? undefined,
        category: row.category?.name ?? undefined,
        brand: { "@type": "Brand", name: brandName },
        offers: {
          "@type": "Offer",
          url: productUrl,
          priceCurrency: "CAD",
          price: Number(row.product.price).toFixed(2),
          availability: row.product.inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: { "@type": "Organization", name: brandName },
        },
      };

      if (row.product.reviewCount > 0) {
        productJsonLd = {
          ...productJsonLd,
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(row.product.rating).toFixed(1),
            reviewCount: row.product.reviewCount,
          },
        };
      }

      breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          ...(row.category
            ? [
                {
                  "@type": "ListItem",
                  position: 2,
                  name: row.category.name,
                  item: `${siteUrl}/products?category=${row.category.slug}`,
                },
              ]
            : []),
          {
            "@type": "ListItem",
            position: row.category ? 3 : 2,
            name: row.product.name,
            item: productUrl,
          },
        ],
      };
    }
  }

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <ProductDetail />
    </>
  );
}
