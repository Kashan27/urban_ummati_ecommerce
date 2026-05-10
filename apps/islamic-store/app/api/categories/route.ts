import { NextResponse } from "next/server";
import { categoriesTable, db } from "@workspace/db";
import { asc, eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET() {
  try {
    const categories = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.isActive, true))
      .orderBy(asc(categoriesTable.name));

    return NextResponse.json({ categories, total: categories.length });
  } catch (err) {
    console.error("Error listing categories", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}