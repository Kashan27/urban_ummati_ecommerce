import { Shipping } from "@/views/Shipping";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata = buildSeoMetadata({
  title: "Shipping Policy | Urban Ummati",
  description:
    "Review Urban Ummati's shipping areas, delivery estimates, and fulfillment expectations.",
  path: "/shipping-policy",
});

export default function ShippingPolicyPage() {
  return <Shipping />;
}
