import { NextRequest, NextResponse } from "next/server";
import { db, productCollectionsTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

const ParamsSchema = z.object({ id: z.number().int().positive() });

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const admin = requireAdmin(request);
  if (!admin.ok) return admin.response;

  const { id } = await context.params;
  const idParsed = ParamsSchema.safeParse({ id: parseInt(id, 10) });
  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  const rows = await db
    .select({ collectionId: productCollectionsTable.collectionId })
    .from(productCollectionsTable)
    .where(
      and(
        eq(productCollectionsTable.productId, idParsed.data.id),
        eq(productCollectionsTable.isActive, true),
      ),
    );

  return NextResponse.json({ collectionIds: rows.map((r) => r.collectionId) });
}

