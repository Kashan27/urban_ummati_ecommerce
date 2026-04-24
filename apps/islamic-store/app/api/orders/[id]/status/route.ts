import { NextRequest, NextResponse } from "next/server";
import { db, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateOrderStatusBody, UpdateOrderStatusParams } from "@workspace/api-zod";
import { formatOrder } from "@/lib/api-formatters";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = requireAdmin(request);
    if (!admin.ok) return admin.response;

    const { id } = await context.params;
    const body = await request.json();

    const idParsed = UpdateOrderStatusParams.safeParse({ id: parseInt(id, 10) });
    const bodyParsed = UpdateOrderStatusBody.safeParse(body);

    if (!idParsed.success || !bodyParsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const statusMap: Record<string, number> = {
      received: 1,
      processed: 2,
      shipped: 3,
    };

    const statusId = statusMap[bodyParsed.data.status];
    if (!statusId) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const [order] = await db
      .update(ordersTable)
      .set({ statusId })
      .where(eq(ordersTable.id, idParsed.data.id))
      .returning();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(formatOrder(order, bodyParsed.data.status));
  } catch (err) {
    console.error("Error updating order status", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
