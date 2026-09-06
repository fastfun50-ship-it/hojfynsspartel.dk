import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isAdminRequest } from "@/lib/auth";

const ALLOWED = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Ikke autoriseret" }, { status: 401 });
  }
  try {
    const form = await request.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") || "cms").replace(/[^a-z0-9_-]/gi, "") || "cms";
    if (!file || typeof file === "string") {
      return NextResponse.json({ success: false, error: "Vælg en billedfil." }, { status: 400 });
    }
    const blob = file as File;
    if (!ALLOWED.has(blob.type)) {
      return NextResponse.json({ success: false, error: "Forkert filtype. Brug JPG, PNG eller WEBP." }, { status: 400 });
    }
    const buf = Buffer.from(await blob.arrayBuffer());
    const id = `m_${Date.now()}`;
    const ext = blob.type.includes("webp") ? "webp" : blob.type.includes("png") ? "png" : "jpg";
    const rel = `/uploads/${folder}/${id}.${ext}`;
    const abs = path.join(process.cwd(), "public", "uploads", folder, `${id}.${ext}`);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, buf);
    return NextResponse.json({ success: true, src: rel, bytes: buf.byteLength });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Upload fejlede." }, { status: 500 });
  }
}
