import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import {
  isDateBookable,
  readBookingConfig,
  slotLabel,
} from "@/lib/booking";

export const runtime = "nodejs";

const BOOKINGS_FILE = path.join(process.cwd(), "data", "bookings.json");
const LAST_MAIL_FILE = path.join(process.cwd(), "data", "last-book-mail.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "book");

function uniqueName(original: string) {
  const safe = original.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "image";
  const stamp = Date.now();
  const rand = randomBytes(4).toString("hex");
  return `${stamp}-${rand}-${safe}`;
}

async function readBookings(): Promise<unknown[]> {
  try {
    return JSON.parse(await fs.readFile(BOOKINGS_FILE, "utf8"));
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const date = String(form.get("date") || "").trim();
    const time = String(form.get("time") || "").trim();
    const name = String(form.get("name") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const address = String(form.get("address") || "").trim();
    const postnr = String(form.get("postnr") || "").trim();
    const type = String(form.get("type") || "").trim();
    const message = String(form.get("message") || "").trim();

    if (!date || !time || !name || !phone || !address || !postnr || !type) {
      return NextResponse.json(
        { ok: false, error: "Udfyld alle obligatoriske felter." },
        { status: 400 }
      );
    }

    const config = await readBookingConfig();
    if (!isDateBookable(date, config)) {
      return NextResponse.json(
        { ok: false, error: "Datoen er ikke ledig (tir–fre, ikke helligdag)." },
        { status: 400 }
      );
    }
    const interval = slotLabel(config, time);
    if (!interval) {
      return NextResponse.json({ ok: false, error: "Ugyldigt tidsrum." }, { status: 400 });
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const imagePaths: string[] = [];
    const imageEntries = form.getAll("images");
    for (const entry of imageEntries) {
      if (!(entry instanceof File) || entry.size === 0) continue;
      if (!entry.type.startsWith("image/")) {
        return NextResponse.json(
          { ok: false, error: "Kun billedfiler er tilladt." },
          { status: 400 }
        );
      }
      const fname = uniqueName(entry.name || "image.jpg");
      const buf = Buffer.from(await entry.arrayBuffer());
      await fs.writeFile(path.join(UPLOAD_DIR, fname), buf);
      imagePaths.push(`/uploads/book/${fname}`);
    }
    if (imagePaths.length > 3) {
      return NextResponse.json({ ok: false, error: "Max 3 billeder." }, { status: 400 });
    }

    const id = `book_${Date.now()}_${randomBytes(3).toString("hex")}`;
    const entry = {
      id,
      date,
      time,
      interval,
      name,
      phone,
      address,
      postnr,
      type,
      message: message || undefined,
      images: imagePaths,
      createdAt: new Date().toISOString(),
    };

    const list = await readBookings();
    list.unshift(entry);
    await fs.mkdir(path.dirname(BOOKINGS_FILE), { recursive: true });
    await fs.writeFile(BOOKINGS_FILE, JSON.stringify(list, null, 2) + "\n", "utf8");

    const subject = `Kig ${date} ${interval} — ${name}`;
    const imageLines =
      imagePaths.length > 0
        ? imagePaths.map((p) => `  ${p}`).join("\n")
        : "  (ingen)";
    const text = [
      `Booking-id: ${id}`,
      `Dato: ${date}`,
      `Tidsrum: ${interval} (${time})`,
      `Navn: ${name}`,
      `Telefon: ${phone}`,
      `Adresse: ${address}`,
      `Postnr: ${postnr}`,
      `Type: ${type}`,
      `Besked: ${message || "—"}`,
      `Billeder:`,
      imageLines,
    ].join("\n");

    const BOOK_TO = process.env.BOOK_TO || process.env.CONTACT_TO || process.env.CONTACT_TO_EMAIL;
    const BOOK_CC = process.env.BOOK_CC;
    const FROM_EMAIL = process.env.CONTACT_FROM || process.env.CONTACT_FROM_EMAIL;
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    let sent = false;
    const to = BOOK_TO || "";
    // Always record BOOK_CC (Peter midlertidig lås — også når samme som TO)
    const cc = BOOK_CC || "";

    if (RESEND_API_KEY && FROM_EMAIL && BOOK_TO) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(RESEND_API_KEY);
        await resend.emails.send({
          from: FROM_EMAIL,
          to: [BOOK_TO],
          ...(cc ? { cc: [cc] } : {}),
          subject,
          text,
        });
        sent = true;
      } catch (e) {
        console.error("[book] resend", e);
        console.log("[book] mail body (send failed):\n", subject, "\n", text);
      }
    } else {
      console.log("[book] Resend env incomplete — inquiry saved. Mail body:\n", subject, "\n", text);
    }

    const mailEvidence = {
      subject,
      text,
      to,
      cc: cc || null,
      sent,
      bookingId: id,
      at: new Date().toISOString(),
    };
    await fs.writeFile(LAST_MAIL_FILE, JSON.stringify(mailEvidence, null, 2) + "\n", "utf8");

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("[book]", err);
    return NextResponse.json({ ok: false, error: "Noget gik galt." }, { status: 500 });
  }
}
