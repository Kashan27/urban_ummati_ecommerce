import { ordersTable, productsTable, freeProductLinksTable } from "@workspace/db";

type ProductCategoryContext = {
  categoryId?: number | null;
  categoryName?: string | null;
  categorySlug?: string | null;
};

export function formatProduct(
  p: typeof productsTable.$inferSelect,
  categoryContext?: ProductCategoryContext,
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
    images: (p.images as string[]) || [],
    inStock: p.inStock,
    featured: p.featured,
    isUpsell: p.isUpsell,
    upsellDiscount: p.upsellDiscount ? parseFloat(p.upsellDiscount) : null,
    reviewCount: p.reviewCount,
    rating: parseFloat(p.rating),
    colors: (p.colors as string[]) || [],
    createdAt: p.createdAt.toISOString(),
  };
}

export function formatOrder(
  o: typeof ordersTable.$inferSelect,
  statusName?: string,
) {
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
    items: (o.items as any[]) || [],
    subtotal: parseFloat(o.subtotal),
    shippingCost: parseFloat(o.shippingCost),
    tax: parseFloat(o.tax),
    total: parseFloat(o.total),
    status: statusName ?? (o as any).status ?? "received",
    statusId: (o as any).statusId,
    isFreeOrder: o.isFreeOrder,
    discount: parseFloat(o.discount),
    notes: o.notes,
    createdAt: o.createdAt.toISOString(),
  };
}

export function formatFreeProductLink(
  link: typeof freeProductLinksTable.$inferSelect,
  product?: typeof productsTable.$inferSelect,
) {
  return {
    id: link.id,
    token: link.token,
    productId: link.productId,
    product: product ? formatProduct(product) : undefined,
    usedByEmail: link.usedByEmail,
    usedAt: link.usedAt?.toISOString() ?? null,
    createdAt: link.createdAt.toISOString(),
  };
}
