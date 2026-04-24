import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { db, freeProductLinksTable, productsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { CreateFreeProductLinkBody } from "@workspace/api-zod";
import { formatFreeProductLink } from "@/lib/api-formatters";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const admin = requireAdmin(request);
    if (!admin.ok) return admin.response;

    const links = await db
      .select({
        link: freeProductLinksTable,
        product: productsTable,
      })
      .from(freeProductLinksTable)
      .leftJoin(productsTable, eq(freeProductLinksTable.productId, productsTable.id))
      .orderBy(desc(freeProductLinksTable.createdAt));

    return NextResponse.json({
      links: links.map((r) => formatFreeProductLink(r.link, r.product ?? undefined)),
      total: links.length,
    });
  } catch (err) {
    console.error("Error listing free product links", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = requireAdmin(request);
    if (!admin.ok) return admin.response;

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
