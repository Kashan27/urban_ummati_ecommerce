import { Products } from "@/views/Products";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata = buildSeoMetadata({
  title: "Shop Islamic Wall Art",
  description:
    "Shop Islamic wall art, Arabic calligraphy, Kun artwork, and premium Muslim home decor from Urban Ummati.",
  path: "/products",
});

export default function Page() {
  return <Products />;
}
