import { NextResponse } from "next/server";
import { db, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateOrderStatusBody, UpdateOrderStatusParams } from "@workspace/api-zod";
import { formatOrder } from "@/lib/api-formatters";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: { id: string } },
) {
  try {
    const { id } = context.params;
    const body = await request.json();

    const idParsed = UpdateOrderStatusParams.safeParse({ id: parseInt(id, 10) });
    const bodyParsed = UpdateOrderStatusBody.safeParse(body);

    if (!idParsed.success || !bodyParsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const [order] = await db
      .update(ordersTable)
      .set({ status: bodyParsed.data.status })
      .where(eq(ordersTable.id, idParsed.data.id))
      .returning();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(formatOrder(order));
  } catch (err) {
    console.error("Error updating order status", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
