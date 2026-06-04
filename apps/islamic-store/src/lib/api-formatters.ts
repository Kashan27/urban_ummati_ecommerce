import { db, ordersTable, productsTable, productImagesTable, productColorsTable, freeProductLinksTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";

type ProductCategoryContext = {
  categoryId?: number | null;
  categoryName?: string | null;
  categorySlug?: string | null;
};

export function formatProduct(
  p: typeof productsTable.$inferSelect,
  categoryContext?: ProductCategoryContext,
  normalizedImages: string[] = [],
  normalizedColors: { hex: string; name: string }[] = [],
) {
  const categoryId = categoryContext?.categoryId ?? p.categoryId ?? null;
  const categoryName = categoryContext?.categoryName ?? null;
  const categorySlug = categoryContext?.categorySlug ?? null;

  return {
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    price: parseFloat(p.price),
    comparePrice: p.comparePrice ? parseFloat(p.comparePrice) : null,
    categoryId,
    categoryName,
    categorySlug,
    category: categorySlug,
    imageUrl: p.imageUrl,
    images: normalizedImages,
    inStock: p.inStock,
    inventoryQuantity: p.inventoryQuantity,
    totalSold: p.totalSold,
    featured: p.featured,
    isUpsell: p.isUpsell,
    upsellDiscount: p.upsellDiscount ? parseFloat(p.upsellDiscount) : null,
    reviewCount: p.reviewCount,
    rating: parseFloat(p.rating),
    colors: normalizedColors,
    weight: p.weight ? parseFloat(p.weight) : null,
    length: p.length ? parseFloat(p.length) : null,
    width: p.width ? parseFloat(p.width) : null,
    height: p.height ? parseFloat(p.height) : null,
    createdAt: p.createdAt.toISOString(),
  };
}

export async function loadProductMediaMaps(productIds: number[]) {
  if (productIds.length === 0) {
    return {
      imagesByProductId: new Map<number, string[]>(),
      colorsByProductId: new Map<number, { hex: string; name: string }[]>(),
    };
  }

  const [imageRows, colorRows] = await Promise.all([
    db
      .select()
      .from(productImagesTable)
      .where(inArray(productImagesTable.productId, productIds)),
    db
      .select()
      .from(productColorsTable)
      .where(inArray(productColorsTable.productId, productIds)),
  ]);

  const imagesByProductId = new Map<number, string[]>();
  for (const row of imageRows) {
    const list = imagesByProductId.get(row.productId) ?? [];
    list.push(row.url);
    imagesByProductId.set(row.productId, list);
  }

  const colorsByProductId = new Map<number, { hex: string; name: string }[]>();
  for (const row of colorRows) {
    const list = colorsByProductId.get(row.productId) ?? [];
    list.push({ hex: row.hex, name: row.name });
    colorsByProductId.set(row.productId, list);
  }

  return { imagesByProductId, colorsByProductId };
}

export function formatOrder(
  o: typeof ordersTable.$inferSelect,
  statusName?: string,
  normalizedItems: any[] = [],
) {
  const statusId = (o as any).statusId;
  const statusMap: Record<number, string> = {
    1: "received",
    2: "processed",
    3: "shipped",
    4: "delivered",
    5: "canceled",
  };
  const derivedStatus = statusName || statusMap[Number(statusId)] || "received";

  return {
    id: o.id,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    shippingAddress: o.shippingAddress,
    city: o.city,
    province: o.province,
    postalCode: o.postalCode,
    country: o.country,
    items: normalizedItems,
    subtotal: parseFloat(o.subtotal),
    shippingCost: parseFloat(o.shippingCost),
    tax: parseFloat(o.tax),
    total: parseFloat(o.total),
    status: derivedStatus,
    statusId: statusId,
    isFreeOrder: o.isFreeOrder,
    discount: parseFloat(o.discount),
    paymentProvider: (o as any).paymentProvider ?? null,
    paymentStatus: (o as any).paymentStatus ?? null,
    stripeCheckoutSessionId: (o as any).stripeCheckoutSessionId ?? null,
    stripePaymentIntentId: (o as any).stripePaymentIntentId ?? null,
    paidAt: (o as any).paidAt ? (o as any).paidAt.toISOString() : null,
    shipstationOrderId: (o as any).shipstationOrderId ?? null,
    shipstationOrderKey: (o as any).shipstationOrderKey ?? null,
    shipstationShipmentId: (o as any).shipstationShipmentId ?? null,
    shipstationShipmentStatus: (o as any).shipstationShipmentStatus ?? null,
    shipstationTrackingNumber: (o as any).shipstationTrackingNumber ?? null,
    shipstationCarrierCode: (o as any).shipstationCarrierCode ?? null,
    shipstationServiceCode: (o as any).shipstationServiceCode ?? null,
    shipstationSyncedAt: (o as any).shipstationSyncedAt
      ? (o as any).shipstationSyncedAt.toISOString()
      : null,
    shippedAt: (o as any).shippedAt ? (o as any).shippedAt.toISOString() : null,
    notes: o.notes,
    trackingToken: (o as any).trackingToken ?? null,
    createdAt: o.createdAt.toISOString(),
  };
}

export function formatFreeProductLink(
  link: typeof freeProductLinksTable.$inferSelect,
  product?: typeof productsTable.$inferSelect,
  redemptions?: any[],
  productImages?: string[],
  productColors?: { hex: string; name: string }[],
) {
  return {
    id: link.id,
    token: link.token,
    productId: link.productId,
    product: product ? formatProduct(product, undefined, productImages, productColors) : undefined,
    status: link.status,
    type: link.type,
    usageLimit: link.usageLimit,
    currentUsage: link.currentUsage,
    expiresAt: link.expiresAt?.toISOString() ?? null,
    notes: link.notes,
    usedByEmail: link.usedByEmail,
    usedAt: link.usedAt?.toISOString() ?? null,
    redemptions: redemptions || [],
    createdAt: link.createdAt.toISOString(),
  };
}

// Define a type for ShipStation Shipment, based on what's returned by their API
// This is a simplified version focusing on relevant fields for tracking display
export interface ShipStationShipment {
  shipmentId: number;
  shipmentStatus: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  carrierCode: string;
  serviceCode: string;
  shipDate: string; // ISO 8601 date string
  voidDate: string | null;
  customerNotificationDate: string | null;
}

export function formatShipment(shipment: ShipStationShipment) {
  return {
    id: shipment.shipmentId,
    status: shipment.shipmentStatus,
    trackingNumber: shipment.trackingNumber,
    trackingUrl: shipment.trackingUrl || `https://www.shipstation.com/track?trackingNumber=${shipment.trackingNumber}`,
    carrier: shipment.carrierCode,
    service: shipment.serviceCode,
    shipDate: shipment.shipDate ? new Date(shipment.shipDate).toISOString() : null,
    voidDate: shipment.voidDate ? new Date(shipment.voidDate).toISOString() : null,
    customerNotificationDate: shipment.customerNotificationDate ? new Date(shipment.customerNotificationDate).toISOString() : null,
  };
}
