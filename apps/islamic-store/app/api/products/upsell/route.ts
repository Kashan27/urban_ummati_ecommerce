import { NextResponse } from "next/server";
import { categoriesTable, db, productsTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { formatProduct } from "@/lib/api-formatters";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(and(eq(productsTable.isUpsell, true), eq(productsTable.status, "active")))
      .limit(4);

    return NextResponse.json({
      products: rows.map(({ products, categories }) =>
        formatProduct(products, {
          categoryId: categories?.id ?? null,
          categoryName: categories?.name ?? null,
          categorySlug: categories?.slug ?? null,
        }),
      ),
    });
  } catch (err) {
    console.error("Error getting upsell products", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
