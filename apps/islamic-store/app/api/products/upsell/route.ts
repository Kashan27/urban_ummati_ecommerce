import { NextResponse } from "next/server";
import { categoriesTable, db, productsTable, productUpsellsTable, settingsTable } from "@workspace/db";
import { and, eq, inArray } from "drizzle-orm";
import { formatProduct, loadProductMediaMaps } from "@/lib/api-formatters";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    const [allSettings] = await Promise.all([
      db.select().from(settingsTable)
    ]);
    const settings = allSettings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);

    let productsRows: any[] = [];

    if (productId) {
      const pid = parseInt(productId, 10);
      if (!isNaN(pid)) {
        // Find specific upsells for this product
        const upsellLinks = await db
          .select({ upsellProductId: productUpsellsTable.upsellProductId })
          .from(productUpsellsTable)
          .where(eq(productUpsellsTable.mainProductId, pid));

        if (upsellLinks.length > 0) {
          const ids = upsellLinks.map(l => l.upsellProductId);
          productsRows = await db
            .select()
            .from(productsTable)
            .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
            .where(and(inArray(productsTable.id, ids), eq(productsTable.status, "active")));
        }
      }
    }

    // Fallback to global upsells if no specific ones found or no productId provided
    if (productsRows.length === 0) {
      productsRows = await db
        .select()
        .from(productsTable)
        .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .where(and(eq(productsTable.isUpsell, true), eq(productsTable.status, "active")))
        .limit(4);
    }

    const productIds = productsRows.map(({ products }) => products.id);
    const { imagesByProductId, colorsByProductId } = await loadProductMediaMaps(productIds);

    return NextResponse.json({
      products: productsRows.map(({ products, categories }) =>
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
      settings
    });
  } catch (err) {
    console.error("Error getting upsell products", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
