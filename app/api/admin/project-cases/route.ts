import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isAdminRequest } from "@/lib/auth";
import {
  isProjectType,
  readProjectCases,
  writeProjectCases,
  type ProjectCase,
  type ProjectType,
} from "@/lib/project-cases";

function normalizeCase(raw: Partial<ProjectCase> & { id?: string }): ProjectCase | null {
  const type = raw.type;
  if (!isProjectType(type)) return null;
  const before = String(raw.before || "").trim();
  const after = String(raw.after || "").trim();
  const by = String(raw.by || "").trim();
  const title = String(raw.title || "").trim() || "Projekt";
  return {
    id: String(raw.id || `c_${Date.now()}`),
    title,
    type: type as ProjectType,
    by: by || "Fyn",
    before,
    after,
    temporary: Boolean(raw.temporary),
    published: Boolean(raw.published),
    blurb: raw.blurb ? String(raw.blurb) : undefined,
    createdAt: raw.createdAt || new Date().toISOString(),
    order: typeof raw.order === "number" ? raw.order : 0,
  };
}

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Ikke autoriseret" }, { status: 401 });
  }
  const list = await readProjectCases();
  return NextResponse.json([...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Ikke autoriseret" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const list = await readProjectCases();
    const order = list.length ? Math.max(...list.map((p) => p.order ?? 0)) + 1 : 0;
    const entry = normalizeCase({
      ...body,
      id: `c_${Date.now()}`,
      createdAt: new Date().toISOString(),
      order,
      temporary: false,
    });
    if (!entry) {
      return NextResponse.json(
        { error: "Ugyldigt projekt — kræver type (spartel|maling|gulv|flyttelejlighed)." },
        { status: 400 }
      );
    }
    list.push(entry);
    await writeProjectCases(list);
    return NextResponse.json({ success: true, case: entry });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Kunne ikke oprette" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Ikke autoriseret" }, { status: 401 });
  }
  try {
    const body = await request.json();
    if (body?.action === "reorder" && Array.isArray(body.ids)) {
      const list = await readProjectCases();
      const map = new Map(list.map((p) => [p.id, p]));
      const next: ProjectCase[] = [];
      (body.ids as string[]).forEach((id, i) => {
        const p = map.get(id);
        if (p) next.push({ ...p, order: i });
      });
      list.forEach((p) => {
        if (!next.find((x) => x.id === p.id)) next.push({ ...p, order: next.length });
      });
      await writeProjectCases(next);
      return NextResponse.json({ success: true, cases: next });
    }
    if (!body?.id) {
      return NextResponse.json({ error: "Mangler id" }, { status: 400 });
    }
    const list = await readProjectCases();
    const idx = list.findIndex((p) => p.id === body.id);
    if (idx < 0) return NextResponse.json({ error: "Ikke fundet" }, { status: 404 });
    const merged = normalizeCase({ ...list[idx], ...body, id: list[idx].id, createdAt: list[idx].createdAt });
    if (!merged) {
      return NextResponse.json({ error: "Ugyldigt projekt" }, { status: 400 });
    }
    list[idx] = merged;
    await writeProjectCases(list);
    return NextResponse.json({ success: true, case: list[idx] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Kunne ikke gemme" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Ikke autoriseret" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Mangler id" }, { status: 400 });
  const list = await readProjectCases();
  const item = list.find((p) => p.id === id);
  const next = list.filter((p) => p.id !== id);
  await writeProjectCases(next);
  for (const src of [item?.before, item?.after]) {
    if (src?.startsWith("/uploads/")) {
      try {
        await fs.unlink(path.join(process.cwd(), "public", src.replace(/^\//, "")));
      } catch {
        /* ignore */
      }
    }
  }
  return NextResponse.json({ success: true });
}
