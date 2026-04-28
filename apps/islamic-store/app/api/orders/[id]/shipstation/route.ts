import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  shipStationCreateOrUpdateOrder,
  shipStationRefreshOrderShipment,
} from "../../../integrations/shipstation/service";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const admin = requireAdmin(request);
  if (!admin.ok) return admin.response;

  const { id } = await context.params;
  const orderId = Number(id);
  if (!Number.isFinite(orderId) || orderId <= 0) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  try {
    const result = await shipStationCreateOrUpdateOrder(orderId);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === "SHIPSTATION_NOT_CONFIGURED") {
      return NextResponse.json(
        { error: "ShipStation is not configured" },
        { status: 500 },
      );
    }
    if (err instanceof Error && err.message === "ORDER_NOT_PAID") {
      return NextResponse.json(
        { error: "Order must be paid before syncing to ShipStation" },
        { status: 400 },
      );
    }
    if (err instanceof Error && err.message === "ORDER_NOT_FOUND") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const admin = requireAdmin(request);
  if (!admin.ok) return admin.response;

  const { id } = await context.params;
  const orderId = Number(id);
  if (!Number.isFinite(orderId) || orderId <= 0) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  try {
    const result = await shipStationRefreshOrderShipment(orderId);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === "SHIPSTATION_NOT_CONFIGURED") {
      return NextResponse.json(
        { error: "ShipStation is not configured" },
        { status: 500 },
      );
    }
    if (err instanceof Error && err.message === "ORDER_NOT_SYNCED") {
      return NextResponse.json(
        { error: "Order is not synced to ShipStation" },
        { status: 400 },
      );
    }
    if (err instanceof Error && err.message === "ORDER_NOT_FOUND") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
