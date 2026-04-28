import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db, ordersTable } from "@workspace/db";
import { and, isNull, isNotNull } from "drizzle-orm";
import { shipStationRefreshOrderShipment } from "../../../integrations/shipstation/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin.ok) return admin.response;

  const body = (await request.json().catch(() => null)) as { limit?: number } | null;
  const limit = Math.min(Math.max(body?.limit ?? 25, 1), 200);

  try {
    const candidates = await db
      .select({ id: ordersTable.id })
      .from(ordersTable)
      .where(
        and(
          isNotNull(ordersTable.shipstationOrderId),
          isNull(ordersTable.shippedAt),
        ),
      )
      .limit(limit);

    let updated = 0;
    let shipped = 0;

    for (const c of candidates) {
      const result = await shipStationRefreshOrderShipment(c.id);
      if (result.updated) updated += 1;
      if (result.updated && result.isShipped) shipped += 1;
    }

    return NextResponse.json({ checked: candidates.length, updated, shipped });
  } catch (err) {
    if (err instanceof Error && err.message === "SHIPSTATION_NOT_CONFIGURED") {
      return NextResponse.json(
        { error: "ShipStation is not configured" },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
