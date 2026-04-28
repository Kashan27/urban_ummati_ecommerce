import { NextResponse } from "next/server";
import { collectionsTable, db } from "@workspace/db";
import { asc, eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET() {
  try {
    const collections = await db
      .select()
      .from(collectionsTable)
      .where(eq(collectionsTable.isActive, true))
      .orderBy(asc(collectionsTable.name));

    return NextResponse.json({ collections, total: collections.length });
  } catch (err) {
    console.error("Error listing collections", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

