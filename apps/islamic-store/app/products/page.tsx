import { Suspense } from "react";
import { desc, eq } from "drizzle-orm";
import { categoriesTable, db, productsTable } from "@workspace/db";
import { formatProduct, loadProductMediaMaps } from "@/lib/api-formatters";
import { Products } from "@/views/Products";
import { buildSeoMetadata } from "@/lib/seo";
import { getProductSlug } from "@/lib/utils";

const siteUrl = "https://urban-ummati.vercel.app";

export const metadata = buildSeoMetadata({
  title: "Shop Islamic Wall Art",
  description:
    "Shop Islamic wall art, Arabic calligraphy, Kun artwork, and premium Muslim home decor from Urban Ummati.",
  path: "/products",
});

async function getProductsSchemaData() {
  const rows = await db
    .select()
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.status, "active"))
    .orderBy(desc(productsTable.createdAt))
    .limit(12);

  const productIds = rows.map(({ products }) => products.id);
  const { imagesByProductId, colorsByProductId } = await loadProductMediaMaps(productIds);

  return rows.map(({ products, categories }) =>
    formatProduct(
      products,
      {
        categoryId: categories?.id ?? null,
        categoryName: categories?.name ?? null,
        categorySlug: categories?.slug ?? null,
      },
      imagesByProductId.get(products.id),
      colorsByProductId.get(products.id),
    ),
  );
}

export default async function Page() {
  const products = await getProductsSchemaData();

  const productsJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/products#collection-page`,
        url: `${siteUrl}/products`,
        name: "Shop Islamic Wall Art | Urban Ummati",
        description:
          "Shop Islamic wall art, Arabic calligraphy, Kun artwork, and premium Muslim home decor from Urban Ummati.",
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/products#item-list`,
        url: `${siteUrl}/products`,
        name: "Urban Ummati Products",
        numberOfItems: products.length,
        itemListElement: products.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${siteUrl}/products/${getProductSlug(product.name, product.id)}`,
          name: product.name,
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productsJsonLd) }}
      />
      <Suspense fallback={null}>
        <Products />
      </Suspense>
    </>
  );
}
