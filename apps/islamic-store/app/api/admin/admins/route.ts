import { NextRequest, NextResponse } from "next/server";
import { db, adminsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import { z } from "zod";

export const runtime = "nodejs";

const CreateAdminSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  role: z.string().default("admin")
});

const UpdateAdminSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.string().optional(),
  password: z.string().min(6).optional()
});

export async function GET(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin.ok) return admin.response;

  try {
    const allAdmins = await db
      .select({
        id: adminsTable.id,
        username: adminsTable.username,
        role: adminsTable.role,
        isActive: adminsTable.isActive,
        createdAt: adminsTable.createdAt,
        lastLoginAt: adminsTable.lastLoginAt
      })
      .from(adminsTable)
      .orderBy(desc(adminsTable.createdAt));

    return NextResponse.json({ admins: allAdmins });
  } catch (err) {
    console.error("Error fetching admins", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin.ok) return admin.response;

  try {
    const body = await request.json();
    const parsed = CreateAdminSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
    }

    const [newAdmin] = await db
      .insert(adminsTable)
      .values({
        username: parsed.data.username,
        password: parsed.data.password, // In a real app, this should be hashed
        role: parsed.data.role,
        isActive: true,
      })
      .returning({
        id: adminsTable.id,
        username: adminsTable.username
      });

    return NextResponse.json({ admin: newAdmin }, { status: 201 });
  } catch (err: any) {
    if (err.code === "23505") {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }
    console.error("Error creating admin", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
