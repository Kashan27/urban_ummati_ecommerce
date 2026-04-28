import { NextRequest, NextResponse } from "next/server";
import { collectionsTable, db } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

const ParamsSchema = z.object({ id: z.number().int().positive() });
const UpdateCollectionBody = z.object({
  name: z.string().min(2).optional(),
  isActive: z.boolean().optional(),
});

function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = requireAdmin(request);
    if (!admin.ok) return admin.response;

    const { id } = await context.params;
    const idParsed = ParamsSchema.safeParse({ id: parseInt(id, 10) });
    if (!idParsed.success) {
      return NextResponse.json({ error: "Invalid collection ID" }, { status: 400 });
    }

    const body = await request.json();
    const bodyParsed = UpdateCollectionBody.safeParse(body);
    if (!bodyParsed.success) {
      return NextResponse.json({ error: "Invalid collection data" }, { status: 400 });
    }

    const current = await db
      .select()
      .from(collectionsTable)
      .where(eq(collectionsTable.id, idParsed.data.id))
      .limit(1);
    if (current.length === 0) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    const nextName = bodyParsed.data.name?.trim() || current[0].name;
    const nextSlug = toSlug(nextName);

    const [collection] = await db
      .update(collectionsTable)
      .set({
        name: nextName,
        slug: nextSlug,
        isActive: bodyParsed.data.isActive ?? current[0].isActive,
        updatedAt: new Date(),
      })
      .where(eq(collectionsTable.id, idParsed.data.id))
      .returning();

    return NextResponse.json(collection);
  } catch (err) {
    console.error("Error updating collection", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = requireAdmin(request);
    if (!admin.ok) return admin.response;

    const { id } = await context.params;
    const parsed = ParamsSchema.safeParse({ id: parseInt(id, 10) });
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid collection ID" }, { status: 400 });
    }

    const [collection] = await db
      .update(collectionsTable)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(collectionsTable.id, parsed.data.id))
      .returning();

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting collection", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

