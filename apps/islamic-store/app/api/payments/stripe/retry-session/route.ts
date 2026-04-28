import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

function formatOrderNumber(id: number) {
  return `#${id.toString().padStart(5, "0")}`;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 },
      );
    }

    const body = (await request.json().catch(() => null)) as
      | { orderId?: number | string; customerEmail?: string }
      | null;

    const orderId = body?.orderId ? Number(body.orderId) : NaN;
    const customerEmail = body?.customerEmail?.toLowerCase().trim() ?? "";

    if (!Number.isFinite(orderId) || orderId <= 0) {
      return NextResponse.json({ error: "Invalid orderId" }, { status: 400 });
    }
    if (!customerEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const rows = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = rows[0];
    const normalizedOrderEmail = (order.customerEmail ?? "").toLowerCase().trim();

    if (normalizedOrderEmail !== customerEmail) {
      return NextResponse.json({ error: "Order email mismatch" }, { status: 403 });
    }

    if (order.paymentStatus === "paid") {
      const origin = request.headers.get("origin") ?? "";
      const fallbackOrigin = origin || "http://localhost:3009";
      return NextResponse.json(
        { redirectUrl: `${fallbackOrigin}/order-confirmation/${order.id}` },
        { status: 409 },
      );
    }

    if (order.paymentProvider && order.paymentProvider !== "stripe") {
      return NextResponse.json(
        { error: "This order cannot be retried with Stripe" },
        { status: 400 },
      );
    }

    const total = parseFloat(order.total);
    if (!Number.isFinite(total) || total <= 0) {
      await db
        .update(ordersTable)
        .set({ paymentStatus: "paid", paidAt: new Date(), updatedAt: new Date() })
        .where(eq(ordersTable.id, order.id));

      const origin = request.headers.get("origin") ?? "";
      const fallbackOrigin = origin || "http://localhost:3009";
      return NextResponse.json({
        redirectUrl: `${fallbackOrigin}/order-confirmation/${order.id}`,
      });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = request.headers.get("origin") ?? "";
    const fallbackOrigin = origin || "http://localhost:3009";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "cad",
      customer_email: customerEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "cad",
            unit_amount: Math.round(total * 100),
            product_data: {
              name: `Urban Ummati Order ${formatOrderNumber(order.id)}`,
            },
          },
        },
      ],
      metadata: {
        orderId: String(order.id),
      },
      payment_intent_data: {
        metadata: {
          orderId: String(order.id),
        },
      },
      success_url: `${fallbackOrigin}/order-confirmation/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${fallbackOrigin}/checkout?canceled=1&orderId=${order.id}`,
    });

    await db
      .update(ordersTable)
      .set({
        paymentProvider: "stripe",
        paymentStatus: "pending",
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, order.id));

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Error retrying Stripe checkout session", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
