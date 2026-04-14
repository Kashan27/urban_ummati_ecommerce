import { NextResponse } from "next/server";
import { db, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  DeleteProductParams,
  UpdateProductBody,
  UpdateProductParams,
} from "@workspace/api-zod";
import { formatProduct } from "@/lib/api-formatters";

export const runtime = "nodejs";

export async function PUT(
  request: Request,
  context: { params: { id: string } },
) {
  try {
    const { id } = context.params;
    const body = await request.json();

    const idParsed = UpdateProductParams.safeParse({ id: parseInt(id, 10) });
    const bodyParsed = UpdateProductBody.safeParse(body);

    if (!idParsed.success || !bodyParsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const data = bodyParsed.data;
    const [product] = await db
      .update(productsTable)
      .set({
        name: data.name,
        description: data.description,
        price: String(data.price),
        comparePrice: data.comparePrice ? String(data.comparePrice) : null,
        category: data.category,
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

    return NextResponse.json(formatProduct(product));
  } catch (err) {
    console.error("Error updating product", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: { id: string } },
) {
  try {
    const { id } = context.params;
    const parsed = DeleteProductParams.safeParse({ id: parseInt(id, 10) });

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
