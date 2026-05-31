import { NextResponse } from "next/server";
import { db, settingsTable } from "@workspace/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const allSettings = await db.select().from(settingsTable);
    
    // List of keys allowed to be public
    const publicKeys = [
      "tax_percent",
      "free_shipping_threshold",
      "standard_shipping_cost",
      "upsell_discount_percent",
      "low_stock_threshold",
      "display_stock_to_customers",
      "enforce_stock_restrictions"
    ];

    const settingsMap = allSettings.reduce((acc, s) => {
      if (publicKeys.includes(s.key)) {
        acc[s.key] = s.value;
      }
      return acc;
    }, {} as Record<string, string>);

    // Provide defaults if missing
    const defaults: Record<string, string> = {
      tax_percent: "13",
      free_shipping_threshold: "75",
      standard_shipping_cost: "15",
      upsell_discount_percent: "0",
    };

    const finalSettings = { ...defaults, ...settingsMap };

    return NextResponse.json(finalSettings);
  } catch (err) {
    console.error("Error fetching public settings", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
