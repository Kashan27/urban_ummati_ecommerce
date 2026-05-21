import { NextRequest, NextResponse } from "next/server";
import { db, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { shipStationRefreshOrderShipment } from "../service";

export const runtime = "nodejs";

/**
 * ShipStation Webhook Handler
 * URL: /api/integrations/shipstation/webhook
 * 
 * ShipStation sends a POST request to this URL when a subscribed event occurs.
 * For ORDER_SHIPPED events, the resource_url will point to a list of shipments/fulfillments.
 */
export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  console.info(`[ShipStation Webhook] [${timestamp}] Received POST request`);

  try {
    const body = await request.json();
    console.info(`[ShipStation Webhook] [${timestamp}] Payload:`, JSON.stringify(body, null, 2));

    const { resource_url, resource_type } = body;

    if (!resource_url) {
      console.warn(`[ShipStation Webhook] [${timestamp}] Missing resource_url in payload`);
      return NextResponse.json({ error: "Missing resource_url" }, { status: 400 });
    }

    // ShipStation sends webhooks for various events. We primarily care about shipments.
    // Note: resource_type for shipping events is usually "shipment"
    console.info(`[ShipStation Webhook] [${timestamp}] Processing ${resource_type} update from: ${resource_url}`);

    /**
     * ShipStation webhooks for SHIP_NOTIFY/ORDER_SHIPPED usually provide a URL 
     * that contains the order information or shipment information.
     * 
     * However, the most reliable way to sync is to use the resource_url to find the
     * ShipStation Order ID and then trigger our existing refresh logic.
     */
    
    // Attempt to extract orderId from the resource_url if possible, 
    // or fetch the resource to see which order it belongs to.
    // For now, we fetch the resource_url (which requires auth)
    
    const authHeader = request.headers.get("Authorization");
    // ShipStation doesn't sign webhooks with a secret in the same way Stripe does,
    // but they can be configured to use Basic Auth. 
    // If you add Basic Auth in ShipStation, check it here.

    // 1. Fetch the resource from ShipStation to see what changed
    const authHeaderValue = process.env.SHIPSTATION_API_KEY && process.env.SHIPSTATION_API_SECRET
      ? `Basic ${Buffer.from(`${process.env.SHIPSTATION_API_KEY}:${process.env.SHIPSTATION_API_SECRET}`).toString("base64")}`
      : null;

    if (!authHeaderValue) {
      console.error(`[ShipStation Webhook] [${timestamp}] SHIPSTATION_API_KEY or SECRET not configured`);
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const res = await fetch(resource_url, {
      headers: {
        Authorization: authHeaderValue,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[ShipStation Webhook] [${timestamp}] Failed to fetch resource from ${resource_url}. Status: ${res.status}. Error: ${errorText}`);
      return NextResponse.json({ error: "Failed to fetch resource from ShipStation" }, { status: 502 });
    }

    const resourceData = await res.json();
    console.info(`[ShipStation Webhook] [${timestamp}] Resource Data:`, JSON.stringify(resourceData, null, 2));

    // The resource_url for a shipment webhook usually returns an object containing shipments.
    // We need to find our internal order(s) associated with the ShipStation Order IDs in this resource.
    
    const shipments = resourceData.shipments || resourceData.fulfillments || (resourceData.shipmentId ? [resourceData] : []);
    
    if (!shipments || shipments.length === 0) {
      console.warn(`[ShipStation Webhook] [${timestamp}] No shipments/fulfillments found in resource data`);
      return NextResponse.json({ message: "No action required" });
    }

    let updatedCount = 0;
    for (const ship of shipments) {
      const ssOrderId = ship.orderId;
      if (!ssOrderId) continue;

      console.info(`[ShipStation Webhook] [${timestamp}] Finding local order for ShipStation Order ID: ${ssOrderId}`);
      
      const [order] = await db
        .select({ id: ordersTable.id })
        .from(ordersTable)
        .where(eq(ordersTable.shipstationOrderId, String(ssOrderId)))
        .limit(1);

      if (order) {
        console.info(`[ShipStation Webhook] [${timestamp}] Found local Order #${order.id}. Triggering refresh...`);
        const result = await shipStationRefreshOrderShipment(order.id);
        if (result.updated) updatedCount++;
        console.info(`[ShipStation Webhook] [${timestamp}] Refresh result for Order #${order.id}:`, result);
      } else {
        console.warn(`[ShipStation Webhook] [${timestamp}] No local order found for ShipStation Order ID: ${ssOrderId}`);
      }
    }

    return NextResponse.json({ 
      received: true, 
      processed: shipments.length, 
      updated: updatedCount 
    });

  } catch (err) {
    console.error(`[ShipStation Webhook] [${timestamp}] Critical Error:`, err);
    return NextResponse.json(
      { error: "Internal server error", details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
