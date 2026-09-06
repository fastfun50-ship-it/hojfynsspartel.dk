"use client";

import { useState, FormEvent } from "react";
import { toast } from "sonner";

type Props = { phone?: string };

export default function Tilbud({ phone = "21 63 17 93" }: Props) {
  const tel = `tel:${phone.replace(/\s+/g, "")}`;
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      phone: String(fd.get("phone") || ""),
      email: String(fd.get("email") || ""),
      description: String(fd.get("description") || ""),
      start: String(fd.get("start") || ""),
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fejl");
      toast.success("Tak — vi vender tilbage snart.");
      e.currentTarget.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Noget gik galt");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="tilbud" className="bg-ink text-cream">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-2 md:gap-20 md:px-10 md:py-32">
        <div className="fade-in">
          <p className="text-xs uppercase tracking-[0.22em] text-gold">Besked</p>
          <h2 className="display mt-3 text-[clamp(2rem,6vw,3.75rem)]">Send os en besked</h2>
          <p className="mt-6 max-w-md text-cream/70 leading-relaxed">
            Fortæl kort om opgaven. Vi ringer eller skriver tilbage — typisk samme dag.
          </p>
          <a href={tel} className="mt-8 inline-flex min-h-12 items-center rounded-full border border-gold/60 px-6 text-gold hover:bg-gold hover:text-ink transition-colors">
            Ring {phone}
          </a>
        </div>
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm text-cream/70">Navn</label>
            <input id="name" name="name" required className="w-full rounded-lg border border-cream/20 bg-ink px-4 py-3 text-cream outline-none focus:border-gold" />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm text-cream/70">Telefon</label>
            <input id="phone" name="phone" type="tel" required className="w-full rounded-lg border border-cream/20 bg-ink px-4 py-3 text-cream outline-none focus:border-gold" />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm text-cream/70">Email</label>
            <input id="email" name="email" type="email" required className="w-full rounded-lg border border-cream/20 bg-ink px-4 py-3 text-cream outline-none focus:border-gold" />
          </div>
          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm text-cream/70">Beskrivelse</label>
            <textarea id="description" name="description" required rows={4} className="w-full rounded-lg border border-cream/20 bg-ink px-4 py-3 text-cream outline-none focus:border-gold" />
          </div>
          <div>
            <label htmlFor="start" className="mb-1.5 block text-sm text-cream/70">Ønsket start (valgfri)</label>
            <input id="start" name="start" type="text" placeholder="Fx april / snarest" className="w-full rounded-lg border border-cream/20 bg-ink px-4 py-3 text-cream outline-none focus:border-gold" />
          </div>
          <button type="submit" disabled={loading} className="min-h-12 w-full rounded-full bg-gold px-6 font-medium text-ink hover:bg-cream transition-colors disabled:opacity-60">
            {loading ? "Sender…" : "Send besked"}
          </button>
        </form>
      </div>
    </section>
  );
}
