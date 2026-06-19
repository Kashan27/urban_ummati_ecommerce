import { Contact } from "@/views/Contact";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata = buildSeoMetadata({
  title: "Contact Urban Ummati",
  description:
    "Get in touch with Urban Ummati for product questions, support, and custom Islamic decor inquiries.",
  path: "/contact",
});

export default function Page() {
  return <Contact />;
}

