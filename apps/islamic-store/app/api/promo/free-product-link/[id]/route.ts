import { NextRequest, NextResponse } from "next/server";
import { db, freeProductLinksTable, productsTable, freeProductRedemptionsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { UpdateFreeProductLinkBody } from "@workspace/api-zod";
import { formatFreeProductLink } from "@/lib/api-formatters";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

type Props = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const admin = requireAdmin(request);
    if (!admin.ok) return admin.response;

    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await request.json();
    const parsed = UpdateFreeProductLinkBody.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
    }

    const updates: any = {
      updatedAt: new Date(),
    };
    if (parsed.data.status) updates.status = parsed.data.status;
    if (typeof parsed.data.usageLimit === "number") updates.usageLimit = parsed.data.usageLimit;
    if (parsed.data.expiresAt !== undefined) {
      updates.expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null;
    }
    if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes;

    const [link] = await db
      .update(freeProductLinksTable)
      .set(updates)
      .where(eq(freeProductLinksTable.id, id))
      .returning();

    if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 });

    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, link.productId));

    const redemptions = await db
      .select()
      .from(freeProductRedemptionsTable)
      .where(eq(freeProductRedemptionsTable.linkId, link.id))
      .orderBy(desc(freeProductRedemptionsTable.usedAt));

    return NextResponse.json(formatFreeProductLink(link, product, redemptions));
  } catch (err) {
    console.error("Error updating free product link", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const admin = requireAdmin(request);
    if (!admin.ok) return admin.response;

    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    // Hard delete for now, or we can soft delete via status='archived'
    // The requirement says "archive" and "delete" are separate.
    // I'll implement hard delete for DELETE, and soft delete via status update.
    
    await db.delete(freeProductLinksTable).where(eq(freeProductLinksTable.id, id));

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("Error deleting free product link", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
