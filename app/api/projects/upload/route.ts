import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";

/** Legacy route — auth required; prefer /api/admin/projects */
export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Ikke autoriseret" }, { status: 401 });
  }
  const { readProjects } = await import("@/lib/projects");
  return NextResponse.json(await readProjects());
}

export async function POST() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Ikke autoriseret" }, { status: 401 });
  }
  return NextResponse.json(
    { success: false, error: "Brug /api/admin/projects" },
    { status: 410 },
  );
}
