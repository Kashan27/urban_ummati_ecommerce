import { NextResponse } from "next/server";
import { db, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetOrderParams } from "@workspace/api-zod";
import { formatOrder } from "@/lib/api-formatters";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: { id: string } },
) {
  try {
    const { id } = context.params;
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

    return NextResponse.json(formatOrder(order));
  } catch (err) {
    console.error("Error getting order", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
