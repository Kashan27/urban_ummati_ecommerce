import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db, ordersTable, productsTable, orderItemsTable } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
import { shipStationCreateOrUpdateOrder } from "../../../integrations/shipstation/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Stripe webhook is not configured" },
        { status: 500 },
      );
    }

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const payload = await request.text();

    let event: Stripe.Event;
    
    try {
      // Try to verify signature normally
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      // In development with Stripe CLI, signature may fail due to forwarding
      // Allow bypass in development mode
      if (process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview') {
        console.warn('[Stripe Webhook] Signature verification failed in dev mode, parsing payload directly');
        try {
          event = JSON.parse(payload) as Stripe.Event;
        } catch (parseErr) {
          console.error('[Stripe Webhook] Failed to parse payload', parseErr);
          return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }
      } else {
        // In production, fail on signature error
        throw err;
      }
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId ? Number(session.metadata.orderId) : null;

      console.info("[Stripe Webhook] checkout.session.completed", { orderId, sessionId: session.id });

      if (orderId && Number.isFinite(orderId)) {
        const now = new Date();
        await db.transaction(async (tx) => {
          const [updated] = await tx
            .update(ordersTable)
            .set({
              paymentProvider: "stripe",
              paymentStatus: "paid",
              stripeCheckoutSessionId: session.id,
              stripePaymentIntentId:
                typeof session.payment_intent === "string" ? session.payment_intent : null,
              paidAt: now,
              updatedAt: now,
            })
            .where(
              and(
                eq(ordersTable.id, orderId),
                eq(ordersTable.paymentStatus, "pending"),
              ),
            )
            .returning();

          if (!updated) {
            console.warn("[Stripe Webhook] Order not updated (maybe already processed)", { orderId });
            return;
          }

          // DECREMENT STOCK NOW THAT PAYMENT IS CONFIRMED
          const items = await tx
            .select({ productId: orderItemsTable.productId, quantity: orderItemsTable.quantity })
            .from(orderItemsTable)
            .where(eq(orderItemsTable.orderId, orderId));

          console.info(`[Stripe Webhook] Processing ${items.length} items for stock decrement`, { orderId });

          for (const item of items) {
            const qty = Number(item.quantity ?? 0);
            const productId = Number(item.productId ?? 0);
            if (!Number.isFinite(qty) || qty <= 0) continue;
            if (!Number.isFinite(productId) || productId <= 0) continue;

            const [updatedProduct] = await tx
              .update(productsTable)
              .set({
                totalSold: sql`${productsTable.totalSold} + ${qty}`,
                inventoryQuantity: sql`CASE WHEN ${productsTable.inventoryQuantity} IS NULL THEN NULL ELSE GREATEST(0, ${productsTable.inventoryQuantity} - ${qty}) END`,
                inStock: sql`CASE WHEN ${productsTable.inventoryQuantity} IS NULL THEN ${productsTable.inStock} ELSE (${productsTable.inventoryQuantity} - ${qty}) > 0 END`,
                updatedAt: now,
              })
              .where(eq(productsTable.id, productId))
              .returning({ id: productsTable.id });

            if (updatedProduct) {
              console.info(`[Stripe Webhook] Successfully decremented stock for product ${productId}`, { orderId, qty });
            } else {
              console.error(`[Stripe Webhook] FAILED to decrement stock for product ${productId}`, { orderId });
            }
          }

          console.info("[Stripe Webhook] Order marked as paid and stock processing completed", { orderId });
        });

        console.info("[Stripe Webhook] Starting ShipStation sync", { orderId });
        try {
          await shipStationCreateOrUpdateOrder(orderId);
          console.info("[Stripe Webhook] ShipStation sync completed", { orderId });
        } catch (err) {
          if (!(err instanceof Error && err.message === "SHIPSTATION_NOT_CONFIGURED")) {
            console.error("[Stripe Webhook] ShipStation sync error", { orderId, error: err });
          } else {
            console.warn("[Stripe Webhook] ShipStation not configured, skipping sync", { orderId });
          }
        }
      } else {
        console.warn("[Stripe Webhook] No orderId found in session metadata", { sessionId: session.id });
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId ? Number(session.metadata.orderId) : null;
      if (orderId && Number.isFinite(orderId)) {
        const now = new Date();
        await db
          .update(ordersTable)
          .set({
            paymentProvider: "stripe",
            paymentStatus: "canceled",
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId:
              typeof session.payment_intent === "string" ? session.payment_intent : null,
            updatedAt: now,
          })
          .where(
            and(eq(ordersTable.id, orderId), eq(ordersTable.paymentStatus, "pending")),
          );
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId ? Number(paymentIntent.metadata.orderId) : null;
      if (orderId && Number.isFinite(orderId)) {
        const now = new Date();
        await db
          .update(ordersTable)
          .set({
            paymentProvider: "stripe",
            paymentStatus: "failed",
            stripePaymentIntentId: paymentIntent.id,
            updatedAt: now,
          })
          .where(
            and(eq(ordersTable.id, orderId), eq(ordersTable.paymentStatus, "pending")),
          );
      }
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const orderId = charge.metadata?.orderId ? Number(charge.metadata.orderId) : null;
      if (orderId && Number.isFinite(orderId)) {
        await db
          .update(ordersTable)
          .set({
            paymentProvider: "stripe",
            paymentStatus: "refunded",
            updatedAt: new Date(),
          })
          .where(eq(ordersTable.id, orderId));
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook error", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
