import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { db, freeProductLinksTable, productsTable, freeProductRedemptionsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { CreateFreeProductLinkBody } from "@workspace/api-zod";
import { formatFreeProductLink, loadProductMediaMaps } from "@/lib/api-formatters";
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
      .where(eq(freeProductLinksTable.status, "active")) // Only show active links by default or add filter
      .orderBy(desc(freeProductLinksTable.createdAt));

    const productIds = links.map((r) => r.link.productId).filter(Boolean);
    const { imagesByProductId, colorsByProductId } = await loadProductMediaMaps(productIds);

    const linksWithRedemptions = await Promise.all(
      links.map(async (r) => {
        const redemptions = await db
          .select()
          .from(freeProductRedemptionsTable)
          .where(eq(freeProductRedemptionsTable.linkId, r.link.id))
          .orderBy(desc(freeProductRedemptionsTable.usedAt));

        return formatFreeProductLink(
          r.link,
          r.product ?? undefined,
          redemptions,
          imagesByProductId.get(r.link.productId),
          colorsByProductId.get(r.link.productId),
        );
      })
    );

    return NextResponse.json({
      links: linksWithRedemptions,
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
      return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const [link] = await db
      .insert(freeProductLinksTable)
      .values({
        token,
        productId: parsed.data.productId,
        type: parsed.data.type || "single-use",
        usageLimit: parsed.data.usageLimit || 1,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
        notes: parsed.data.notes,
        status: "active",
      })
      .returning();

    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, link.productId));

    const { imagesByProductId, colorsByProductId } = await loadProductMediaMaps([link.productId]);

    return NextResponse.json(formatFreeProductLink(
      link,
      product,
      undefined,
      imagesByProductId.get(link.productId),
      colorsByProductId.get(link.productId),
    ), { status: 201 });
  } catch (err) {
    console.error("Error creating free product link", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
