import { NextResponse } from "next/server";
import { categoriesTable, db, productsTable } from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";
import { formatProduct, loadProductMediaMaps } from "@/lib/api-formatters";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(and(eq(productsTable.featured, true), eq(productsTable.status, "active")))
      .orderBy(desc(productsTable.reviewCount))
      .limit(8);

    const productIds = rows.map(({ products }) => products.id);
    const { imagesByProductId, colorsByProductId } = await loadProductMediaMaps(productIds);

    return NextResponse.json({
      products: rows.map(({ products, categories }) =>
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
      ),
    });
  } catch (err) {
    console.error("Error getting featured products", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
