import { NextRequest, NextResponse } from "next/server";
import { categoriesTable, db, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

const ParamsSchema = z.object({ id: z.number().int().positive() });
const UpdateCategoryBody = z.object({
  name: z.string().min(2).optional(),
  imageUrl: z.string().url().optional(),
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
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const body = await request.json();
    const bodyParsed = UpdateCategoryBody.safeParse(body);
    if (!bodyParsed.success) {
      return NextResponse.json({ error: "Invalid category data" }, { status: 400 });
    }

    const current = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, idParsed.data.id))
      .limit(1);
    if (current.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const nextName = bodyParsed.data.name?.trim() || current[0].name;
    const nextSlug = toSlug(nextName);

    const [category] = await db
      .update(categoriesTable)
      .set({
        name: nextName,
        slug: nextSlug,
        imageUrl: bodyParsed.data.imageUrl ?? current[0].imageUrl,
        isActive: bodyParsed.data.isActive ?? current[0].isActive,
        updatedAt: new Date(),
      })
      .where(eq(categoriesTable.id, idParsed.data.id))
      .returning();

    return NextResponse.json(category);
  } catch (err) {
    console.error("Error updating category", err);
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
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const [category] = await db
      .update(categoriesTable)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(categoriesTable.id, parsed.data.id))
      .returning();

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting category", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
