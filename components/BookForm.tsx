"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { compressImage } from "@/lib/compress-image";

type TimeSlot = { id: string; label: string };
type BookingConfig = {
  openWeekdays: number[];
  timeSlots: TimeSlot[];
  holidays: string[];
};

type Props = {
  config: BookingConfig;
  bookableDates: string[];
};

const TYPES = [
  "Spartel",
  "Maling",
  "Gulv",
  "Flyttelejlighed",
  "Boligforening",
  "Andet",
] as const;

function formatDateDa(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("da-DK", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BookForm({ config, bookableDates }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(bookableDates[0] || "");
  const [time, setTime] = useState(config.timeSlots[0]?.id || "");
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [previews, setPreviews] = useState<string[]>([]);

  const dateSet = useMemo(() => new Set(bookableDates), [bookableDates]);

  async function onFilesChange(list: FileList | null) {
    setFileError("");
    if (!list || list.length === 0) {
      setFiles([]);
      setPreviews([]);
      return;
    }
    const incoming = Array.from(list);
    const nonImages = incoming.filter((f) => !f.type.startsWith("image/"));
    if (nonImages.length) {
      setFileError("Kun billedfiler er tilladt (JPEG, PNG, WebP).");
      return;
    }
    const next = [...files, ...incoming].slice(0, 3);
    setFiles(next);
    setPreviews(next.map((f) => f.name));
  }

  function removeFile(idx: number) {
    const next = files.filter((_, i) => i !== idx);
    setFiles(next);
    setPreviews(next.map((f) => f.name));
    setFileError("");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFileError("");
    if (!date || !dateSet.has(date)) {
      toast.error("Vælg en ledig dato (tir–fre, ikke helligdag).");
      return;
    }
    if (!config.timeSlots.some((s) => s.id === time)) {
      toast.error("Vælg et tidsrum.");
      return;
    }

    setLoading(true);
    try {
      const form = e.currentTarget;
      const raw = new FormData(form);
      const fd = new FormData();
      fd.set("date", date);
      fd.set("time", time);
      fd.set("name", String(raw.get("name") || ""));
      fd.set("phone", String(raw.get("phone") || ""));
      fd.set("address", String(raw.get("address") || ""));
      fd.set("postnr", String(raw.get("postnr") || ""));
      fd.set("type", String(raw.get("type") || ""));
      fd.set("message", String(raw.get("message") || ""));

      for (const file of files) {
        try {
          const { blob, name } = await compressImage(file);
          fd.append("images", blob, name);
        } catch (err) {
          setFileError(err instanceof Error ? err.message : "Kun billedfiler er tilladt.");
          setLoading(false);
          return;
        }
      }

      const res = await fetch("/api/book", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fejl");
      router.push("/book/tak");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Noget gik galt");
      setLoading(false);
    }
  }

  const field =
    "w-full rounded-lg border border-ink/15 bg-cream px-4 py-3 text-ink outline-none focus:border-gold";
  const label = "mb-1.5 block text-sm text-ink/70";

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-6">
      <div>
        <label htmlFor="date" className={label}>
          Dato
        </label>
        <select
          id="date"
          name="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={field}
        >
          {bookableDates.length === 0 ? (
            <option value="">Ingen ledige datoer</option>
          ) : (
            bookableDates.map((d) => (
              <option key={d} value={d}>
                {formatDateDa(d)}
              </option>
            ))
          )}
        </select>
        <p className="mt-1.5 text-xs text-ink/50">Tirsdag–fredag · helligdage undtaget</p>
      </div>

      <fieldset>
        <legend className={label}>Tidsrum</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {config.timeSlots.map((slot) => (
            <label
              key={slot.id}
              className={[
                "inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full border px-5 transition-colors",
                time === slot.id
                  ? "border-gold bg-gold text-ink"
                  : "border-ink/20 bg-cream text-ink hover:border-gold",
              ].join(" ")}
            >
              <input
                type="radio"
                name="time"
                value={slot.id}
                checked={time === slot.id}
                onChange={() => setTime(slot.id)}
                className="sr-only"
                required
              />
              <span className="font-medium">{slot.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="name" className={label}>
          Navn
        </label>
        <input id="name" name="name" required className={field} autoComplete="name" />
      </div>

      <div>
        <label htmlFor="phone" className={label}>
          Telefon
        </label>
        <input id="phone" name="phone" type="tel" required className={field} autoComplete="tel" />
      </div>

      <div>
        <label htmlFor="address" className={label}>
          Adresse
        </label>
        <input id="address" name="address" required className={field} autoComplete="street-address" />
      </div>

      <div>
        <label htmlFor="postnr" className={label}>
          Postnr
        </label>
        <input id="postnr" name="postnr" required className={field} autoComplete="postal-code" inputMode="numeric" />
      </div>

      <div>
        <label htmlFor="type" className={label}>
          Type
        </label>
        <select id="type" name="type" required className={field} defaultValue="">
          <option value="" disabled>
            Vælg type
          </option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className={label}>
          Besked
        </label>
        <textarea id="message" name="message" rows={4} className={field} placeholder="Kort om opgaven…" />
      </div>

      <div>
        <label htmlFor="images" className={label}>
          Billeder (valgfri, max 3)
        </label>
        <input
          id="images"
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/*"
          multiple
          onChange={(e) => onFilesChange(e.target.files)}
          className="block w-full text-sm text-ink/80 file:mr-4 file:rounded-full file:border-0 file:bg-gold file:px-4 file:py-2 file:font-medium file:text-ink hover:file:bg-ink hover:file:text-cream"
        />
        {fileError ? <p className="mt-2 text-sm text-terracotta">{fileError}</p> : null}
        {previews.length > 0 ? (
          <ul className="mt-3 space-y-1 text-sm text-ink/70">
            {previews.map((name, i) => (
              <li key={`${name}-${i}`} className="flex items-center justify-between gap-2">
                <span className="truncate">{name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="shrink-0 text-ink/50 hover:text-ink underline-offset-2 hover:underline"
                >
                  Fjern
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={loading || !bookableDates.length}
        className="min-h-12 w-full rounded-full bg-gold px-6 font-medium text-ink hover:bg-ink hover:text-cream transition-colors disabled:opacity-60"
      >
        {loading ? "Sender…" : "Book et kig"}
      </button>
    </form>
  );
}
