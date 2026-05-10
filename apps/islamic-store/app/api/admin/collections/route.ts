import { NextResponse } from "next/server";
import { collectionsTable, db } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

const CollectionBody = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
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

    const collections = await db
      .select()
      .from(collectionsTable)
      .orderBy(desc(collectionsTable.createdAt));

    return NextResponse.json({ collections, total: collections.length });
  } catch (err) {
    console.error("Error listing collections", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = requireAdmin(request);
    if (!admin.ok) return admin.response;

    const body = await request.json();
    const parsed = CollectionBody.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid collection data" }, { status: 400 });
    }

    const name = parsed.data.name.trim();
    const slug = toSlug(name);
    if (!slug) {
      return NextResponse.json({ error: "Invalid collection name" }, { status: 400 });
    }

    const [existingByName, existingBySlug] = await Promise.all([
      db.select().from(collectionsTable).where(eq(collectionsTable.name, name)).limit(1),
      db.select().from(collectionsTable).where(eq(collectionsTable.slug, slug)).limit(1),
    ]);

    if (existingByName.length > 0 || existingBySlug.length > 0) {
      return NextResponse.json({ error: "Collection already exists" }, { status: 409 });
    }

    const [collection] = await db
      .insert(collectionsTable)
      .values({
        name,
        slug,
        description: parsed.data.description,
        imageUrl: parsed.data.imageUrl,
        isActive: parsed.data.isActive,
      })
      .returning();

    return NextResponse.json(collection, { status: 201 });
  } catch (err) {
    console.error("Error creating collection", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

