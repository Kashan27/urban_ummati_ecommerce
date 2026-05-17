import { NextRequest, NextResponse } from "next/server";
import { categoriesTable, db, productsTable, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetProductParams } from "@workspace/api-zod";
import { formatProduct, loadProductMediaMaps } from "@/lib/api-formatters";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const parsed = GetProductParams.safeParse({ id: parseInt(id, 10) });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const [row, allSettings] = await Promise.all([
      db
        .select()
        .from(productsTable)
        .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .where(eq(productsTable.id, parsed.data.id))
        .then(rows => rows[0]),
      db.select().from(settingsTable)
    ]);

    if (!row?.products || row.products.status !== "active") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const settings = allSettings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);

    const { imagesByProductId, colorsByProductId } = await loadProductMediaMaps([row.products.id]);

    return NextResponse.json({
      product: formatProduct(
        row.products,
        {
          categoryId: row.categories?.id ?? null,
          categoryName: row.categories?.name ?? null,
          categorySlug: row.categories?.slug ?? null,
        },
        imagesByProductId.get(row.products.id),
        colorsByProductId.get(row.products.id),
      ),
      settings
    });
  } catch (err) {
    console.error("Error getting product", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
