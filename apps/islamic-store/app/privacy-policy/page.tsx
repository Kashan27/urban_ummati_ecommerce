import { Privacy } from "@/views/Privacy";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata = buildSeoMetadata({
  title: "Privacy Policy | Urban Ummati",
  description:
    "Read how Urban Ummati collects, uses, and protects customer information.",
  path: "/privacy-policy",
});

export default function PrivacyPage() {
  return <Privacy />;
}
