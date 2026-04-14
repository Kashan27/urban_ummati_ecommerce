import { NextResponse } from "next/server";
import { db, productsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { formatProduct } from "@/lib/api-formatters";

export const runtime = "nodejs";

export async function GET() {
  try {
    const products = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.featured, true))
      .orderBy(desc(productsTable.reviewCount))
      .limit(8);

    return NextResponse.json({ products: products.map(formatProduct) });
  } catch (err) {
    console.error("Error getting featured products", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
