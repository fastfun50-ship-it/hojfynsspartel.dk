import { promises as fs } from "fs";
import path from "path";

/** Weekdays: JS getDay() 0=Sun…6=Sat; openWeekdays 2–5 = Tue–Fri. Block Sat+Sun always + holidays. */

export type TimeSlot = { id: string; label: string };

export type BookingConfig = {
  openWeekdays: number[];
  timeSlots: TimeSlot[];
  holidays: string[];
};

const CONFIG_FILE = path.join(process.cwd(), "data", "booking-config.json");

export async function readBookingConfig(): Promise<BookingConfig> {
  const raw = await fs.readFile(CONFIG_FILE, "utf8");
  return JSON.parse(raw) as BookingConfig;
}

/** Parse YYYY-MM-DD as local calendar date (noon to avoid DST edge). */
function parseIsoLocal(isoDate: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d, 12, 0, 0, 0);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
}

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isDateBookable(isoDate: string, config: BookingConfig): boolean {
  const dt = parseIsoLocal(isoDate);
  if (!dt) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const check = new Date(dt);
  check.setHours(0, 0, 0, 0);
  if (check < today) return false;
  const dow = dt.getDay(); // 0=Sun … 6=Sat
  if (!config.openWeekdays.includes(dow)) return false;
  if (config.holidays.includes(isoDate)) return false;
  return true;
}

export function listBookableDates(config: BookingConfig, daysAhead = 60): string[] {
  const out: string[] = [];
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = toIsoDate(d);
    if (isDateBookable(iso, config)) out.push(iso);
  }
  return out;
}

export function slotLabel(config: BookingConfig, slotId: string): string | null {
  return config.timeSlots.find((s) => s.id === slotId)?.label ?? null;
}
