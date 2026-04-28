import { NextResponse } from "next/server";
import {
  categoriesTable,
  collectionsTable,
  db,
  productCollectionsTable,
  productsTable,
} from "@workspace/db";
import { formatProduct } from "@/lib/api-formatters";
import { requireAdmin } from "@/lib/admin-auth";
import { desc, eq, inArray } from "drizzle-orm";
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
  imageUrl: imageValueSchema,
  images: z.array(imageValueSchema).default([]),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  isUpsell: z.boolean().default(false),
  upsellDiscount: z.coerce.number().nullable().optional(),
  colors: z.array(z.string()).default([]),
});

export async function GET(request: Request) {
  try {
    const admin = requireAdmin(request);
    if (!admin.ok) return admin.response;

    const rows = await db
      .select()
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .orderBy(desc(productsTable.createdAt));

    const products = rows.map(({ products, categories }) =>
      formatProduct(products, {
        categoryId: categories?.id ?? null,
        categoryName: categories?.name ?? null,
        categorySlug: categories?.slug ?? null,
      }),
    );

    return NextResponse.json({ products, total: products.length });
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
          imageUrl: data.imageUrl,
          images: data.images || [],
          inStock: data.inStock ?? true,
          featured: data.featured ?? false,
          isUpsell: data.isUpsell ?? false,
          upsellDiscount: data.upsellDiscount ? String(data.upsellDiscount) : null,
          colors: data.colors || [],
        })
        .returning();

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

      return inserted;
    });

    return NextResponse.json(
      formatProduct(product, {
        categoryId: category.id,
        categoryName: category.name,
        categorySlug: category.slug,
      }),
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
