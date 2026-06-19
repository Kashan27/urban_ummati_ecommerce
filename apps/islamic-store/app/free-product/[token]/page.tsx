import { FreeProduct } from "@/views/FreeProduct";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata = buildSeoMetadata({
  title: "Free Product Offer | Urban Ummati",
  description: "Claim your eligible free product offer from Urban Ummati.",
  path: "/free-product",
  noIndex: true,
});

export default function Page() {
  return <FreeProduct />;
}
