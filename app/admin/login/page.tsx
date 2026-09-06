"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const password = String(new FormData(e.currentTarget).get("password") || "");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login fejlede");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login fejlede");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream text-ink flex items-center justify-center px-5">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.18em] text-gold">Admin</p>
        <h1 className="display mt-2 text-3xl">Log ind</h1>
        <p className="mt-2 text-sm text-ink/60">Adgangskode fra .env.local (ADMIN_PASSWORD).</p>
        <label className="mt-6 block text-sm font-medium" htmlFor="password">Adgangskode</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="mt-1.5 w-full rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-gold"
        />
        {error ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}
        <button type="submit" disabled={busy} className="mt-5 min-h-11 w-full rounded-full bg-ink text-cream font-medium disabled:opacity-60">
          {busy ? "Logger ind…" : "Log ind"}
        </button>
        <p className="mt-4 text-center text-sm"><a href="/" className="text-ink/60 hover:text-ink">← Forside</a></p>
      </form>
    </main>
  );
}
