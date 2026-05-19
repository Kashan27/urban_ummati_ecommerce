import { NextRequest, NextResponse } from "next/server";
import { db, ordersTable, orderItemsTable, orderStatusesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { shipStationListShipmentsByOrderId, shipStationRefreshOrderShipment } from "../../integrations/shipstation/service";
import { formatOrder, formatShipment } from "@/lib/api-formatters";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ trackingToken: string }> },
) {
  try {
    const { trackingToken } = await context.params;

    if (!trackingToken) {
      return NextResponse.json({ error: "Tracking token is required" }, { status: 400 });
    }

    // 1. Find the order first
    const [orderRow] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.trackingToken, trackingToken))
      .limit(1);

    if (!orderRow) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2. Trigger JIT Refresh if not already delivered
    // This keeps the local DB in sync with ShipStation carrier updates
    if (orderRow.shipstationOrderId && (!orderRow.statusId || orderRow.statusId < 4)) {
      try {
        console.log(`[Tracking] Triggering JIT refresh for Order #${orderRow.id}`);
        await shipStationRefreshOrderShipment(orderRow.id);
      } catch (refreshErr) {
        console.error(`[Tracking] Failed to refresh shipment for order ${orderRow.id}:`, refreshErr);
      }
    }

    // 3. Fetch latest data with status name join
    const [latestOrderWithStatus] = await db
      .select({
        order: ordersTable,
        statusName: orderStatusesTable.name,
      })
      .from(ordersTable)
      .leftJoin(orderStatusesTable, eq(ordersTable.statusId, orderStatusesTable.id))
      .where(eq(ordersTable.id, orderRow.id))
      .limit(1);

    if (!latestOrderWithStatus) {
      return NextResponse.json({ error: "Order lost" }, { status: 404 });
    }

    const { order, statusName } = latestOrderWithStatus;

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

    let shipmentData = null;
    if (order.shipstationOrderId) {
      try {
        const shipments = await shipStationListShipmentsByOrderId(order.shipstationOrderId);
        if (shipments.shipments && shipments.shipments.length > 0) {
          shipmentData = formatShipment(shipments.shipments[0] as any);
        }
      } catch (shipstationError) {
        console.error(`[Tracking] Could not fetch ShipStation shipment for order ${order.id}:`, shipstationError);
      }
    }

    return NextResponse.json({
      order: formatOrder(order, statusName ?? undefined, items),
      shipment: shipmentData,
    });
  } catch (err) {
    console.error("Error getting order tracking", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
