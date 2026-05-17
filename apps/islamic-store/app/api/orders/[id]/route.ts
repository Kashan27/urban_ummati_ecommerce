import { NextRequest, NextResponse } from "next/server";
import { db, ordersTable, orderItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetOrderParams } from "@workspace/api-zod";
import { formatOrder } from "@/lib/api-formatters";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const parsed = GetOrderParams.safeParse({ id: parseInt(id, 10) });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, parsed.data.id));

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const itemRows = await db
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, order.id));

    const items = itemRows.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      price: parseFloat(item.unitPrice),
      quantity: item.quantity,
      color: item.color,
      total: parseFloat(item.lineTotal),
      weight: item.weight ? parseFloat(item.weight) : null,
      length: item.length ? parseFloat(item.length) : null,
      width: item.width ? parseFloat(item.width) : null,
      height: item.height ? parseFloat(item.height) : null,
    }));

    return NextResponse.json(formatOrder(order, undefined, items.length ? items : undefined));
  } catch (err) {
    console.error("Error getting order", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
