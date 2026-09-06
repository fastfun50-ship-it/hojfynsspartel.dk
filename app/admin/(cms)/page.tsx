"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { compressImage } from "@/lib/compress-image";
import type { SiteContent } from "@/lib/content";
import {
  PROJECT_TYPES,
  TYPE_LABELS,
  type ProjectCase,
  type ProjectType,
} from "@/lib/project-case-types";

type Tab = "projekter" | "forside" | "hero" | "om" | "kontakt";

const TABS: { id: Tab; label: string }[] = [
  { id: "projekter", label: "Projekter" },
  { id: "forside", label: "Forside" },
  { id: "hero", label: "Hero" },
  { id: "om", label: "Om" },
  { id: "kontakt", label: "Kontakt" },
];

const input =
  "w-full rounded-lg border border-ink/15 bg-cream px-3 py-2.5 text-sm outline-none focus:border-gold";
const label = "mb-1 block text-sm text-ink/60";

const emptyDraft = (): Omit<ProjectCase, "id" | "createdAt" | "order"> => ({
  title: "",
  type: "spartel",
  by: "",
  before: "",
  after: "",
  published: false,
  temporary: false,
  blurb: "",
});

export default function AdminCmsPage() {
  const [tab, setTab] = useState<Tab>("projekter");
  const [content, setContent] = useState<SiteContent | null>(null);
  const [cases, setCases] = useState<ProjectCase[]>([]);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [uploadInfo, setUploadInfo] = useState("");

  const load = useCallback(async () => {
    const [cRes, pRes] = await Promise.all([
      fetch("/api/admin/content"),
      fetch("/api/admin/project-cases"),
    ]);
    if (cRes.status === 401 || pRes.status === 401) {
      window.location.href = "/admin/login";
      return;
    }
    if (cRes.ok) setContent(await cRes.json());
    if (pRes.ok) setCases(await pRes.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveContent(next: SiteContent) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gem fejlede");
      setContent(data.content || next);
      toast.success("Gemt");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fejl");
    } finally {
      setBusy(false);
    }
  }

  async function uploadMedia(file: File, folder: string): Promise<string> {
    if (!file.type.startsWith("image/")) {
      throw new Error("Filen er ikke et billede. Vælg JPEG, PNG eller WebP.");
    }
    const origMb = (file.size / (1024 * 1024)).toFixed(1);
    setUploadInfo(`Original: ${origMb} MB — komprimerer…`);
    const { blob, name } = await compressImage(file);
    const outMb = (blob.size / (1024 * 1024)).toFixed(2);
    setUploadInfo(`Original ${origMb} MB → upload ${outMb} MB (${name})`);
    const fd = new FormData();
    fd.append("file", blob, name);
    fd.append("folder", folder);
    const res = await fetch("/api/admin/media", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload fejlede");
    return data.src as string;
  }

  async function createCase() {
    if (!draft.before || !draft.after) {
      toast.error("Upload både før- og efter-foto");
      return;
    }
    if (!draft.by.trim()) {
      toast.error("Angiv by/område (ikke personnavn)");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/project-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          title: draft.title.trim() || "Projekt",
          by: draft.by.trim(),
          published: draft.published,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Opret fejlede");
      toast.success("Projekt oprettet");
      setDraft(emptyDraft());
      setUploadInfo("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fejl");
    } finally {
      setBusy(false);
    }
  }

  async function updateCase(id: string, patch: Partial<ProjectCase>) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/project-cases", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gem fejlede");
      toast.success("Opdateret");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fejl");
    } finally {
      setBusy(false);
    }
  }

  async function deleteCase(id: string) {
    if (!confirm("Slet dette projekt?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/project-cases?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Slet fejlede");
      toast.success("Slettet");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fejl");
    } finally {
      setBusy(false);
    }
  }

  if (!content) {
    return <p className="text-ink/50">Henter…</p>;
  }

  return (
    <div>
      <div className="mb-6 rounded-xl border border-gold/40 bg-gold/15 px-4 py-3 text-sm text-ink">
        <p className="font-medium">Forside = 4 billeder. Projekter = før+efter fra samme sted.</p>
        <p className="mt-1 text-ink/65">
          Offentligt vises kun projekter der er publiceret og har både før- og efter-foto.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-ink/10 pb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? "bg-gold text-ink" : "bg-white border border-ink/10 hover:border-gold"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "projekter" && (
        <section className="mt-8 space-y-6">
          <div className="rounded-2xl border border-ink/10 bg-white/60 p-5">
            <h2 className="display text-2xl">Nyt projekt (før / efter)</h2>
            <p className="mt-1 text-sm text-ink/55">
              Samme vinkel. Komprimeres i browseren (max ~2400 px). Kun JPEG/PNG/WebP.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <label className={label}>Titel</label>
                <input
                  className={input}
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Fx Stue"
                />
              </div>
              <div>
                <label className={label}>By / område (ikke personnavn)</label>
                <input
                  className={input}
                  value={draft.by}
                  onChange={(e) => setDraft({ ...draft, by: e.target.value })}
                  placeholder="Fx Odense C"
                />
              </div>
              <div>
                <label className={label}>Type</label>
                <select
                  className={input}
                  value={draft.type}
                  onChange={(e) =>
                    setDraft({ ...draft, type: e.target.value as ProjectType })
                  }
                >
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.published}
                    onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
                  />
                  Publiceret
                </label>
              </div>
              <div className="md:col-span-2">
                <label className={label}>Kort tekst (valgfri)</label>
                <textarea
                  className={input}
                  rows={2}
                  value={draft.blurb || ""}
                  onChange={(e) => setDraft({ ...draft, blurb: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-medium">Før-foto</p>
                {draft.before ? (
                  <img src={draft.before} alt="Før" className="mb-2 aspect-[4/5] w-full rounded-lg object-cover" />
                ) : null}
                <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-gold/50 bg-cream px-4 py-8 hover:border-gold">
                  <span className="text-sm font-medium">{busy ? "Behandler…" : "Upload før"}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/*"
                    className="hidden"
                    disabled={busy}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (!f) return;
                      setBusy(true);
                      try {
                        const src = await uploadMedia(f, "cases");
                        setDraft((d) => ({ ...d, before: src }));
                        toast.success("Før-foto klar");
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Fejl");
                      } finally {
                        setBusy(false);
                      }
                    }}
                  />
                </label>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Efter-foto</p>
                {draft.after ? (
                  <img src={draft.after} alt="Efter" className="mb-2 aspect-[4/5] w-full rounded-lg object-cover" />
                ) : null}
                <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-gold/50 bg-cream px-4 py-8 hover:border-gold">
                  <span className="text-sm font-medium">{busy ? "Behandler…" : "Upload efter"}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/*"
                    className="hidden"
                    disabled={busy}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (!f) return;
                      setBusy(true);
                      try {
                        const src = await uploadMedia(f, "cases");
                        setDraft((d) => ({ ...d, after: src }));
                        toast.success("Efter-foto klar");
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Fejl");
                      } finally {
                        setBusy(false);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
            {uploadInfo ? <p className="mt-2 text-sm text-ink/60">{uploadInfo}</p> : null}
            <button
              type="button"
              disabled={busy}
              onClick={createCase}
              className="mt-5 min-h-11 rounded-full bg-ink px-6 font-medium text-cream disabled:opacity-60"
            >
              Opret projekt
            </button>
          </div>

          <ul className="space-y-4">
            {cases.length === 0 && (
              <li className="text-sm text-ink/50">Ingen projekter endnu.</li>
            )}
            {cases.map((c) => (
              <li key={c.id} className="rounded-xl border border-ink/10 bg-white/70 p-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-wider text-ink/45">Før</p>
                    {c.before ? (
                      <img src={c.before} alt="" className="aspect-[4/5] w-full rounded-lg object-cover" />
                    ) : (
                      <p className="text-sm text-red-700">Mangler</p>
                    )}
                  </div>
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-wider text-ink/45">Efter</p>
                    {c.after ? (
                      <img src={c.after} alt="" className="aspect-[4/5] w-full rounded-lg object-cover" />
                    ) : (
                      <p className="text-sm text-red-700">Mangler</p>
                    )}
                  </div>
                  <div className="space-y-2 sm:min-w-[200px]">
                    {c.temporary ? (
                      <span className="inline-block rounded-full bg-gold px-2 py-0.5 text-[10px] font-medium uppercase text-ink">
                        Midlertidig
                      </span>
                    ) : null}
                    <input
                      className={input}
                      defaultValue={c.title}
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v && v !== c.title) updateCase(c.id, { title: v });
                      }}
                    />
                    <input
                      className={input}
                      defaultValue={c.by}
                      placeholder="By"
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v && v !== c.by) updateCase(c.id, { by: v });
                      }}
                    />
                    <select
                      className={input}
                      value={c.type}
                      onChange={(e) =>
                        updateCase(c.id, { type: e.target.value as ProjectType })
                      }
                    >
                      {PROJECT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {TYPE_LABELS[t]}
                        </option>
                      ))}
                    </select>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={c.published}
                        onChange={(e) => updateCase(c.id, { published: e.target.checked })}
                        disabled={busy}
                      />
                      Publiceret
                    </label>
                    <p className="text-xs text-ink/45">
                      {!c.before || !c.after
                        ? "Skjult på forside (mangler foto)"
                        : c.published
                          ? "Vises på forside"
                          : "Skjult (ikke publiceret)"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <label className="cursor-pointer text-xs text-gold underline">
                        Skift før
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={busy}
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            e.target.value = "";
                            if (!f) return;
                            setBusy(true);
                            try {
                              const src = await uploadMedia(f, "cases");
                              await updateCase(c.id, { before: src });
                            } catch (err) {
                              toast.error(err instanceof Error ? err.message : "Fejl");
                              setBusy(false);
                            }
                          }}
                        />
                      </label>
                      <label className="cursor-pointer text-xs text-gold underline">
                        Skift efter
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={busy}
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            e.target.value = "";
                            if (!f) return;
                            setBusy(true);
                            try {
                              const src = await uploadMedia(f, "cases");
                              await updateCase(c.id, { after: src });
                            } catch (err) {
                              toast.error(err instanceof Error ? err.message : "Fejl");
                              setBusy(false);
                            }
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        className="rounded border border-red-200 px-2 py-1 text-xs text-red-700"
                        onClick={() => deleteCase(c.id)}
                        disabled={busy}
                      >
                        Slet
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "forside" && (
        <section className="mt-8 space-y-6">
          <p className="text-sm text-ink/60">
            Fire sektioner på forsiden (Spartel / Maling / Finish / Gulv): titel, én linje tekst, ét billede.
          </p>
          {content.ydelser.map((slot, i) => (
            <div key={slot.id} className="rounded-2xl border border-ink/10 bg-white/60 p-5">
              <p className="text-xs uppercase tracking-widest text-gold">{slot.id}</p>
              <div className="mt-3 grid gap-3">
                <div>
                  <label className={label}>Titel</label>
                  <input
                    className={input}
                    value={slot.title}
                    onChange={(e) => {
                      const ydelser = [...content.ydelser];
                      ydelser[i] = { ...slot, title: e.target.value };
                      setContent({ ...content, ydelser });
                    }}
                  />
                </div>
                <div>
                  <label className={label}>Én linje / kort tekst</label>
                  <textarea
                    className={input}
                    rows={2}
                    value={slot.body}
                    onChange={(e) => {
                      const ydelser = [...content.ydelser];
                      ydelser[i] = { ...slot, body: e.target.value };
                      setContent({ ...content, ydelser });
                    }}
                  />
                </div>
                <div>
                  <label className={label}>Billede</label>
                  {slot.image ? (
                    <img
                      src={slot.image}
                      alt={slot.title}
                      className="mb-2 max-h-48 rounded-lg object-cover"
                    />
                  ) : null}
                  <input
                    className={input}
                    value={slot.image}
                    onChange={(e) => {
                      const ydelser = [...content.ydelser];
                      ydelser[i] = { ...slot, image: e.target.value };
                      setContent({ ...content, ydelser });
                    }}
                  />
                  <label className="mt-2 inline-flex cursor-pointer text-sm text-gold underline">
                    Erstat billede
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/*"
                      className="hidden"
                      disabled={busy}
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        if (!f || !content) return;
                        setBusy(true);
                        try {
                          const src = await uploadMedia(f, "cms");
                          const ydelser = [...content.ydelser];
                          ydelser[i] = { ...slot, image: src };
                          setContent({ ...content, ydelser });
                          toast.success("Uploadet — husk Gem");
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Fejl");
                        } finally {
                          setBusy(false);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            disabled={busy}
            onClick={() => saveContent(content)}
            className="min-h-11 rounded-full bg-ink px-6 font-medium text-cream disabled:opacity-60"
          >
            Gem forside
          </button>
        </section>
      )}

      {tab === "hero" && (
        <section className="mt-8 space-y-4 rounded-2xl border border-ink/10 bg-white/60 p-5">
          <h2 className="display text-2xl">Hero</h2>
          <div>
            <label className={label}>H1</label>
            <input
              className={input}
              value={content.hero.h1}
              onChange={(e) =>
                setContent({ ...content, hero: { ...content.hero, h1: e.target.value } })
              }
            />
          </div>
          <div>
            <label className={label}>Under</label>
            <input
              className={input}
              value={content.hero.under}
              onChange={(e) =>
                setContent({ ...content, hero: { ...content.hero, under: e.target.value } })
              }
            />
          </div>
          <div>
            <label className={label}>Note</label>
            <input
              className={input}
              value={content.hero.note || ""}
              onChange={(e) =>
                setContent({ ...content, hero: { ...content.hero, note: e.target.value } })
              }
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={label}>Desktop 16:9 (sti)</label>
              <input
                className={input}
                value={content.hero.desktop}
                onChange={(e) =>
                  setContent({ ...content, hero: { ...content.hero, desktop: e.target.value } })
                }
              />
              <label className="mt-2 flex cursor-pointer text-sm text-gold underline">
                Upload desktop
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={busy}
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f || !content) return;
                    setBusy(true);
                    try {
                      const src = await uploadMedia(f, "cms");
                      setContent({
                        ...content,
                        hero: { ...content.hero, desktop: src, desktopWebp: undefined },
                      });
                      toast.success("Desktop uploadet — husk Gem");
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Fejl");
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
              </label>
            </div>
            <div>
              <label className={label}>Mobil 4:5 (sti)</label>
              <input
                className={input}
                value={content.hero.mobile}
                onChange={(e) =>
                  setContent({ ...content, hero: { ...content.hero, mobile: e.target.value } })
                }
              />
              <label className="mt-2 flex cursor-pointer text-sm text-gold underline">
                Upload mobil
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={busy}
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f || !content) return;
                    setBusy(true);
                    try {
                      const src = await uploadMedia(f, "cms");
                      setContent({
                        ...content,
                        hero: { ...content.hero, mobile: src, mobileWebp: undefined },
                      });
                      toast.success("Mobil uploadet — husk Gem");
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Fejl");
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
              </label>
            </div>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => saveContent(content)}
            className="min-h-11 rounded-full bg-ink px-6 font-medium text-cream disabled:opacity-60"
          >
            Gem hero
          </button>
        </section>
      )}

      {tab === "om" && (
        <section className="mt-8 space-y-4 rounded-2xl border border-ink/10 bg-white/60 p-5">
          <h2 className="display text-2xl">Om</h2>
          <div>
            <label className={label}>Overskrift</label>
            <input
              className={input}
              value={content.om.heading}
              onChange={(e) =>
                setContent({ ...content, om: { ...content.om, heading: e.target.value } })
              }
            />
          </div>
          <div>
            <label className={label}>Kort tekst</label>
            <textarea
              className={input}
              rows={3}
              value={content.om.body}
              onChange={(e) =>
                setContent({ ...content, om: { ...content.om, body: e.target.value } })
              }
            />
          </div>
          <div>
            <label className={label}>Michael</label>
            <textarea
              className={input}
              rows={2}
              value={content.om.michael}
              onChange={(e) =>
                setContent({ ...content, om: { ...content.om, michael: e.target.value } })
              }
            />
          </div>
          <div>
            <label className={label}>Mikkel</label>
            <textarea
              className={input}
              rows={2}
              value={content.om.mikkel}
              onChange={(e) =>
                setContent({ ...content, om: { ...content.om, mikkel: e.target.value } })
              }
            />
          </div>
          <div>
            <label className={label}>Billede (valgfri sti)</label>
            <input
              className={input}
              value={content.om.image || ""}
              onChange={(e) =>
                setContent({ ...content, om: { ...content.om, image: e.target.value } })
              }
            />
            <label className="mt-2 inline-flex cursor-pointer text-sm text-gold underline">
              Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={busy}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (!f || !content) return;
                  setBusy(true);
                  try {
                    const src = await uploadMedia(f, "cms");
                    setContent({ ...content, om: { ...content.om, image: src } });
                    toast.success("Uploadet — husk Gem");
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Fejl");
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            </label>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => saveContent(content)}
            className="min-h-11 rounded-full bg-ink px-6 font-medium text-cream disabled:opacity-60"
          >
            Gem om
          </button>
        </section>
      )}

      {tab === "kontakt" && (
        <section className="mt-8 space-y-4 rounded-2xl border border-ink/10 bg-white/60 p-5">
          <h2 className="display text-2xl">Kontakt</h2>
          <p className="text-sm text-ink/55">Vises på sitet. Formular bruger stadig Resend / inquiries.json.</p>
          <div>
            <label className={label}>Telefon</label>
            <input
              className={input}
              value={content.kontakt.phone}
              onChange={(e) =>
                setContent({
                  ...content,
                  kontakt: { ...content.kontakt, phone: e.target.value },
                })
              }
            />
          </div>
          <div>
            <label className={label}>Email</label>
            <input
              className={input}
              value={content.kontakt.email}
              onChange={(e) =>
                setContent({
                  ...content,
                  kontakt: { ...content.kontakt, email: e.target.value },
                })
              }
            />
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => saveContent(content)}
            className="min-h-11 rounded-full bg-ink px-6 font-medium text-cream disabled:opacity-60"
          >
            Gem kontakt
          </button>
        </section>
      )}
    </div>
  );
}
