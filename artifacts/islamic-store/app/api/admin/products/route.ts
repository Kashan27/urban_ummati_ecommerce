import { NextResponse } from "next/server";
import { db, productsTable } from "@workspace/db";
import { CreateProductBody } from "@workspace/api-zod";
import { formatProduct } from "@/lib/api-formatters";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CreateProductBody.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
    }

    const data = parsed.data;
    const [product] = await db
      .insert(productsTable)
      .values({
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
      .returning();

    return NextResponse.json(formatProduct(product), { status: 201 });
  } catch (err) {
    console.error("Error creating product", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
