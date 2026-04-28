import { NextResponse } from "next/server";
import { db, ordersTable, productsTable, orderStatusesTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { formatOrder } from "@/lib/api-formatters";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const admin = requireAdmin(request);
    if (!admin.ok) return admin.response;

    const [ordersWithStatus, allProducts] = await Promise.all([
      db
        .select({
          order: ordersTable,
          statusName: orderStatusesTable.name,
        })
        .from(ordersTable)
        .leftJoin(orderStatusesTable, eq(ordersTable.statusId, orderStatusesTable.id))
        .orderBy(desc(ordersTable.createdAt)),
      db.select().from(productsTable),
    ]);

    const totalRevenue = ordersWithStatus.reduce((sum, r) => {
      if (r.order.paymentStatus && r.order.paymentStatus !== "paid") return sum;
      return sum + parseFloat(r.order.total);
    }, 0);
    const ordersByStatus = {
      received: ordersWithStatus.filter((r) => r.statusName === "received").length,
      processed: ordersWithStatus.filter((r) => r.statusName === "processed").length,
      shipped: ordersWithStatus.filter((r) => r.statusName === "shipped").length,
    };

    return NextResponse.json({
      totalOrders: ordersWithStatus.length,
      totalRevenue,
      pendingOrders: ordersByStatus.received,
      totalProducts: allProducts.length,
      recentOrders: ordersWithStatus
        .slice(0, 10)
        .map((r) => formatOrder(r.order, r.statusName ?? undefined)),
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
