import { db, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

type ShipStationCreateOrderResponse = {
  orderId: number;
  orderKey: string;
  orderNumber: string;
};

type ShipStationShipmentsResponse = {
  shipments?: Array<{
    shipmentId?: number;
    shipmentStatus?: string;
    trackingNumber?: string;
    carrierCode?: string;
    serviceCode?: string;
    shipDate?: string;
  }>;
};

function getAuthHeader() {
  const key = process.env.SHIPSTATION_API_KEY;
  const secret = process.env.SHIPSTATION_API_SECRET;
  if (!key || !secret) return null;
  const token = Buffer.from(`${key}:${secret}`).toString("base64");
  return `Basic ${token}`;
}

function getCountryCode(country: string) {
  const normalized = country.trim().toLowerCase();
  if (normalized === "canada") return "CA";
  if (normalized === "united states" || normalized === "usa" || normalized === "us") return "US";
  if (country.length === 2) return country.toUpperCase();
  return country;
}

async function shipStationRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const auth = getAuthHeader();
  if (!auth) {
    throw new Error("SHIPSTATION_NOT_CONFIGURED");
  }

  const response = await fetch(`https://ssapi.shipstation.com${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`SHIPSTATION_HTTP_${response.status}:${text}`);
  }

  return (await response.json()) as T;
}

export async function shipStationCreateOrUpdateOrder(orderId: number) {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
  if (!order) throw new Error("ORDER_NOT_FOUND");

  if (order.shipstationOrderId) {
    return { alreadySynced: true as const, shipstationOrderId: order.shipstationOrderId };
  }

  const total = Number(order.total);
  if (order.paymentStatus !== "paid" && total > 0 && !order.isFreeOrder) {
    throw new Error("ORDER_NOT_PAID");
  }

  const storeIdRaw = process.env.SHIPSTATION_STORE_ID;
  const storeId = storeIdRaw ? Number(storeIdRaw) : null;

  const orderNumber = `UU-${order.id.toString().padStart(6, "0")}`;
  const orderKey = `uu-${order.id}`;

  const shipToCountry = getCountryCode(order.country ?? "Canada");

  const payload = {
    orderNumber,
    orderKey,
    orderDate: order.createdAt.toISOString(),
    paymentDate: (order.paidAt ?? new Date()).toISOString(),
    orderStatus: "awaiting_shipment",
    customerEmail: order.customerEmail,
    billTo: {
      name: order.customerName,
      street1: order.shippingAddress,
      city: order.city,
      state: order.province,
      postalCode: order.postalCode,
      country: shipToCountry,
      phone: order.customerPhone,
      residential: true,
    },
    shipTo: {
      name: order.customerName,
      street1: order.shippingAddress,
      city: order.city,
      state: order.province,
      postalCode: order.postalCode,
      country: shipToCountry,
      phone: order.customerPhone,
      residential: true,
    },
    items: (order.items as any[]).map((item, idx) => ({
      lineItemKey: `${order.id}-${idx + 1}`,
      sku: String(item.productId),
      name: item.productName,
      quantity: item.quantity,
      unitPrice: Number(item.price) || 0,
      imageUrl: item.productImage ?? null,
    })),
    amountPaid: total,
    taxAmount: Number(order.tax),
    shippingAmount: Number(order.shippingCost),
    paymentMethod: order.paymentProvider === "stripe" ? "Stripe" : undefined,
    advancedOptions: {
      storeId: storeId && Number.isFinite(storeId) ? storeId : undefined,
      source: "Urban Ummati",
      customField1: String(order.id),
    },
  };

  const created = await shipStationRequest<ShipStationCreateOrderResponse>(
    "/orders/createorder",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  await db
    .update(ordersTable)
    .set({
      shipstationOrderId: String(created.orderId),
      shipstationOrderKey: created.orderKey ?? orderKey,
      shipstationSyncedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(ordersTable.id, order.id));

  return { alreadySynced: false as const, shipstationOrderId: String(created.orderId) };
}

export async function shipStationListShipmentsByOrderId(shipstationOrderId: string) {
  return shipStationRequest<ShipStationShipmentsResponse>(
    `/shipments?orderId=${encodeURIComponent(shipstationOrderId)}&includeShipmentItems=false&page=1&pageSize=50`,
    { method: "GET" },
  );
}

export async function shipStationRefreshOrderShipment(orderId: number) {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
  if (!order) throw new Error("ORDER_NOT_FOUND");
  if (!order.shipstationOrderId) throw new Error("ORDER_NOT_SYNCED");

  const shipments = await shipStationListShipmentsByOrderId(order.shipstationOrderId);
  const shipment = shipments.shipments?.[0];
  if (!shipment) {
    return { updated: false as const };
  }

  const shipDate = shipment.shipDate ? new Date(shipment.shipDate) : null;
  const isShipped = Boolean(shipment.trackingNumber) || Boolean(shipDate);

  await db
    .update(ordersTable)
    .set({
      shipstationShipmentId: shipment.shipmentId ? String(shipment.shipmentId) : null,
      shipstationShipmentStatus: shipment.shipmentStatus ?? null,
      shipstationTrackingNumber: shipment.trackingNumber ?? null,
      shipstationCarrierCode: shipment.carrierCode ?? null,
      shipstationServiceCode: shipment.serviceCode ?? null,
      shippedAt: isShipped ? (shipDate ?? new Date()) : null,
      statusId: isShipped ? 3 : order.statusId,
      updatedAt: new Date(),
    })
    .where(eq(ordersTable.id, order.id));

  return { updated: true as const, isShipped };
}
