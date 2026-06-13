import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db, ordersTable, orderItemsTable, productsTable } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

export const runtime = "nodejs";

const BodySchema = z.object({
  orderId: z.coerce.number().int().positive(),
  token: z.string().min(10),
  // Best-effort: if Stripe isn't configured, we still cancel + restock locally.
  expireStripeSession: z.coerce.boolean().optional().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { orderId, token, expireStripeSession } = parsed.data;

    const rows = await db
      .select({
        id: ordersTable.id,
        paymentStatus: ordersTable.paymentStatus,
        stripeCheckoutSessionId: ordersTable.stripeCheckoutSessionId,
        trackingToken: ordersTable.trackingToken,
      })
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = rows[0];
    if ((order.trackingToken ?? "") !== token) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json({ error: "Order is already paid" }, { status: 409 });
    }

    if (order.paymentStatus === "canceled") {
      return NextResponse.json({ ok: true, alreadyCanceled: true }, { status: 200 });
    }

    const now = new Date();
    let stripeExpired = false;

    // Cancel locally only if the order is still pending.
    const canceled = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(ordersTable)
        .set({ paymentStatus: "canceled", statusId: 5, updatedAt: now })
        .where(and(eq(ordersTable.id, orderId), eq(ordersTable.paymentStatus, "pending")))
        .returning({ id: ordersTable.id });

      if (!updated) return false;

      return true;
    });

    // Best-effort: expire the Stripe Checkout Session so it can't be completed later.
    // This is intentionally AFTER local cancellation so we don't block cancellation if Stripe is down.
    if (
      canceled &&
      expireStripeSession &&
      process.env.STRIPE_SECRET_KEY &&
      order.stripeCheckoutSessionId
    ) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        await stripe.checkout.sessions.expire(order.stripeCheckoutSessionId);
        stripeExpired = true;
      } catch {
        // ignore
      }
    }

    return NextResponse.json({ ok: canceled, stripeExpired }, { status: 200 });
  } catch (err) {
    console.error("Error canceling order on checkout return", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
