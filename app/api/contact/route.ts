import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || body.navn || "").trim();
    const phone = String(body.phone || body.telefon || "").trim();
    const email = String(body.email || "").trim();
    const description = String(body.description || body.beskrivelse || "").trim();
    const start = String(body.start || body.starttidspunkt || "").trim();

    if (!name || !phone || !email || !description) {
      return NextResponse.json(
        { success: false, error: "Udfyld navn, telefon, email og beskrivelse." },
        { status: 400 }
      );
    }

    const entry = {
      id: `inq_${Date.now()}`,
      name,
      phone,
      email,
      description,
      start: start || undefined,
      createdAt: new Date().toISOString(),
    };

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.CONTACT_FROM || process.env.CONTACT_FROM_EMAIL;
    const TO_EMAIL = process.env.CONTACT_TO || process.env.CONTACT_TO_EMAIL;

    if (RESEND_API_KEY && FROM_EMAIL && TO_EMAIL) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(RESEND_API_KEY);
        await resend.emails.send({
          from: FROM_EMAIL,
          to: [TO_EMAIL],
          subject: `Tilbud · ${name}`,
          replyTo: email,
          text: `Navn: ${name}\nTelefon: ${phone}\nEmail: ${email}\nStart: ${start || "—"}\n\n${description}`,
        });
      } catch (e) {
        console.error("[contact] resend", e);
      }
    }

    const file = path.join(process.cwd(), "data", "inquiries.json");
    let list: unknown[] = [];
    try {
      list = JSON.parse(await fs.readFile(file, "utf8"));
    } catch {}
    list.unshift(entry);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(list, null, 2), "utf8");

    return NextResponse.json({ success: true, ok: true, id: entry.id });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ success: false, error: "Noget gik galt." }, { status: 500 });
  }
}
