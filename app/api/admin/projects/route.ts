import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isAdminRequest } from "@/lib/auth";
import { readProjects, writeProjects, type ProjectImage } from "@/lib/projects";

const ALLOWED = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Ikke autoriseret" }, { status: 401 });
  }
  const list = await readProjects();
  return NextResponse.json([...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Ikke autoriseret" }, { status: 401 });
  }
  try {
    const form = await request.formData();
    const file = form.get("file");
    const title = String(form.get("title") || "Projekt").trim() || "Projekt";
    if (!file || typeof file === "string") {
      return NextResponse.json({ success: false, error: "Vælg en billedfil." }, { status: 400 });
    }
    const blob = file as File;
    if (!ALLOWED.has(blob.type)) {
      return NextResponse.json({ success: false, error: "Forkert filtype. Brug JPG, PNG eller WEBP." }, { status: 400 });
    }
    const buf = Buffer.from(await blob.arrayBuffer());
    if (buf.byteLength < 100) {
      return NextResponse.json({ success: false, error: "Filen ser tom ud." }, { status: 400 });
    }
    const id = `p_${Date.now()}`;
    const ext = blob.type.includes("webp") ? "webp" : blob.type.includes("png") ? "png" : "jpg";
    const rel = `/uploads/projects/${id}.${ext}`;
    const abs = path.join(process.cwd(), "public", "uploads", "projects", `${id}.${ext}`);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, buf);
    const list = await readProjects();
    const order = list.length ? Math.max(...list.map((p) => p.order ?? 0)) + 1 : 0;
    const entry: ProjectImage = { id, title, src: rel, createdAt: new Date().toISOString(), order };
    list.push(entry);
    await writeProjects(list);
    return NextResponse.json({ success: true, project: entry });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Upload fejlede." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Ikke autoriseret" }, { status: 401 });
  }
  const body = await request.json();
  if (body?.action === "reorder" && Array.isArray(body.ids)) {
    const list = await readProjects();
    const map = new Map(list.map((p) => [p.id, p]));
    const next: ProjectImage[] = [];
    (body.ids as string[]).forEach((id, i) => {
      const p = map.get(id);
      if (p) next.push({ ...p, order: i });
    });
    // keep any missing at end
    list.forEach((p) => {
      if (!next.find((x) => x.id === p.id)) next.push({ ...p, order: next.length });
    });
    await writeProjects(next);
    return NextResponse.json({ success: true, projects: next });
  }
  if (body?.id && typeof body.title === "string") {
    const list = await readProjects();
    const idx = list.findIndex((p) => p.id === body.id);
    if (idx < 0) return NextResponse.json({ error: "Ikke fundet" }, { status: 404 });
    list[idx] = { ...list[idx], title: body.title.trim() || list[idx].title };
    await writeProjects(list);
    return NextResponse.json({ success: true, project: list[idx] });
  }
  return NextResponse.json({ error: "Ugyldigt request" }, { status: 400 });
}

export async function DELETE(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Ikke autoriseret" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Mangler id" }, { status: 400 });
  const list = await readProjects();
  const item = list.find((p) => p.id === id);
  const next = list.filter((p) => p.id !== id);
  await writeProjects(next);
  if (item?.src?.startsWith("/uploads/")) {
    try {
      await fs.unlink(path.join(process.cwd(), "public", item.src.replace(/^\//, "")));
    } catch { /* ignore */ }
  }
  return NextResponse.json({ success: true });
}
