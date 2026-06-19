import { Returns } from "@/views/Returns";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata = buildSeoMetadata({
  title: "Returns & Refunds | Urban Ummati",
  description:
    "See Urban Ummati's return and refund policy for eligible products and timelines.",
  path: "/returns-policy",
});

export default function ReturnsPolicyPage() {
  return <Returns />;
}
