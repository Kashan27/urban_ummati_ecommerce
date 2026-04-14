import { NextResponse } from "next/server";
import { db, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { formatProduct } from "@/lib/api-formatters";

export const runtime = "nodejs";

export async function GET() {
  try {
    const products = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.isUpsell, true))
      .limit(4);

    return NextResponse.json({ products: products.map(formatProduct) });
  } catch (err) {
    console.error("Error getting upsell products", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
