import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db, ordersTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const runtime = "nodejs";

const BodySchema = z.object({
  orderId: z.coerce.number().int().positive(),
  sessionId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    const body = await request.json().catch(() => null);
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { orderId, sessionId } = parsed.data;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const paid = session.payment_status === "paid";
    const metaOrderId = session.metadata?.orderId ? Number(session.metadata.orderId) : null;
    if (!paid || !metaOrderId || metaOrderId !== orderId) {
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    const now = new Date();
    const committed = await db.transaction(async (tx) => {
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
        .where(and(eq(ordersTable.id, orderId), eq(ordersTable.paymentStatus, "pending")))
        .returning();

      if (!updated) return false;

      return true;
    });

    return NextResponse.json({ ok: committed });
  } catch (err) {
    console.error("Error confirming Stripe session", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
