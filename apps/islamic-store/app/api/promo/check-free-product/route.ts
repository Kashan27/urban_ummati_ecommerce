import { NextResponse } from "next/server";
import { db, freeProductLinksTable, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CheckFreeProductBody } from "@workspace/api-zod";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CheckFreeProductBody.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();

    const [existingOrders, usedLink] = await Promise.all([
      db.select().from(ordersTable).where(eq(ordersTable.customerEmail, email)),
      db
        .select()
        .from(freeProductLinksTable)
        .where(eq(freeProductLinksTable.usedByEmail, email)),
    ]);

    if (existingOrders.length > 0 || usedLink.length > 0) {
      return NextResponse.json({
        eligible: false,
        reason: "This email has already been used for a free product",
      });
    }

    return NextResponse.json({ eligible: true, reason: null });
  } catch (err) {
    console.error("Error checking free product eligibility", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
