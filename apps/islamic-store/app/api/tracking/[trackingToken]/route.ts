import { NextRequest, NextResponse } from "next/server";
import { db, ordersTable, orderItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { shipStationListShipmentsByOrderId } from "../../integrations/shipstation/service";
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

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.trackingToken, trackingToken));

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

    let shipmentData = null;
    if (order.shipstationOrderId) {
      try {
        console.log(`[Tracking] Fetching shipments for ShipStation Order ID: ${order.shipstationOrderId}`);
        const shipments = await shipStationListShipmentsByOrderId(order.shipstationOrderId);
        console.log(`[Tracking] ShipStation response:`, JSON.stringify(shipments));

        if (shipments.shipments && shipments.shipments.length > 0) {
          shipmentData = formatShipment(shipments.shipments[0] as any);
        } else {
          console.log(`[Tracking] No shipments found in ShipStation for order ${order.id}`);
        }
      } catch (shipstationError) {
        console.error(
          `Could not fetch ShipStation shipment for order ${order.id}:`,
          shipstationError,
        );
      }
    } else {
      console.log(`[Tracking] No ShipStation Order ID found in DB for order ${order.id}`);
    }

    return NextResponse.json({
      order: formatOrder(order, undefined, items),
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
