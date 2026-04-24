import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = getAdminSession(request);

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    username: session.u,
    expiresAt: session.exp * 1000,
  });
}
