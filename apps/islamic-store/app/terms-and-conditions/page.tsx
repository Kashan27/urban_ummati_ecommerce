import { Terms } from "@/views/Terms";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata = buildSeoMetadata({
  title: "Terms & Conditions | Urban Ummati",
  description:
    "Read Urban Ummati's terms and conditions for store usage, orders, and customer responsibilities.",
  path: "/terms-and-conditions",
});

export default function Page() {
  return <Terms />;
}
