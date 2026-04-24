import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { adminsTable, db } from "@workspace/db";
import { eq } from "drizzle-orm";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

type SessionPayload = {
  u: string;
  iat: number;
  exp: number;
};

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "change-me-admin-session-secret";
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");

  if (aa.length !== bb.length) {
    return false;
  }

  return crypto.timingSafeEqual(aa, bb);
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const derivedHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return safeEqual(hash, derivedHash);
}

function getCookieValue(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const parts = cookieHeader.split(";").map((part) => part.trim());
  const target = parts.find((part) => part.startsWith(`${name}=`));
  if (!target) return null;

  const [, ...rest] = target.split("=");
  return rest.join("=") || null;
}

export async function verifyAdminCredentials(username: string, password: string) {
  const normalizedUsername = username.toLowerCase().trim();

  const [admin] = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.username, normalizedUsername))
    .limit(1);

  if (!admin || !admin.isActive) {
    return false;
  }

  // Support both plain text (for migration/initial setup) and hashed passwords
  if (admin.password.includes(":")) {
    return verifyPassword(password, admin.password);
  }
  return safeEqual(password, admin.password);
}

export function createAdminSessionToken(username: string) {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    u: username,
    iat: now,
    exp: now + ADMIN_SESSION_TTL_SECONDS,
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyAdminSessionToken(token: string) {
  try {
    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) return null;

    const expectedSignature = sign(encodedPayload);
    if (!safeEqual(signature, expectedSignature)) return null;

    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as SessionPayload;
    if (!payload?.u || !payload?.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getAdminSession(request: Request) {
  const token = getCookieValue(request, ADMIN_SESSION_COOKIE);
  if (!token) return null;
  return verifyAdminSessionToken(token);
}

export function requireAdmin(request: Request) {
  const session = getAdminSession(request);
  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    ok: true as const,
    session,
  };
}
