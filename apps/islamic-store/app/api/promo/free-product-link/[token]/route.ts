import { NextRequest, NextResponse } from "next/server";
import { db, freeProductLinksTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetFreeProductLinkParams } from "@workspace/api-zod";
import { formatFreeProductLink } from "@/lib/api-formatters";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    const parsed = GetFreeProductLinkParams.safeParse({ token });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const [link] = await db
      .select()
      .from(freeProductLinksTable)
      .where(eq(freeProductLinksTable.token, parsed.data.token));

    if (!link) {
      return NextResponse.json(
        { error: "Free product link not found" },
        { status: 404 },
      );
    }

    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, link.productId));

    return NextResponse.json(formatFreeProductLink(link, product));
  } catch (err) {
    console.error("Error getting free product link", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
