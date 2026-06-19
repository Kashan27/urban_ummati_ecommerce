import { Suspense } from "react";
import { Cart } from "@/views/Cart";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata = buildSeoMetadata({
  title: "Shopping Cart | Urban Ummati",
  description: "Review items in your cart before checkout.",
  path: "/cart",
  noIndex: true,
});

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Cart />
    </Suspense>
  );
}
