import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db, ordersTable, productsTable, orderItemsTable } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";

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

    if (order.paymentStatus !== "pending") {
      const orderItemRows = await db
        .select({ productId: orderItemsTable.productId, quantity: orderItemsTable.quantity })
        .from(orderItemsTable)
        .where(eq(orderItemsTable.orderId, order.id));

      const now = new Date();
      await db.transaction(async (tx) => {
        const [moved] = await tx
          .update(ordersTable)
          .set({ paymentStatus: "pending", updatedAt: now })
          .where(
            and(eq(ordersTable.id, order.id), eq(ordersTable.paymentStatus, order.paymentStatus ?? "pending")),
          )
          .returning({ id: ordersTable.id });

        if (!moved) return;

        for (const item of orderItemRows) {
          const qty = Number(item.quantity ?? 0);
          const productId = Number(item.productId ?? 0);
          if (!Number.isFinite(qty) || qty <= 0) continue;
          if (!Number.isFinite(productId) || productId <= 0) continue;

          const updates = await tx
            .update(productsTable)
            .set({
              totalSold: sql`${productsTable.totalSold} + ${qty}`,
              inventoryQuantity: sql`case when ${productsTable.inventoryQuantity} is null then null else greatest(0, ${productsTable.inventoryQuantity} - ${qty}) end`,
              inStock: sql`case when ${productsTable.inventoryQuantity} is null then ${productsTable.inStock} else (${productsTable.inventoryQuantity} - ${qty}) > 0 end`,
              updatedAt: now,
            })
            .where(
              and(
                eq(productsTable.id, productId),
                sql`(${productsTable.inventoryQuantity} is null or ${productsTable.inventoryQuantity} >= ${qty})`,
              ),
            )
            .returning({ id: productsTable.id });

          if (updates.length === 0) {
            throw new Error("INSUFFICIENT_STOCK");
          }
        }
      });
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
      payment_method_types: ["card"],
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
      cancel_url: `${fallbackOrigin}/checkout?canceled=1&orderId=${order.id}&token=${encodeURIComponent(
        order.trackingToken ?? "",
      )}`,
    });

    await db
      .update(ordersTable)
      .set({
        paymentProvider: "stripe",
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, order.id));

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof Error && err.message === "INSUFFICIENT_STOCK") {
      return NextResponse.json(
        { error: "One or more items are no longer in stock. Please update your cart and try again." },
        { status: 409 },
      );
    }
    console.error("Error retrying Stripe checkout session", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
