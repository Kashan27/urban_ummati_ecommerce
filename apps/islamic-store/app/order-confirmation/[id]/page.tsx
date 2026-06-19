import { Suspense } from "react";
import { OrderConfirmation } from "@/views/OrderConfirmation";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata = buildSeoMetadata({
  title: "Order Confirmation | Urban Ummati",
  description: "Review your order confirmation and payment status.",
  path: "/order-confirmation",
  noIndex: true,
});

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OrderConfirmation />
    </Suspense>
  );
}
