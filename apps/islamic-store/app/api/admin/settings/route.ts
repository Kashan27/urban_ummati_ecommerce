import { NextRequest, NextResponse } from "next/server";
import { db, settingsTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    if (!admin.ok) return admin.response;

    const allSettings = await db.select().from(settingsTable);
    
    // Format as a simple key-value object
    const settingsMap = allSettings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(settingsMap);
  } catch (err) {
    console.error("Error fetching settings", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    if (!admin.ok) return admin.response;

    const body = await request.json();
    const updates = Object.entries(body as Record<string, string>);

    if (!updates.length) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      for (const [key, value] of updates) {
        await tx
          .update(settingsTable)
          .set({ value: String(value), updatedAt: new Date() })
          .where(eq(settingsTable.key, key));
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating settings", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
