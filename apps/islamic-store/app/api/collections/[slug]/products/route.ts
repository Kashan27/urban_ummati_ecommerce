import { NextRequest, NextResponse } from "next/server";
import {
  categoriesTable,
  collectionsTable,
  db,
  productCollectionsTable,
  productsTable,
} from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";
import { formatProduct, loadProductMediaMaps } from "@/lib/api-formatters";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get("limit") ?? 60), 1), 200);
    const offset = Math.max(Number(request.nextUrl.searchParams.get("offset") ?? 0), 0);

    const collectionRows = await db
      .select()
      .from(collectionsTable)
      .where(and(eq(collectionsTable.slug, slug), eq(collectionsTable.isActive, true)))
      .limit(1);

    const collection = collectionRows[0];
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    const rows = await db
      .select({
        product: productsTable,
        category: categoriesTable,
      })
      .from(productCollectionsTable)
      .innerJoin(collectionsTable, eq(productCollectionsTable.collectionId, collectionsTable.id))
      .innerJoin(productsTable, eq(productCollectionsTable.productId, productsTable.id))
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(
        and(
          eq(collectionsTable.slug, slug),
          eq(collectionsTable.isActive, true),
          eq(productCollectionsTable.isActive, true),
          eq(productsTable.status, "active"),
        ),
      )
      .orderBy(desc(productsTable.createdAt));

    const paginated = rows.slice(offset, offset + limit);

    const productIds = paginated.map((r) => r.product.id);
    const { imagesByProductId, colorsByProductId } = await loadProductMediaMaps(productIds);

    return NextResponse.json({
      collection: {
        id: collection.id,
        name: collection.name,
        slug: collection.slug,
        description: collection.description,
        imageUrl: collection.imageUrl
      },
      products: paginated.map((r) =>
        formatProduct(
          r.product,
          {
            categoryId: r.category?.id ?? null,
            categoryName: r.category?.name ?? null,
            categorySlug: r.category?.slug ?? null,
          },
          imagesByProductId.get(r.product.id),
          colorsByProductId.get(r.product.id),
        ),
      ),
      total: rows.length,
      limit,
      offset,
    });
  } catch (err) {
    console.error("Error listing collection products", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

