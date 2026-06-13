import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db, ordersTable, orderItemsTable, productsTable } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
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

      // DECREMENT STOCK NOW THAT PAYMENT IS CONFIRMED
      const items = await tx
        .select({ productId: orderItemsTable.productId, quantity: orderItemsTable.quantity })
        .from(orderItemsTable)
        .where(eq(orderItemsTable.orderId, orderId));

      for (const item of items) {
        const qty = Number(item.quantity ?? 0);
        const productId = Number(item.productId ?? 0);
        if (!Number.isFinite(qty) || qty <= 0) continue;
        if (!Number.isFinite(productId) || productId <= 0) continue;

        // Use raw SQL via tx.execute() to ensure column references are properly
        // resolved as identifiers, not as bind parameters.
        await tx.execute(
          sql`
            UPDATE "products"
            SET
              "total_sold" = "total_sold" + ${qty},
              "inventory_quantity" = CASE
                WHEN "inventory_quantity" IS NULL THEN NULL
                ELSE GREATEST(0, "inventory_quantity" - ${qty})
              END,
              "in_stock" = CASE
                WHEN "inventory_quantity" IS NULL THEN "in_stock"
                ELSE ("inventory_quantity" - ${qty}) > 0
              END,
              "updated_at" = ${now}
            WHERE "products"."id" = ${productId}
          `,
        );
      }

      return true;
    });

    return NextResponse.json({ ok: committed });
  } catch (err) {
    console.error("Error confirming Stripe session", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
