import { TrackingPage } from "@/views/TrackingPage";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata = buildSeoMetadata({
  title: "Order Tracking | Urban Ummati",
  description: "Track the latest shipment status for your Urban Ummati order.",
  path: "/tracking",
  noIndex: true,
});

export default function Page() {
  return <TrackingPage />;
}