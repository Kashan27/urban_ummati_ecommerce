import { About } from "@/views/About";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata = buildSeoMetadata({
  title: "About Urban Ummati",
  description:
    "Learn about Urban Ummati's premium Islamic decor collection, curated for modern Muslim homes.",
  path: "/about",
});

export default function Page() {
  return <About />;
}

