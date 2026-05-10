import { NextRequest, NextResponse } from "next/server";
import { db, ordersTable, productsTable, orderStatusesTable, freeProductLinksTable, freeProductRedemptionsTable } from "@workspace/db";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { CreateOrderBody, ListOrdersQueryParams } from "@workspace/api-zod";
import { formatOrder } from "@/lib/api-formatters";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    if (!admin.ok) return admin.response;

    const search = request.nextUrl.searchParams;
    const rawQuery = {
      status: search.get("status") ?? undefined,
      limit: search.get("limit") ?? undefined,
      offset: search.get("offset") ?? undefined,
    };

    const parsed = ListOrdersQueryParams.safeParse(rawQuery);
    const params = parsed.success ? parsed.data : { status: undefined, limit: 50, offset: 0 };

    // Get date filters from query params
    const dateFrom = search.get("dateFrom");
    const dateTo = search.get("dateTo");

    const query = db
      .select({
        order: ordersTable,
        statusName: orderStatusesTable.name,
      })
      .from(ordersTable)
      .leftJoin(orderStatusesTable, eq(ordersTable.statusId, orderStatusesTable.id))
      .orderBy(desc(ordersTable.createdAt));

    const results = await query;

    let filtered = results;
    if (params.status) {
      filtered = results.filter((r) => r.statusName === params.status);
    }

    // Apply date filtering
    if (dateFrom || dateTo) {
      filtered = filtered.filter((r) => {
        const orderDate = new Date(r.order.createdAt);
        const orderDateStr = orderDate.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (dateFrom && orderDateStr < dateFrom) return false;
        if (dateTo && orderDateStr > dateTo) return false;
        return true;
      });
    }

    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      orders: paginated.map((r) => formatOrder(r.order, r.statusName ?? undefined)),
      total: filtered.length,
    });
  } catch (err) {
    console.error("Error listing orders", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
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
      
      // Stock check
      if (product.inventoryQuantity !== null && product.inventoryQuantity < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }
      if (product.inStock === false) {
        throw new Error(`Product is out of stock: ${product.name}`);
      }

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
      
      // Advanced rule validation
      if (link.status !== "active") {
        return NextResponse.json({ error: "This free product link is no longer active" }, { status: 404 });
      }

      if (link.expiresAt && link.expiresAt < new Date()) {
        return NextResponse.json({ error: "This free product link has expired" }, { status: 404 });
      }

      if (link.currentUsage >= link.usageLimit) {
        return NextResponse.json({ error: "This free product link has reached its usage limit" }, { status: 409 });
      }

      const [existingOrders, usedLinkRedemptions] = await Promise.all([
        db
          .select({ id: ordersTable.id })
          .from(ordersTable)
          .where(sql`lower(${ordersTable.customerEmail}) = ${email}`)
          .limit(1),
        db
          .select({ id: freeProductRedemptionsTable.id })
          .from(freeProductRedemptionsTable)
          .where(sql`lower(${freeProductRedemptionsTable.email}) = ${email}`)
          .limit(1),
      ]);

      if (existingOrders.length > 0 || usedLinkRedemptions.length > 0) {
        return NextResponse.json(
          {
            error: "This email has already been used for a free product",
          },
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
    const total = effectiveSubtotal + shippingCost + tax;

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
          total: String(Math.max(0, total)),
          statusId: 1, // 'received'
          isFreeOrder,
          discount: String(discount),
          notes: data.notes,
        })
        .returning();

      for (const item of data.items) {
        const updates = await tx
          .update(productsTable)
          .set({
            totalSold: sql`${productsTable.totalSold} + ${item.quantity}`,
            inventoryQuantity: sql`case when ${productsTable.inventoryQuantity} is null then null else greatest(0, ${productsTable.inventoryQuantity} - ${item.quantity}) end`,
            inStock: sql`case when ${productsTable.inventoryQuantity} is null then ${productsTable.inStock} else (${productsTable.inventoryQuantity} - ${item.quantity}) > 0 end`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(productsTable.id, item.productId),
              sql`(${productsTable.inventoryQuantity} is null or ${productsTable.inventoryQuantity} >= ${item.quantity})`,
            ),
          )
          .returning({ id: productsTable.id });

        if (updates.length === 0) {
          throw new Error("INSUFFICIENT_STOCK");
        }
      }

      if (validatedPromoToken && validatedPromoProductId) {
        const consumed = await tx
          .update(freeProductLinksTable)
          .set({
            currentUsage: sql`${freeProductLinksTable.currentUsage} + 1`,
            usedByEmail: email, // Legacy support
            usedAt: new Date(),  // Legacy support
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(freeProductLinksTable.token, validatedPromoToken),
              eq(freeProductLinksTable.productId, validatedPromoProductId),
              eq(freeProductLinksTable.status, "active"),
              sql`${freeProductLinksTable.currentUsage} < ${freeProductLinksTable.usageLimit}`
            ),
          )
          .returning({ id: freeProductLinksTable.id });

        if (consumed.length === 0) {
          throw new Error("FREE_PRODUCT_TOKEN_ALREADY_USED");
        }

        // Create redemption record
        await tx.insert(freeProductRedemptionsTable).values({
          linkId: consumed[0].id,
          email: email,
          orderId: newOrder.id,
        });
      }

      return [newOrder];
    });

    return NextResponse.json(formatOrder(order), { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "FREE_PRODUCT_TOKEN_ALREADY_USED") {
      return NextResponse.json(
        { error: "This free product token has already been used" },
        { status: 409 },
      );
    }
    if (err instanceof Error && err.message === "INSUFFICIENT_STOCK") {
      return NextResponse.json(
        { error: "One or more items are no longer in stock. Please update your cart and try again." },
        { status: 409 },
      );
    }
    if (
      err instanceof Error &&
      (err.message.startsWith("Product ") || err.message.startsWith("Invalid quantity"))
    ) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Error creating order", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
