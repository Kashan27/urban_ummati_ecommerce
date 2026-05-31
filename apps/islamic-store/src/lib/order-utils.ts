export interface OrderSettings {
  tax_percent: string;
  free_shipping_threshold: string;
  standard_shipping_cost: string;
  [key: string]: string;
}

export function calculateOrderTotals(subtotal: number, discount: number, settings: OrderSettings) {
  const taxRate = parseFloat(settings.tax_percent || "13") / 100;
  const shippingThreshold = parseFloat(settings.free_shipping_threshold || "75");
  const standardShipping = parseFloat(settings.standard_shipping_cost || "15");

  const effectiveSubtotal = Math.max(0, subtotal - discount);
  const shippingCost = effectiveSubtotal >= shippingThreshold ? 0 : standardShipping;
  const tax = (effectiveSubtotal + shippingCost) * taxRate;
  const total = effectiveSubtotal + shippingCost + tax;

  return {
    effectiveSubtotal,
    shippingCost,
    tax,
    total: Math.max(0, total),
    taxRate,
    shippingThreshold,
    standardShipping
  };
}
