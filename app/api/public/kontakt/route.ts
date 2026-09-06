import { NextResponse } from "next/server";
import { readContent } from "@/lib/content";

export async function GET() {
  const { kontakt } = await readContent();
  return NextResponse.json(kontakt);
}
