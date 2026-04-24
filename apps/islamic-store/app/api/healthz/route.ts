import { NextResponse } from "next/server";
import { HealthCheckResponse } from "@workspace/api-zod";

export const runtime = "nodejs";

export async function GET() {
  const data = HealthCheckResponse.parse({ status: "ok" });
  return NextResponse.json(data);
}
