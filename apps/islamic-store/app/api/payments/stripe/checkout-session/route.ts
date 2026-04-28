import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db, freeProductLinksTable, ordersTable, productsTable } from "@workspace/db";
import { and, eq, isNull, sql } from "drizzle-orm";
import { CreateOrderBody } from "@workspace/api-zod";

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

    const body = await request.json();
    const parsed = CreateOrderBody.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid order data", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const email = data.customerEmail.toLowerCase().trim();
    const freeProductToken = data.freeProductToken?.trim() || null;

    const allProducts = await db.select().from(productsTable);
    const productMap = new Map(allProducts.map((p) => [p.id, p]));

    let subtotal = 0;
    let isFreeOrder = false;
    let discount = 0;
    let validatedPromoProductId: number | null = null;
    let validatedPromoToken: string | null = null;

    const orderItems = data.items.map((item, idx) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (product.status !== "active") throw new Error(`Product ${item.productId} is not available`);
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new Error(`Invalid quantity for product ${item.productId}`);
      }

      const itemTotal = parseFloat(product.price) * item.quantity;
      subtotal += itemTotal;

      return {
        id: idx + 1,
        productId: product.id,
        productName: product.name,
        productImage: product.imageUrl,
        price: parseFloat(product.price),
        quantity: item.quantity,
        color: item.color || null,
        total: itemTotal,
      };
    });

    if (freeProductToken) {
      const promoLink = await db
        .select()
        .from(freeProductLinksTable)
        .where(eq(freeProductLinksTable.token, freeProductToken))
        .limit(1);

      if (promoLink.length === 0) {
        return NextResponse.json({ error: "Invalid free product token" }, { status: 400 });
      }

      const link = promoLink[0];
      if (link.usedByEmail || link.usedAt) {
        return NextResponse.json(
          { error: "This free product token has already been used" },
          { status: 409 },
        );
      }

      const [existingOrders, usedLink] = await Promise.all([
        db
          .select({ id: ordersTable.id })
          .from(ordersTable)
          .where(sql`lower(${ordersTable.customerEmail}) = ${email}`)
          .limit(1),
        db
          .select({ id: freeProductLinksTable.id })
          .from(freeProductLinksTable)
          .where(sql`lower(${freeProductLinksTable.usedByEmail}) = ${email}`)
          .limit(1),
      ]);

      if (existingOrders.length > 0 || usedLink.length > 0) {
        return NextResponse.json(
          { error: "This email has already been used for a free product" },
          { status: 409 },
        );
      }

      const matchingItems = data.items.filter((item) => item.productId === link.productId);
      if (matchingItems.length !== 1) {
        return NextResponse.json(
          { error: "Cart must contain exactly one eligible free product item" },
          { status: 400 },
        );
      }

      if (matchingItems[0].quantity !== 1) {
        return NextResponse.json(
          { error: "Eligible free product quantity must be exactly 1" },
          { status: 400 },
        );
      }

      const freeProduct = productMap.get(link.productId);
      if (!freeProduct || freeProduct.status !== "active") {
        return NextResponse.json(
          { error: "Free product is not available" },
          { status: 400 },
        );
      }

      isFreeOrder = true;
      discount = parseFloat(freeProduct.price);
      validatedPromoProductId = link.productId;
      validatedPromoToken = freeProductToken;
    }

    const effectiveSubtotal = Math.max(0, subtotal - discount);
    const shippingCost = effectiveSubtotal >= 75 ? 0 : 15;
    const tax = (effectiveSubtotal + shippingCost) * 0.13;
    const total = Math.max(0, effectiveSubtotal + shippingCost + tax);

    const [order] = await db.transaction(async (tx) => {
      const [newOrder] = await tx
        .insert(ordersTable)
        .values({
          customerName: data.customerName,
          customerEmail: email,
          customerPhone: data.customerPhone,
          shippingAddress: data.shippingAddress,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode,
          country: data.country,
          items: orderItems,
          subtotal: String(subtotal),
          shippingCost: String(shippingCost),
          tax: String(tax),
          total: String(total),
          statusId: 1,
          isFreeOrder,
          discount: String(discount),
          paymentProvider: "stripe",
          paymentStatus: "pending",
          notes: data.notes,
        })
        .returning();

      if (validatedPromoToken && validatedPromoProductId) {
        const consumed = await tx
          .update(freeProductLinksTable)
          .set({
            usedByEmail: email,
            usedAt: new Date(),
          })
          .where(
            and(
              eq(freeProductLinksTable.token, validatedPromoToken),
              eq(freeProductLinksTable.productId, validatedPromoProductId),
              isNull(freeProductLinksTable.usedByEmail),
              isNull(freeProductLinksTable.usedAt),
            ),
          )
          .returning({ id: freeProductLinksTable.id });

        if (consumed.length === 0) {
          throw new Error("FREE_PRODUCT_TOKEN_ALREADY_USED");
        }
      }

      return [newOrder];
    });

    if (total <= 0) {
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
      customer_email: email,
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
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, order.id));

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof Error && err.message === "FREE_PRODUCT_TOKEN_ALREADY_USED") {
      return NextResponse.json(
        { error: "This free product token has already been used" },
        { status: 409 },
      );
    }
    if (
      err instanceof Error &&
      (err.message.startsWith("Product ") || err.message.startsWith("Invalid quantity"))
    ) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Error creating Stripe checkout session", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
