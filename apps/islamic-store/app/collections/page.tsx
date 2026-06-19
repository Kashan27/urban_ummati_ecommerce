import { Collections } from "@/views/Collections";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata = buildSeoMetadata({
  title: "Islamic Collections",
  description:
    "Browse curated Islamic decor collections for Ramadan, wall art, and premium Muslim home styling.",
  path: "/collections",
});

export default function Page() {
  return <Collections />;
}

