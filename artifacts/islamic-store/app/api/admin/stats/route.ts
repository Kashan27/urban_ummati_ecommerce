import { NextResponse } from "next/server";
import { db, ordersTable, productsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { formatOrder } from "@/lib/api-formatters";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [allOrders, allProducts] = await Promise.all([
      db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)),
      db.select().from(productsTable),
    ]);

    const totalRevenue = allOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const ordersByStatus = {
      received: allOrders.filter((order) => order.status === "received").length,
      processed: allOrders.filter((order) => order.status === "processed").length,
      shipped: allOrders.filter((order) => order.status === "shipped").length,
    };

    return NextResponse.json({
      totalOrders: allOrders.length,
      totalRevenue,
      pendingOrders: ordersByStatus.received,
      totalProducts: allProducts.length,
      recentOrders: allOrders.slice(0, 10).map(formatOrder),
      ordersByStatus,
    });
  } catch (err) {
    console.error("Error getting admin stats", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
