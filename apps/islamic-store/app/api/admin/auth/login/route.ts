import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  createAdminSessionToken,
  verifyAdminCredentials,
  hashPassword,
} from "@/lib/admin-auth";
import { adminsTable, db } from "@workspace/db";
import { eq } from "drizzle-orm";

const LoginBody = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = LoginBody.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    const username = parsed.data.username.toLowerCase().trim();
    const { password } = parsed.data;
    if (!(await verifyAdminCredentials(username, password))) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    // Upgrade plain text password if needed
    const [admin] = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.username, username))
      .limit(1);

    const updatePayload: any = {
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    };

    if (admin && !admin.password.includes(":")) {
      updatePayload.password = hashPassword(password);
    }

    await db
      .update(adminsTable)
      .set(updatePayload)
      .where(eq(adminsTable.username, username));

    const token = createAdminSessionToken(username);
    const response = NextResponse.json({ authenticated: true, username });

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_TTL_SECONDS,
    });

    return response;
  } catch (err) {
    console.error("Error during admin login", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
