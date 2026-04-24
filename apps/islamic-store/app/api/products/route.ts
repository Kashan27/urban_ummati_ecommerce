import { NextRequest, NextResponse } from "next/server";
import { categoriesTable, db, productsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { ListProductsQueryParams } from "@workspace/api-zod";
import { formatProduct } from "@/lib/api-formatters";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams;
    const rawQuery = {
      category: search.get("category") ?? undefined,
      featured: search.get("featured") ?? undefined,
      limit: search.get("limit") ?? undefined,
      offset: search.get("offset") ?? undefined,
    };

    const parsed = ListProductsQueryParams.safeParse(rawQuery);
    const params = parsed.success ? parsed.data : { limit: 20, offset: 0 };

    const allRows = await db
      .select()
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .orderBy(desc(productsTable.createdAt));

    const filtered = allRows.filter(({ products, categories }) => {
      if (!categories) return false;
      if (products.status !== "active") return false;
      if (params.category && categories.slug !== params.category) return false;
      if (params.featured !== undefined && products.featured !== params.featured) {
        return false;
      }
      return true;
    });

    const limit = params.limit ?? 20;
    const offset = params.offset ?? 0;
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      products: paginated.map(({ products, categories }) =>
        formatProduct(products, {
          categoryId: categories?.id ?? null,
          categoryName: categories?.name ?? null,
          categorySlug: categories?.slug ?? null,
        }),
      ),
      total: filtered.length,
    });
  } catch (err) {
    console.error("Error listing products", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
