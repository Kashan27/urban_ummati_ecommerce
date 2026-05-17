import { db, ordersTable, productsTable, orderItemsTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";

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
  console.info("[ShipStation] START shipStationCreateOrUpdateOrder", { orderId, timestamp: new Date().toISOString() });
  
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
  if (!order) {
    console.error("[ShipStation] ORDER_NOT_FOUND", { orderId });
    throw new Error("ORDER_NOT_FOUND");
  }

  console.info("[ShipStation] order fetched", {
    orderId: order.id,
    shipstationOrderId: order.shipstationOrderId,
    paymentStatus: order.paymentStatus,
  });

  if (order.shipstationOrderId) {
    console.info("[ShipStation] skip createorder (already synced)", {
      orderId: order.id,
      shipstationOrderId: order.shipstationOrderId,
      shipstationOrderKey: order.shipstationOrderKey,
    });
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

  const orderItemRows = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));

  const orderItems = orderItemRows.map((item) => ({
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
  let totalWeightGrams = 0;
  let maxLengthInches = 0;
  let maxWidthInches = 0;
  let maxHeightInches = 0;

  // Conversion factors
  const KG_TO_GRAMS = 1000;
  const CM_TO_INCHES = 0.393701;

  // Fetch product dimensions from database for items that don't have them
   const productIds = [...new Set(orderItems.map(item => item.productId).filter(Boolean))];
   const productsData = productIds.length > 0 
     ? await db.select().from(productsTable).where(inArray(productsTable.id, productIds))
     : [];
   
   // Create a map for quick lookup
   const productMap = new Map(productsData.map(p => [p.id, p]));

  for (const item of orderItems) {
    const quantity = Number(item.quantity || 1);
    
    // Try to get dimensions from order item first, fallback to product table
    let itemWeightKg = Number(item.weight || 0);
    let itemLengthCm = Number(item.length || 0);
    let itemWidthCm = Number(item.width || 0);
    let itemHeightCm = Number(item.height || 0);
    
    // If dimensions are missing from order item, fetch from product table
    if ((!itemWeightKg || !itemLengthCm || !itemWidthCm || !itemHeightCm) && item.productId) {
      const product = productMap.get(item.productId);
      if (product) {
        if (!itemWeightKg && product.weight) {
          itemWeightKg = parseFloat(product.weight);
        }
        if (!itemLengthCm && product.length) {
          itemLengthCm = parseFloat(product.length);
        }
        if (!itemWidthCm && product.width) {
          itemWidthCm = parseFloat(product.width);
        }
        if (!itemHeightCm && product.height) {
          itemHeightCm = parseFloat(product.height);
        }
      }
    }

    if (Number.isFinite(itemWeightKg) && itemWeightKg > 0) {
      totalWeightGrams += itemWeightKg * KG_TO_GRAMS * quantity;
    }
    if (Number.isFinite(itemLengthCm) && itemLengthCm > 0) {
      maxLengthInches = Math.max(maxLengthInches, itemLengthCm * CM_TO_INCHES);
    }
    if (Number.isFinite(itemWidthCm) && itemWidthCm > 0) {
      maxWidthInches = Math.max(maxWidthInches, itemWidthCm * CM_TO_INCHES);
    }
    if (Number.isFinite(itemHeightCm) && itemHeightCm > 0) {
      maxHeightInches = Math.max(maxHeightInches, itemHeightCm * CM_TO_INCHES);
    }
  }

  const payload = {
    orderNumber,
    orderKey,
    orderDate: order.createdAt.toISOString(),
    paymentDate: (order.paidAt ?? new Date()).toISOString(),
    orderStatus: "awaiting_shipment",
    customerEmail: order.customerEmail,
    weight:
      totalWeightGrams > 0
        ? { value: totalWeightGrams, units: "grams" }
        : undefined,
    dimensions:
      maxLengthInches > 0 && maxWidthInches > 0 && maxHeightInches > 0
        ? {
            length: maxLengthInches,
            width: maxWidthInches,
            height: maxHeightInches,
            units: "inches",
          }
        : undefined,
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
    items: orderItems.map((item, idx) => {
      // Convert kg to grams for ShipStation
      const itemWeightKg = Number(item.weight || 0);
      const itemWeightGrams = itemWeightKg > 0 ? itemWeightKg * KG_TO_GRAMS : undefined;
      
      return {
        lineItemKey: `${order.id}-${idx + 1}`,
        sku: String(item.productId),
        name: item.productName,
        quantity: item.quantity,
        unitPrice: Number(item.price) || 0,
        imageUrl: item.productImage ?? null,
        weight: itemWeightGrams ? { value: itemWeightGrams, units: "grams" } : undefined,
      };
    }),
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

  console.info(payload)

  console.info("[ShipStation] raw order items from DB", {
    orderId: order.id,
    items: orderItems.map((item) => ({
      productId: item.productId,
      name: item.productName,
      quantity: item.quantity,
      raw_weight: item.weight,
      raw_length: item.length, 
      raw_width: item.width,
      raw_height: item.height,
    })),
  });

  console.info("[ShipStation] converted values", {
    orderId: order.id,
    totalWeightGrams,
    maxLengthInches,
    maxWidthInches,
    maxHeightInches,
  });

  console.info("[ShipStation] createorder payload", {
    orderId: order.id,
    orderNumber,
    weight: payload.weight,
    dimensions: payload.dimensions,
    items: payload.items.map((item) => ({
      sku: item.sku,
      quantity: item.quantity,
      weight: item.weight,
    })),
  });

  const created = await shipStationRequest<ShipStationCreateOrderResponse>(
    "/orders/createorder",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  console.info("[ShipStation] createorder response", {
    orderId: order.id,
    shipstationOrderId: created.orderId,
    shipstationOrderKey: created.orderKey,
    shipstationOrderNumber: created.orderNumber,
  });

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
    `/fulfillments?orderId=${encodeURIComponent(shipstationOrderId)}&includeShipmentItems=false&page=1&pageSize=50`,
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
