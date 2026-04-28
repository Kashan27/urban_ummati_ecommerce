import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
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
        await db
          .update(ordersTable)
          .set({
            paymentProvider: "stripe",
            paymentStatus: "paid",
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId:
              typeof session.payment_intent === "string" ? session.payment_intent : null,
            paidAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(ordersTable.id, orderId));

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
        await db
          .update(ordersTable)
          .set({
            paymentProvider: "stripe",
            paymentStatus: "canceled",
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId:
              typeof session.payment_intent === "string" ? session.payment_intent : null,
            updatedAt: new Date(),
          })
          .where(eq(ordersTable.id, orderId));
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId ? Number(paymentIntent.metadata.orderId) : null;
      if (orderId && Number.isFinite(orderId)) {
        await db
          .update(ordersTable)
          .set({
            paymentProvider: "stripe",
            paymentStatus: "failed",
            stripePaymentIntentId: paymentIntent.id,
            updatedAt: new Date(),
          })
          .where(eq(ordersTable.id, orderId));
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
