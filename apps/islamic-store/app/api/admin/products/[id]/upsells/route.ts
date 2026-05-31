import { NextRequest, NextResponse } from "next/server";
import { db, productUpsellsTable } from "@workspace/db";
import { and, eq, inArray, notInArray } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

const ParamsSchema = z.object({ id: z.number().int().positive() });
const UpsellsBodySchema = z.object({
  upsellProductIds: z.array(z.number().int().positive())
});

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
    .select({ upsellProductId: productUpsellsTable.upsellProductId })
    .from(productUpsellsTable)
    .where(eq(productUpsellsTable.mainProductId, idParsed.data.id));

  return NextResponse.json({ upsellProductIds: rows.map((r) => r.upsellProductId) });
}

export async function PUT(
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

  const body = await request.json();
  const bodyParsed = UpsellsBodySchema.safeParse(body);
  if (!bodyParsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { upsellProductIds } = bodyParsed.data;
  const mainProductId = idParsed.data.id;

  await db.transaction(async (tx) => {
    // Delete existing relationships where this is the main product
    if (upsellProductIds.length > 0) {
      await tx
        .delete(productUpsellsTable)
        .where(
          and(
            eq(productUpsellsTable.mainProductId, mainProductId),
            notInArray(productUpsellsTable.upsellProductId, upsellProductIds)
          )
        );
    } else {
      await tx
        .delete(productUpsellsTable)
        .where(eq(productUpsellsTable.mainProductId, mainProductId));
    }

    // Insert new relationships
    for (const upsellId of upsellProductIds) {
      if (upsellId === mainProductId) continue; // Cannot upsell to self
      
      await tx
        .insert(productUpsellsTable)
        .values({
          mainProductId,
          upsellProductId: upsellId,
        })
        .onConflictDoNothing();
    }
  });

  return NextResponse.json({ success: true });
}
