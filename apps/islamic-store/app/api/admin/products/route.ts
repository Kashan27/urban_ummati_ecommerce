import { NextResponse } from "next/server";
import {
  categoriesTable,
  collectionsTable,
  db,
  ordersTable,
  orderItemsTable,
  productCollectionsTable,
  productColorsTable,
  productImagesTable,
  productUpsellsTable,
  productsTable,
} from "@workspace/db";
import { formatProduct, loadProductMediaMaps } from "@/lib/api-formatters";
import { requireAdmin } from "@/lib/admin-auth";
import { and, desc, eq, inArray, isNotNull, isNull, or, sql } from "drizzle-orm";
import { z } from "zod";

export const runtime = "nodejs";

const imageValueSchema = z
  .string()
  .min(1)
  .refine(
    (value) => value.startsWith("/") || /^https?:\/\//i.test(value),
    "Image must be an absolute URL or a local path starting with '/'",
  );

const AdminProductBody = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  status: z.enum(["draft", "active"]).default("active"),
  price: z.coerce.number().positive(),
  comparePrice: z.coerce.number().nullable().optional(),
  categoryId: z.coerce.number().int().positive(),
  collectionIds: z.array(z.coerce.number().int().positive()).optional().default([]),
  sku: z.string().optional().nullable(),
  imageUrl: imageValueSchema,
  images: z.array(imageValueSchema).default([]),
  inStock: z.boolean().default(true),
  inventoryQuantity: z.coerce.number().int().min(0).nullable().optional(),
  featured: z.boolean().default(false),
  isUpsell: z.boolean().default(false),
  upsellDiscount: z.coerce.number().nullable().optional(),
  colors: z.array(z.object({ hex: z.string(), name: z.string() })).default([]),
  weight: z.coerce.number().nullable().optional(), // in kg
  length: z.coerce.number().nullable().optional(), // in cm
  width: z.coerce.number().nullable().optional(),  // in cm
  height: z.coerce.number().nullable().optional(), // in cm
  mainProductIds: z.array(z.coerce.number().int().positive()).optional().default([]),
});

const AdminProductsQuery = z.object({
  q: z.string().optional(),
  categoryIds: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
  stock: z.enum(["in_stock", "out_of_stock", "low_stock"]).optional(),
  lowStockThreshold: z.coerce.number().int().min(1).max(9999).optional().default(5),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  limit: z.coerce.number().int().min(1).max(1000).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

function parseIdList(value: string | undefined) {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => parseInt(v.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
}

function buildProductWhere(
  input: z.infer<typeof AdminProductsQuery>,
  overrides?: Partial<Pick<z.infer<typeof AdminProductsQuery>, "categoryIds" | "status" | "stock">>,
) {
  const threshold = input.lowStockThreshold ?? 5;
  const categoryIds = parseIdList(overrides?.categoryIds ?? input.categoryIds);

  const conditions: any[] = [];

  const q = input.q?.trim();
  if (q) {
    const pattern = `%${q}%`;
    conditions.push(
      sql`(${productsTable.name} ILIKE ${pattern} OR ${productsTable.description} ILIKE ${pattern})`,
    );
  }

  const status = overrides?.status ?? input.status;
  if (status) {
    conditions.push(eq(productsTable.status, status));
  }

  if (categoryIds.length) {
    conditions.push(inArray(productsTable.categoryId, categoryIds));
  }

  if (typeof input.minPrice === "number") {
    conditions.push(sql`${productsTable.price}::numeric >= ${input.minPrice}`);
  }

  if (typeof input.maxPrice === "number") {
    conditions.push(sql`${productsTable.price}::numeric <= ${input.maxPrice}`);
  }

  const stock = overrides?.stock ?? input.stock;
  if (stock === "in_stock") {
    conditions.push(
      and(
        eq(productsTable.inStock, true),
        or(isNull(productsTable.inventoryQuantity), sql`${productsTable.inventoryQuantity} > 0`),
      ),
    );
  }
  if (stock === "out_of_stock") {
    conditions.push(
      or(eq(productsTable.inStock, false), sql`${productsTable.inventoryQuantity} = 0`),
    );
  }
  if (stock === "low_stock") {
    conditions.push(
      and(
        eq(productsTable.inStock, true),
        isNotNull(productsTable.inventoryQuantity),
        sql`${productsTable.inventoryQuantity} > 0`,
        sql`${productsTable.inventoryQuantity} <= ${threshold}`,
      ),
    );
  }

  return conditions.length ? and(...conditions) : undefined;
}

export async function GET(request: Request) {
  try {
    const admin = requireAdmin(request);
    if (!admin.ok) return admin.response;

    const url = new URL(request.url);
    const raw = {
      q: url.searchParams.get("q") ?? undefined,
      categoryIds: url.searchParams.get("categoryIds") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      stock: url.searchParams.get("stock") ?? undefined,
      lowStockThreshold: url.searchParams.get("lowStockThreshold") ?? undefined,
      minPrice: url.searchParams.get("minPrice") ?? undefined,
      maxPrice: url.searchParams.get("maxPrice") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      offset: url.searchParams.get("offset") ?? undefined,
    };

    const parsed = AdminProductsQuery.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query params", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const params = parsed.data;
    if (
      typeof params.minPrice === "number" &&
      typeof params.maxPrice === "number" &&
      params.minPrice > params.maxPrice
    ) {
      return NextResponse.json(
        { error: "Invalid price range: minPrice cannot be greater than maxPrice" },
        { status: 400 },
      );
    }

    const where = buildProductWhere(params) ?? sql`true`;
    const limit = params.limit;
    const offset = params.offset ?? 0;

    const [countRow, rows, statusRows, categoryRows, stockRows, upsellLinks, soldResult] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(productsTable)
        .where(where),
      (() => {
        const q = db
          .select()
          .from(productsTable)
          .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
          .where(where)
          .orderBy(desc(productsTable.createdAt));

        if (typeof limit === "number") {
          return q.limit(limit).offset(offset);
        }

        return q;
      })(),
      db
        .select({ status: productsTable.status, count: sql<number>`count(*)` })
        .from(productsTable)
        .where(buildProductWhere(params, { status: undefined }) ?? sql`true`)
        .groupBy(productsTable.status),
      db
        .select({
          id: categoriesTable.id,
          name: categoriesTable.name,
          count: sql<number>`count(*)`,
        })
        .from(productsTable)
        .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .where(buildProductWhere(params, { categoryIds: undefined }) ?? sql`true`)
        .groupBy(categoriesTable.id, categoriesTable.name)
        .orderBy(categoriesTable.name),
      db
        .select({
          inStock: sql<number>`
            sum(
              case
                when (${productsTable.inStock} = true and (${productsTable.inventoryQuantity} is null or ${productsTable.inventoryQuantity} > 0)
                  and not (${productsTable.inventoryQuantity} is not null and ${productsTable.inventoryQuantity} > 0 and ${productsTable.inventoryQuantity} <= ${params.lowStockThreshold}))
                then 1 else 0
              end
            )
          `,
          outOfStock: sql<number>`
            sum(
              case
                when (${productsTable.inStock} = false or ${productsTable.inventoryQuantity} = 0)
                then 1 else 0
              end
            )
          `,
          lowStock: sql<number>`
            sum(
              case
                when (${productsTable.inStock} = true and ${productsTable.inventoryQuantity} is not null
                  and ${productsTable.inventoryQuantity} > 0 and ${productsTable.inventoryQuantity} <= ${params.lowStockThreshold})
                then 1 else 0
              end
            )
          `,
        })
        .from(productsTable)
        .where(buildProductWhere(params, { stock: undefined }) ?? sql`true`),
      db
        .select({ upsellProductId: productUpsellsTable.upsellProductId, mainProductId: productUpsellsTable.mainProductId })
        .from(productUpsellsTable),
      // Calculate sold quantities dynamically from paid orders
      db
        .select({
          productId: orderItemsTable.productId,
          totalSold: sql<string>`coalesce(sum(${orderItemsTable.quantity}), 0)::text`,
        })
        .from(orderItemsTable)
        .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
        .where(eq(ordersTable.paymentStatus, "paid"))
        .groupBy(orderItemsTable.productId),
    ]);

    const total = countRow?.[0]?.count ?? 0;
    const upsellMap = new Map<number, number[]>();
    upsellLinks.forEach(l => {
      const list = upsellMap.get(l.upsellProductId) || [];
      list.push(l.mainProductId);
      upsellMap.set(l.upsellProductId, list);
    });

    // Build sold count map from dynamic calculation
    // soldResult is an ExecuteResult with rows property
    const soldMap = new Map<number, number>();
    // Handle different possible result structures from drizzle execute
    let soldRows: Array<{ productId?: number; totalSold?: number | string }> = [];
    if (soldResult && typeof soldResult === 'object') {
      if (Array.isArray((soldResult as any).rows)) {
        soldRows = (soldResult as any).rows;
      } else if (Array.isArray(soldResult)) {
        soldRows = soldResult as any;
      }
    }
    for (const row of soldRows) {
      const productId = row?.productId;
      const countRaw = row?.totalSold;
      const count = typeof countRaw === 'string' ? parseInt(countRaw, 10) : typeof countRaw === 'number' ? countRaw : NaN;
      if (typeof productId === 'number' && !isNaN(count)) {
        soldMap.set(productId, count);
      }
    }

    const productIds = rows.map(({ products }) => products.id);
    const { imagesByProductId, colorsByProductId } = await loadProductMediaMaps(productIds);

    const products = rows.map(({ products, categories }) => {
      const formatted = formatProduct(
        products,
        {
          categoryId: categories?.id ?? null,
          categoryName: categories?.name ?? null,
          categorySlug: categories?.slug ?? null,
        },
        imagesByProductId.get(products.id),
        colorsByProductId.get(products.id),
      );
      // Override totalSold with dynamically calculated value
      const dynamicSold = soldMap.get(products.id) ?? 0;
      return {
        ...formatted,
        totalSold: dynamicSold,
        mainProductIds: upsellMap.get(products.id) || []
      };
    });

    const statusCounts = statusRows.reduce(
      (acc, row) => {
        acc[row.status] = row.count;
        return acc;
      },
      {} as Record<string, number>,
    );

    const categoryCounts = categoryRows
      .filter((r) => typeof r.id === "number")
      .map((r) => ({ id: r.id as number, name: r.name as string, count: r.count }));

    const stockCounts = stockRows?.[0] || { inStock: 0, outOfStock: 0, lowStock: 0 };

    return NextResponse.json({
      products,
      total,
      facets: {
        statuses: {
          active: statusCounts.active ?? 0,
          draft: statusCounts.draft ?? 0,
          archived: statusCounts.archived ?? 0,
        },
        categories: categoryCounts,
        stock: {
          inStock: stockCounts.inStock ?? 0,
          outOfStock: stockCounts.outOfStock ?? 0,
          lowStock: stockCounts.lowStock ?? 0,
        },
      },
    });
  } catch (err) {
    console.error("Error listing admin products", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = requireAdmin(request);
    if (!admin.ok) return admin.response;

    const body = await request.json();
    const parsed = AdminProductBody.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
    }

    const data = parsed.data;
    const collectionIds = Array.from(new Set((data.collectionIds || []).filter(Boolean)));
    const mainProductIds = Array.from(new Set((data.mainProductIds || []).filter(Boolean)));
    const [category] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, data.categoryId))
      .limit(1);

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }

    if (collectionIds.length > 0) {
      const existingCollections = await db
        .select({ id: collectionsTable.id })
        .from(collectionsTable)
        .where(inArray(collectionsTable.id, collectionIds));
      if (existingCollections.length !== collectionIds.length) {
        return NextResponse.json(
          { error: "One or more collections were not found" },
          { status: 400 },
        );
      }
    }

    const now = new Date();
    const product = await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(productsTable)
        .values({
          name: data.name,
          description: data.description,
          status: data.status,
          price: String(data.price),
          comparePrice: data.comparePrice ? String(data.comparePrice) : null,
          categoryId: category.id,
          sku: data.sku,
          imageUrl: data.imageUrl,
          inStock: data.inStock ?? true,
          inventoryQuantity: data.inventoryQuantity ?? null,
          featured: data.featured ?? false,
          isUpsell: data.isUpsell ?? false,
          upsellDiscount: data.upsellDiscount ? String(data.upsellDiscount) : null,
          weight: data.weight ? String(data.weight) : null,
          length: data.length ? String(data.length) : null,
          width: data.width ? String(data.width) : null,
          height: data.height ? String(data.height) : null,
        })
        .returning();

      if (data.images && data.images.length > 0) {
        await tx.insert(productImagesTable).values(
          data.images.map((url, idx) => ({
            productId: inserted.id,
            url,
            sortOrder: idx,
            updatedAt: now,
          })),
        );
      }

      if (data.colors && data.colors.length > 0) {
        await tx.insert(productColorsTable).values(
          data.colors.map((color, idx) => ({
            productId: inserted.id,
            hex: color.hex,
            name: color.name,
            sortOrder: idx,
            updatedAt: now,
          })),
        );
      }

      if (collectionIds.length > 0) {
        for (const collectionId of collectionIds) {
          await tx
            .insert(productCollectionsTable)
            .values({
              productId: inserted.id,
              collectionId,
              isActive: true,
              createdAt: now,
              updatedAt: now,
            })
            .onConflictDoUpdate({
              target: [
                productCollectionsTable.productId,
                productCollectionsTable.collectionId,
              ],
              set: { isActive: true, updatedAt: now },
            });
        }
      }

      if (mainProductIds.length > 0) {
        for (const mainId of mainProductIds) {
          await tx
            .insert(productUpsellsTable)
            .values({
              mainProductId: mainId,
              upsellProductId: inserted.id,
              createdAt: now,
            })
            .onConflictDoNothing();
        }
      }

      return inserted;
    });

    return NextResponse.json(
      formatProduct(
        product,
        {
          categoryId: category.id,
          categoryName: category.name,
          categorySlug: category.slug,
        },
        data.images || [],
        data.colors || [],
      ),
      { status: 201 },
    );
  } catch (err) {
    console.error("Error creating product", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
