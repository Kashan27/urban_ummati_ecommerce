import { NextRequest, NextResponse } from "next/server";
import { db, ordersTable, productsTable, orderStatusesTable, freeProductLinksTable, freeProductRedemptionsTable, orderItemsTable } from "@workspace/db";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { CreateOrderBody, ListOrdersQueryParams } from "@workspace/api-zod";
import { formatOrder } from "@/lib/api-formatters";
import { requireAdmin } from "@/lib/admin-auth";
import { randomUUID } from "crypto";

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

    if (dateFrom || dateTo) {
      filtered = filtered.filter((r) => {
        const orderDate = new Date(r.order.createdAt);
        const orderDateStr = orderDate.toISOString().split("T")[0];

        if (dateFrom && orderDateStr < dateFrom) return false;
        if (dateTo && orderDateStr > dateTo) return false;
        return true;
      });
    }

    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;
    const paginated = filtered.slice(offset, offset + limit);

    const orderIds = paginated.map((r) => r.order.id);
    const itemRows = orderIds.length
      ? await db
          .select()
          .from(orderItemsTable)
          .where(inArray(orderItemsTable.orderId, orderIds))
      : [];

    const itemsByOrderId = new Map<number, any[]>();
    for (const item of itemRows) {
      const list = itemsByOrderId.get(item.orderId) ?? [];
      list.push({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        price: parseFloat(item.unitPrice),
        quantity: item.quantity,
        color: item.color,
        total: parseFloat(item.lineTotal),
        weight: item.weight ? parseFloat(item.weight) : null,
        length: item.length ? parseFloat(item.length) : null,
        width: item.width ? parseFloat(item.width) : null,
        height: item.height ? parseFloat(item.height) : null,
      });
      itemsByOrderId.set(item.orderId, list);
    }

    return NextResponse.json({
      orders: paginated.map((r) =>
        formatOrder(
          r.order,
          r.statusName ?? undefined,
          itemsByOrderId.has(r.order.id) ? itemsByOrderId.get(r.order.id) : undefined,
        ),
      ),
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
        weight: product.weight ? parseFloat(product.weight) : null,
        length: product.length ? parseFloat(product.length) : null,
        width: product.width ? parseFloat(product.width) : null,
        height: product.height ? parseFloat(product.height) : null,
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
            error: "You have already claimed this free product.",
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

    console.info("[OrderCreate] computed order items", {
      customerEmail: email,
      items: orderItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        weight: item.weight,
        length: item.length,
        width: item.width,
        height: item.height,
      })),
    });

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
          subtotal: String(subtotal),
          shippingCost: String(shippingCost),
          tax: String(tax),
          total: String(Math.max(0, total)),
          statusId: 1,
          isFreeOrder,
          discount: String(discount),
          notes: data.notes,
          trackingToken: randomUUID(),
        })
        .returning();

      await tx.insert(orderItemsTable).values(
        orderItems.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          color: item.color,
          unitPrice: String(item.price),
          quantity: item.quantity,
          lineTotal: String(item.total),
          weight: item.weight == null ? null : String(item.weight),
          length: item.length == null ? null : String(item.length),
          width: item.width == null ? null : String(item.width),
          height: item.height == null ? null : String(item.height),
          updatedAt: new Date(),
        })),
      );

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
            usedByEmail: email,
            usedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(freeProductLinksTable.token, validatedPromoToken),
              eq(freeProductLinksTable.productId, validatedPromoProductId),
              eq(freeProductLinksTable.status, "active"),
              sql`${freeProductLinksTable.currentUsage} < ${freeProductLinksTable.usageLimit}`,
            ),
          )
          .returning({ id: freeProductLinksTable.id });

        if (consumed.length === 0) {
          throw new Error("FREE_PRODUCT_TOKEN_ALREADY_USED");
        }

        await tx.insert(freeProductRedemptionsTable).values({
          linkId: consumed[0].id,
          email: email,
          orderId: newOrder.id,
        });
      }

      return [newOrder];
    });

    console.info("[OrderCreate] order persisted", {
      orderId: order.id,
      customerEmail: order.customerEmail,
      itemCount: orderItems.length,
      shipstationOrderId: order.shipstationOrderId,
    });

    return NextResponse.json(formatOrder(order, undefined, orderItems), { status: 201 });
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
