import { NextResponse } from "next/server";
import { signSession, sessionCookieOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const password = process.env.ADMIN_PASSWORD || "";
  if (!password) {
    return NextResponse.json({ success: false, error: "ADMIN_PASSWORD mangler i .env.local" }, { status: 500 });
  }
  let body: { password?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Ugyldigt request." }, { status: 400 });
  }
  if (String(body.password || "") !== password) {
    return NextResponse.json({ success: false, error: "Forkert adgangskode." }, { status: 401 });
  }
  const token = signSession();
  if (!token) {
    return NextResponse.json({ success: false, error: "Kunne ikke oprette session." }, { status: 500 });
  }
  const res = NextResponse.json({ success: true });
  const opts = sessionCookieOptions(token);
  res.cookies.set(opts.name, opts.value, opts);
  return res;
}
