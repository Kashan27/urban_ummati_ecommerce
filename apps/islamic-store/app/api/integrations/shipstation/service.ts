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
    deliveryDate?: string;
  }>;
  fulfillments?: Array<{
    fulfillmentId?: number;
    shipmentStatus?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    carrierCode?: string;
    serviceCode?: string;
    shipDate?: string;
    deliveryDate?: string;
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
    let itemWeightGrams = Number(item.weight || 0);
    let itemLengthInches = Number(item.length || 0);
    let itemWidthInches = Number(item.width || 0);
    let itemHeightInches = Number(item.height || 0);
    
    // If dimensions are missing from order item, fetch from product table
    if ((!itemWeightGrams || !itemLengthInches || !itemWidthInches || !itemHeightInches) && item.productId) {
      const product = productMap.get(item.productId);
      if (product) {
        if (!itemWeightGrams && product.weight) {
          itemWeightGrams = parseFloat(product.weight);
        }
        if (!itemLengthInches && product.length) {
          itemLengthInches = parseFloat(product.length);
        }
        if (!itemWidthInches && product.width) {
          itemWidthInches = parseFloat(product.width);
        }
        if (!itemHeightInches && product.height) {
          itemHeightInches = parseFloat(product.height);
        }
      }
    }

    if (Number.isFinite(itemWeightGrams) && itemWeightGrams > 0) {
      totalWeightGrams += itemWeightGrams * quantity;
    }
    if (Number.isFinite(itemLengthInches) && itemLengthInches > 0) {
      maxLengthInches = Math.max(maxLengthInches, itemLengthInches);
    }
    if (Number.isFinite(itemWidthInches) && itemWidthInches > 0) {
      maxWidthInches = Math.max(maxWidthInches, itemWidthInches);
    }
    if (Number.isFinite(itemHeightInches) && itemHeightInches > 0) {
      maxHeightInches = Math.max(maxHeightInches, itemHeightInches);
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
      const itemWeightGrams = Number(item.weight || 0);
      
      return {
        lineItemKey: `${order.id}-${idx + 1}`,
        sku: String(item.productId),
        name: item.productName,
        quantity: item.quantity,
        unitPrice: Number(item.price) || 0,
        imageUrl: item.productImage ?? null,
        weight: itemWeightGrams > 0 ? { value: itemWeightGrams, units: "grams" } : undefined,
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

  const response = await shipStationListShipmentsByOrderId(order.shipstationOrderId);
  
  // Extract data from either shipments or fulfillments array
  const shipment = response.shipments?.[0] || response.fulfillments?.[0];
  
  if (!shipment) {
    return { updated: false as const };
  }

  const shipDate = shipment.shipDate ? new Date(shipment.shipDate) : null;
  const deliveryDate = shipment.deliveryDate ? new Date(shipment.deliveryDate) : null;
  const isShipped = Boolean(shipment.trackingNumber) || Boolean(shipDate);
  const isDelivered = Boolean(deliveryDate);

  let statusId = order.statusId;
  if (isDelivered) {
    statusId = 4;
  } else if (isShipped) {
    statusId = 3;
  }

  await db
    .update(ordersTable)
    .set({
      shipstationShipmentId: (shipment as any).shipmentId ? String((shipment as any).shipmentId) : ((shipment as any).fulfillmentId ? String((shipment as any).fulfillmentId) : null),
      shipstationShipmentStatus: shipment.shipmentStatus ?? null,
      shipstationTrackingNumber: shipment.trackingNumber ?? null,
      shipstationCarrierCode: shipment.carrierCode ?? null,
      shipstationServiceCode: shipment.serviceCode ?? null,
      shippedAt: isShipped ? (shipDate ?? new Date()) : null,
      statusId,
      updatedAt: new Date(),
    })
    .where(eq(ordersTable.id, order.id));

  return { updated: true as const, isShipped, isDelivered };
}
