import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { readContent, writeContent, type SiteContent } from "@/lib/content";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Ikke autoriseret" }, { status: 401 });
  }
  return NextResponse.json(await readContent());
}

export async function PUT(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Ikke autoriseret" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as SiteContent;
    if (
      !body?.hero?.h1 ||
      !Array.isArray(body.ydelser) ||
      body.ydelser.length < 1 ||
      body.ydelser.some((y) => !y?.id || typeof y.title !== "string" || typeof y.body !== "string")
    ) {
      return NextResponse.json({ error: "Ugyldigt indhold" }, { status: 400 });
    }
    await writeContent(body);
    return NextResponse.json({ success: true, content: body });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Kunne ikke gemme" }, { status: 500 });
  }
}
