import { NextRequest, NextResponse } from "next/server";
import {
  categoriesTable,
  collectionsTable,
  db,
  productCollectionsTable,
  productColorsTable,
  productImagesTable,
  productUpsellsTable,
  productsTable,
} from "@workspace/db";
import { and, eq, inArray, notInArray } from "drizzle-orm";
import { z } from "zod";
import { formatProduct } from "@/lib/api-formatters";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

const ProductIdParams = z.object({ id: z.number().int().positive() });
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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = requireAdmin(request);
    if (!admin.ok) return admin.response;

    const { id } = await context.params;
    const body = await request.json();

    const idParsed = ProductIdParams.safeParse({ id: parseInt(id, 10) });
    const bodyParsed = AdminProductBody.safeParse(body);

    if (!idParsed.success || !bodyParsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const data = bodyParsed.data;
    const [category] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, data.categoryId))
      .limit(1);

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }

    const collectionIds = Array.from(new Set((data.collectionIds || []).filter(Boolean)));
    const mainProductIds = Array.from(new Set((data.mainProductIds || []).filter(Boolean)));
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
      const [updated] = await tx
        .update(productsTable)
        .set({
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
          updatedAt: now,
        })
        .where(eq(productsTable.id, idParsed.data.id))
        .returning();

      if (!updated) return null;

      // Sync normalized images
      await tx.delete(productImagesTable).where(eq(productImagesTable.productId, updated.id));
      if (data.images && data.images.length > 0) {
        await tx.insert(productImagesTable).values(
          data.images.map((url, idx) => ({
            productId: updated.id,
            url,
            sortOrder: idx,
            updatedAt: now,
          })),
        );
      }

      // Sync normalized colors
      await tx.delete(productColorsTable).where(eq(productColorsTable.productId, updated.id));
      if (data.colors && data.colors.length > 0) {
        await tx.insert(productColorsTable).values(
          data.colors.map((color, idx) => ({
            productId: updated.id,
            hex: color.hex,
            name: color.name,
            sortOrder: idx,
            updatedAt: now,
          })),
        );
      }

      if (collectionIds.length > 0) {
        await tx
          .update(productCollectionsTable)
          .set({ isActive: false, updatedAt: now })
          .where(
            and(
              eq(productCollectionsTable.productId, updated.id),
              notInArray(productCollectionsTable.collectionId, collectionIds),
            ),
          );
      } else {
        await tx
          .update(productCollectionsTable)
          .set({ isActive: false, updatedAt: now })
          .where(eq(productCollectionsTable.productId, updated.id));
      }

      for (const collectionId of collectionIds) {
        await tx
          .insert(productCollectionsTable)
          .values({
            productId: updated.id,
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

      // Sync upsell relationships (This item IS an upsell FOR these main products)
      await tx
        .delete(productUpsellsTable)
        .where(eq(productUpsellsTable.upsellProductId, updated.id));
      
      if (mainProductIds.length > 0) {
        for (const mainId of mainProductIds) {
          await tx
            .insert(productUpsellsTable)
            .values({
              mainProductId: mainId,
              upsellProductId: updated.id,
              createdAt: now,
            })
            .onConflictDoNothing();
        }
      }

      return updated;
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

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
    );
  } catch (err) {
    console.error("Error updating product", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = requireAdmin(request);
    if (!admin.ok) return admin.response;

    const { id } = await context.params;
    const parsed = ProductIdParams.safeParse({ id: parseInt(id, 10) });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const [product] = await db
      .update(productsTable)
      .set({ status: "archived", updatedAt: new Date() })
      .where(eq(productsTable.id, parsed.data.id))
      .returning();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting product", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
