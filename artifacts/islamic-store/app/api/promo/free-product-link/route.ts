import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { db, freeProductLinksTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateFreeProductLinkBody } from "@workspace/api-zod";
import { formatFreeProductLink } from "@/lib/api-formatters";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CreateFreeProductLinkBody.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const [link] = await db
      .insert(freeProductLinksTable)
      .values({
        token,
        productId: parsed.data.productId,
      })
      .returning();

    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, link.productId));

    return NextResponse.json(formatFreeProductLink(link, product), { status: 201 });
  } catch (err) {
    console.error("Error creating free product link", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
