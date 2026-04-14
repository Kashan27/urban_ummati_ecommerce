import { NextRequest, NextResponse } from "next/server";
import { db, ordersTable, productsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { CreateOrderBody, ListOrdersQueryParams } from "@workspace/api-zod";
import { formatOrder } from "@/lib/api-formatters";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams;
    const rawQuery = {
      status: search.get("status") ?? undefined,
      limit: search.get("limit") ?? undefined,
      offset: search.get("offset") ?? undefined,
    };

    const parsed = ListOrdersQueryParams.safeParse(rawQuery);
    const params = parsed.success ? parsed.data : {};

    let allOrders = await db
      .select()
      .from(ordersTable)
      .orderBy(desc(ordersTable.createdAt));

    if (params.status) {
      allOrders = allOrders.filter((o) => o.status === params.status);
    }

    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;
    const paginated = allOrders.slice(offset, offset + limit);

    return NextResponse.json({
      orders: paginated.map(formatOrder),
      total: allOrders.length,
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
    const allProducts = await db.select().from(productsTable);
    const productMap = new Map(allProducts.map((p) => [p.id, p]));

    let subtotal = 0;
    let isFreeOrder = false;
    let discount = 0;

    const orderItems = data.items.map((item, idx) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);

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

    if (data.freeProductToken) {
      isFreeOrder = true;
      discount = subtotal;
      subtotal = 0;
    }

    const shippingCost = subtotal >= 75 ? 0 : 15;
    const tax = (subtotal + shippingCost) * 0.13;
    const total = subtotal + shippingCost + tax - discount;

    const [order] = await db
      .insert(ordersTable)
      .values({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
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
        status: "received",
        isFreeOrder,
        discount: String(discount),
        notes: data.notes,
      })
      .returning();

    return NextResponse.json(formatOrder(order), { status: 201 });
  } catch (err) {
    console.error("Error creating order", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
