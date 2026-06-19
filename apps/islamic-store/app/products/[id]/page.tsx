import { type Metadata } from "next";
import { and, eq } from "drizzle-orm";
import { categoriesTable, db, productsTable } from "@workspace/db";
import { buildSeoMetadata } from "@/lib/seo";
import { getProductIdFromSlug } from "@/lib/utils";
import { ProductDetail } from "@/views/ProductDetail";

async function getProductSeoData(productId: number) {
  const rows = await db
    .select({ product: productsTable, category: categoriesTable })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(and(eq(productsTable.id, productId), eq(productsTable.status, "active")))
    .limit(1);

  return rows[0] ?? null;
}

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
  const description =
    productRow.product.description.length > 160
      ? `${productRow.product.description.slice(0, 157)}...`
      : productRow.product.description;

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

export default function Page() {
  return <ProductDetail />;
}
