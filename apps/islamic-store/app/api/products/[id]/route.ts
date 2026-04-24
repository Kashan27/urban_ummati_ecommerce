import { NextResponse } from "next/server";
import { categoriesTable, db, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetProductParams } from "@workspace/api-zod";
import { formatProduct } from "@/lib/api-formatters";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: { id: string } },
) {
  try {
    const { id } = context.params;
    const parsed = GetProductParams.safeParse({ id: parseInt(id, 10) });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const [row] = await db
      .select()
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.id, parsed.data.id));

    if (!row?.products || row.products.status !== "active") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      formatProduct(row.products, {
        categoryId: row.categories?.id ?? null,
        categoryName: row.categories?.name ?? null,
        categorySlug: row.categories?.slug ?? null,
      }),
    );
  } catch (err) {
    console.error("Error getting product", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
