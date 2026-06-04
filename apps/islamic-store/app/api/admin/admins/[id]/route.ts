import { NextRequest, NextResponse } from "next/server";
import { db, adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import { z } from "zod";

export const runtime = "nodejs";

const UpdateAdminSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.string().optional(),
  password: z.string().min(6).optional()
});

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const adminAuth = requireAdmin(request);
  if (!adminAuth.ok) return adminAuth.response;

  try {
    const { id } = await context.params;
    const adminId = parseInt(id, 10);
    if (isNaN(adminId)) {
      return NextResponse.json({ error: "Invalid admin ID" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = UpdateAdminSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
    }

    const updates: any = {
      updatedAt: new Date()
    };

    if (parsed.data.isActive !== undefined) updates.isActive = parsed.data.isActive;
    if (parsed.data.role !== undefined) updates.role = parsed.data.role;
    if (parsed.data.password !== undefined) updates.password = parsed.data.password;

    await db
      .update(adminsTable)
      .set(updates)
      .where(eq(adminsTable.id, adminId));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating admin", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const adminAuth = requireAdmin(request);
  if (!adminAuth.ok) return adminAuth.response;

  try {
    const { id } = await context.params;
    const adminId = parseInt(id, 10);
    if (isNaN(adminId)) {
      return NextResponse.json({ error: "Invalid admin ID" }, { status: 400 });
    }

    // Don't allow self-deletion
    const currentAdmin = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.username, adminAuth.session.u))
      .then(rows => rows[0]);

    if (currentAdmin?.id === adminId) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

    // Instead of permanent delete, we can deactivate
    await db
      .update(adminsTable)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(adminsTable.id, adminId));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting admin", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
