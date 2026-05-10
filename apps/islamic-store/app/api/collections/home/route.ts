import { NextResponse } from "next/server";
import { collectionsTable, db } from "@workspace/db";
import { and, asc, eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET() {
  try {
    const collections = await db
      .select()
      .from(collectionsTable)
      .where(
        and(
          eq(collectionsTable.isActive, true),
          eq(collectionsTable.showOnHome, true)
        )
      )
      .orderBy(asc(collectionsTable.name));

    return NextResponse.json({ collections, total: collections.length });
  } catch (err) {
    console.error("Error listing home collections", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}