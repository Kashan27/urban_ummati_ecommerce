import { NextResponse } from "next/server";
import { db, socialPlatformsTable } from "@workspace/db";
import { asc, eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET() {
  try {
    const platforms = await db
      .select()
      .from(socialPlatformsTable)
      .where(eq(socialPlatformsTable.isActive, true))
      .orderBy(asc(socialPlatformsTable.displayOrder), asc(socialPlatformsTable.name));

    return NextResponse.json({ platforms, total: platforms.length });
  } catch (err) {
    console.error("Error listing social platforms", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
