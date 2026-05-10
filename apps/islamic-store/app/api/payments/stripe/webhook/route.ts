import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db, ordersTable, productsTable } from "@workspace/db";
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

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId ? Number(session.metadata.orderId) : null;

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

          if (!updated) return;
        });

        try {
          await shipStationCreateOrUpdateOrder(orderId);
        } catch (err) {
          if (!(err instanceof Error && err.message === "SHIPSTATION_NOT_CONFIGURED")) {
            console.error("ShipStation sync error", err);
          }
        }
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId ? Number(session.metadata.orderId) : null;
      if (orderId && Number.isFinite(orderId)) {
        const now = new Date();
        await db.transaction(async (tx) => {
          const [updated] = await tx
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
            )
            .returning();

          if (!updated) return;

          const items = (updated.items as any[]) || [];
          for (const item of items) {
            const qty = Number(item?.quantity ?? 0);
            const productId = Number(item?.productId ?? 0);
            if (!Number.isFinite(qty) || qty <= 0) continue;
            if (!Number.isFinite(productId) || productId <= 0) continue;
            await tx
              .update(productsTable)
              .set({
                inventoryQuantity: sql`case when ${productsTable.inventoryQuantity} is null then null else ${productsTable.inventoryQuantity} + ${qty} end`,
                inStock: sql`case when ${productsTable.inventoryQuantity} is null then ${productsTable.inStock} else (${productsTable.inventoryQuantity} + ${qty}) > 0 end`,
                totalSold: sql`greatest(0, ${productsTable.totalSold} - ${qty})`,
                updatedAt: now,
              })
              .where(eq(productsTable.id, productId));
          }
        });
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId ? Number(paymentIntent.metadata.orderId) : null;
      if (orderId && Number.isFinite(orderId)) {
        const now = new Date();
        await db.transaction(async (tx) => {
          const [updated] = await tx
            .update(ordersTable)
            .set({
              paymentProvider: "stripe",
              paymentStatus: "failed",
              stripePaymentIntentId: paymentIntent.id,
              updatedAt: now,
            })
            .where(
              and(eq(ordersTable.id, orderId), eq(ordersTable.paymentStatus, "pending")),
            )
            .returning();

          if (!updated) return;

          const items = (updated.items as any[]) || [];
          for (const item of items) {
            const qty = Number(item?.quantity ?? 0);
            const productId = Number(item?.productId ?? 0);
            if (!Number.isFinite(qty) || qty <= 0) continue;
            if (!Number.isFinite(productId) || productId <= 0) continue;
            await tx
              .update(productsTable)
              .set({
                inventoryQuantity: sql`case when ${productsTable.inventoryQuantity} is null then null else ${productsTable.inventoryQuantity} + ${qty} end`,
                inStock: sql`case when ${productsTable.inventoryQuantity} is null then ${productsTable.inStock} else (${productsTable.inventoryQuantity} + ${qty}) > 0 end`,
                totalSold: sql`greatest(0, ${productsTable.totalSold} - ${qty})`,
                updatedAt: now,
              })
              .where(eq(productsTable.id, productId));
          }
        });
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
