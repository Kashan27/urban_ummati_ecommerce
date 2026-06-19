import { Faq } from "@/views/Faq";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata = buildSeoMetadata({
  title: "Frequently Asked Questions | Urban Ummati",
  description:
    "Find answers about ordering, shipping, returns, and product details for Urban Ummati.",
  path: "/faq",
});

export default function FaqPage() {
  return <Faq />;
}
