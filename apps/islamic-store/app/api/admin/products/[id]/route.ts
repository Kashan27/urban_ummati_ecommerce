import { NextResponse } from "next/server";
import { categoriesTable, db, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
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
  imageUrl: imageValueSchema,
  images: z.array(imageValueSchema).default([]),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  isUpsell: z.boolean().default(false),
  upsellDiscount: z.coerce.number().nullable().optional(),
  colors: z.array(z.string()).default([]),
});

export async function PUT(
  request: Request,
  context: { params: { id: string } },
) {
  try {
    const admin = requireAdmin(request);
    if (!admin.ok) return admin.response;

    const { id } = context.params;
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

    const [product] = await db
      .update(productsTable)
      .set({
        name: data.name,
        description: data.description,
        status: data.status,
        price: String(data.price),
        comparePrice: data.comparePrice ? String(data.comparePrice) : null,
        category: category.slug,
        categoryId: category.id,
        imageUrl: data.imageUrl,
        images: data.images || [],
        inStock: data.inStock ?? true,
        featured: data.featured ?? false,
        isUpsell: data.isUpsell ?? false,
        upsellDiscount: data.upsellDiscount ? String(data.upsellDiscount) : null,
        colors: data.colors || [],
      })
      .where(eq(productsTable.id, idParsed.data.id))
      .returning();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      formatProduct(product, {
        categoryId: category.id,
        categoryName: category.name,
        categorySlug: category.slug,
      }),
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
  request: Request,
  context: { params: { id: string } },
) {
  try {
    const admin = requireAdmin(request);
    if (!admin.ok) return admin.response;

    const { id } = context.params;
    const parsed = ProductIdParams.safeParse({ id: parseInt(id, 10) });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    await db.delete(productsTable).where(eq(productsTable.id, parsed.data.id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting product", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
