import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin.ok) return admin.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Invalid file size" }, { status: 400 });
    }

    const ext = ALLOWED_MIME[file.type];
    if (!ext) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const fileName = `${crypto.randomUUID()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`products/${fileName}`, bytes, {
        access: "public",
        contentType: file.type,
      });
      return NextResponse.json({ url: blob.url }, { status: 201 });
    }

    if (process.env.VERCEL === "1") {
      return NextResponse.json(
        { error: "Upload is not configured" },
        { status: 500 },
      );
    }

    const relativeUrl = `/uploads/products/${fileName}`;
    const targetDir = path.join(process.cwd(), "public", "uploads", "products");
    const targetPath = path.join(targetDir, fileName);
    await mkdir(targetDir, { recursive: true });
    await writeFile(targetPath, bytes);
    return NextResponse.json({ url: relativeUrl }, { status: 201 });
  } catch (err) {
    console.error("Error uploading product image", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
