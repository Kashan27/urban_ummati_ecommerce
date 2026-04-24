import { NextResponse } from "next/server";
import { categoriesTable, db } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

const CategoryBody = z.object({
  name: z.string().min(2),
  isActive: z.boolean().optional().default(true),
});

function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function GET(request: Request) {
  try {
    const admin = requireAdmin(request);
    if (!admin.ok) return admin.response;

    const categories = await db
      .select()
      .from(categoriesTable)
      .orderBy(desc(categoriesTable.createdAt));

    return NextResponse.json({ categories, total: categories.length });
  } catch (err) {
    console.error("Error listing categories", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = requireAdmin(request);
    if (!admin.ok) return admin.response;

    const body = await request.json();
    const parsed = CategoryBody.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid category data" }, { status: 400 });
    }

    const name = parsed.data.name.trim();
    const slug = toSlug(name);
    if (!slug) {
      return NextResponse.json({ error: "Invalid category name" }, { status: 400 });
    }

    const [existingByName, existingBySlug] = await Promise.all([
      db.select().from(categoriesTable).where(eq(categoriesTable.name, name)).limit(1),
      db.select().from(categoriesTable).where(eq(categoriesTable.slug, slug)).limit(1),
    ]);

    if (existingByName.length > 0 || existingBySlug.length > 0) {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }

    const [category] = await db
      .insert(categoriesTable)
      .values({
        name,
        slug,
        isActive: parsed.data.isActive,
      })
      .returning();

    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    console.error("Error creating category", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
