import { Suspense } from "react";
import { Checkout } from "@/views/Checkout";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata = buildSeoMetadata({
  title: "Checkout | Urban Ummati",
  description: "Complete your order securely with Urban Ummati checkout.",
  path: "/checkout",
  noIndex: true,
});

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Checkout />
    </Suspense>
  );
}
