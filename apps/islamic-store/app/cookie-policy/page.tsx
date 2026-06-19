import { Cookies } from "@/views/Cookies";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata = buildSeoMetadata({
  title: "Cookie Policy | Urban Ummati",
  description:
    "Learn how Urban Ummati uses cookies and similar technologies across the storefront.",
  path: "/cookie-policy",
});

export default function CookiePolicyPage() {
  return <Cookies />;
}
