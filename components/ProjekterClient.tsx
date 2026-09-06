"use client";

import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import BeforeAfter from "@/components/BeforeAfter";
import { TYPE_LABELS, type ProjectCase, type ProjectType } from "@/lib/project-case-types";

function typeLabel(t: ProjectType | string) {
  return TYPE_LABELS[t as ProjectType] || t;
}

type NavDir = "prev" | "next" | null;

export default function ProjekterClient({ cases }: { cases: ProjectCase[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [navDir, setNavDir] = useState<NavDir>(null);
  const [animTick, setAnimTick] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const openIndex = openId ? cases.findIndex((c) => c.id === openId) : -1;
  const active = openIndex >= 0 ? cases[openIndex] : null;
  const multi = cases.length > 1;
  /** Forside-grid: max 2 kort. Resten kun via overlay-pile. */
  const gridCases = cases.slice(0, 2);

  const close = useCallback(() => {
    setOpenId(null);
    setNavDir(null);
  }, []);

  const goPrev = useCallback(() => {
    if (cases.length <= 1 || openIndex < 0) return;
    const next = (openIndex - 1 + cases.length) % cases.length;
    setNavDir("prev");
    setAnimTick((t) => t + 1);
    setOpenId(cases[next].id);
  }, [cases, openIndex]);

  const goNext = useCallback(() => {
    if (cases.length <= 1 || openIndex < 0) return;
    const next = (openIndex + 1) % cases.length;
    setNavDir("next");
    setAnimTick((t) => t + 1);
    setOpenId(cases[next].id);
  }, [cases, openIndex]);

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [openId, close, goPrev, goNext]);

  const onMetaTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  };

  const onMetaTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current == null || !multi) return;
    const x = e.changedTouches[0]?.clientX;
    if (x == null) {
      touchStartX.current = null;
      return;
    }
    const dx = x - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 50) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  const animClass =
    navDir === "next"
      ? "project-slide-from-right"
      : navDir === "prev"
        ? "project-slide-from-left"
        : "project-slide-fade";

  const arrowBtnClass =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cream/25 bg-ink/80 text-cream shadow-md transition hover:bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold";

  return (
    <section id="projekter" className="bg-cream text-ink">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32">
        <p className="text-xs uppercase tracking-[0.22em] text-gold">Projekter</p>
        <h2 className="display mt-3 text-[clamp(2rem,6vw,3.75rem)]">Før &amp; efter.</h2>
        <p className="mt-4 max-w-xl text-ink/65 leading-relaxed">
          Træk i midten og se forskellen — samme vinkel, før og efter.
          {cases.length > 2 ? " Åbn et projekt og bladre med pilene for flere." : null}
        </p>
      </div>

      <div className="case-grid px-2 md:px-4 lg:px-6">
        {gridCases.map((c, i) => {
          const thumb = c.after;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setNavDir(null);
                setAnimTick((t) => t + 1);
                setOpenId(c.id);
              }}
              className={`fade-in group relative block w-full overflow-hidden bg-ink/5 text-left ${
                i === 0 ? "aspect-[4/5] md:col-span-2 md:aspect-[16/10] lg:col-span-2" : "aspect-[4/5]"
              }`}
              style={{ animationDelay: `${Math.min(i, 5) * 0.08}s` }}
            >
              <img
                src={thumb}
                alt={c.title || "Projekt"}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/75 to-transparent px-4 pb-4 pt-14">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-cream/95">{c.title}</span>
                  {c.temporary ? (
                    <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink">
                      Midlertidig
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-cream/70">
                  {typeLabel(c.type)} · {c.by}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="h-20 md:h-28" />

      {active ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/70 p-0 sm:items-center sm:p-4 md:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={close}
        >
          <div
            className="flex w-full max-w-5xl items-center gap-2 sm:gap-3 md:gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {multi ? (
              <button
                type="button"
                onClick={goPrev}
                className={`${arrowBtnClass} hidden sm:flex`}
                aria-label="Forrige projekt"
              >
                <span aria-hidden className="text-xl leading-none">
                  ‹
                </span>
              </button>
            ) : null}

            <div className="relative max-h-[95svh] w-full max-w-4xl flex-1 overflow-y-auto bg-cream text-ink shadow-2xl sm:rounded-2xl">
              <div key={`${active.id}-${animTick}`} className={animClass}>
                <BeforeAfter
                  beforeSrc={active.before}
                  afterSrc={active.after}
                  beforeAlt={`Før — ${active.title}`}
                  afterAlt={`Efter — ${active.title}`}
                />

                {multi ? (
                  <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-5 py-3 sm:hidden">
                    <button
                      type="button"
                      onClick={goPrev}
                      className={arrowBtnClass}
                      aria-label="Forrige projekt"
                    >
                      <span aria-hidden className="text-xl leading-none">
                        ‹
                      </span>
                    </button>
                    <p className="text-xs text-ink/50">
                      {openIndex + 1} / {cases.length}
                    </p>
                    <button
                      type="button"
                      onClick={goNext}
                      className={arrowBtnClass}
                      aria-label="Næste projekt"
                    >
                      <span aria-hidden className="text-xl leading-none">
                        ›
                      </span>
                    </button>
                  </div>
                ) : null}

                <div
                  className="px-5 py-6 md:px-8 md:py-8"
                  onTouchStart={onMetaTouchStart}
                  onTouchEnd={onMetaTouchEnd}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="display text-2xl md:text-3xl">{active.title}</h3>
                        {active.temporary ? (
                          <span className="rounded-full bg-gold px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-ink">
                            Midlertidig
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-ink/60">
                        {typeLabel(active.type)} · {active.by}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={close}
                      className="shrink-0 rounded-full bg-ink/80 px-3 py-1.5 text-sm text-cream hover:bg-ink"
                      aria-label="Luk"
                    >
                      Luk
                    </button>
                  </div>
                  {active.blurb ? (
                    <p className="mt-4 max-w-2xl text-ink/75 leading-relaxed">{active.blurb}</p>
                  ) : null}
                  {multi ? (
                    <p className="mt-4 hidden text-xs text-ink/40 sm:block">
                      {openIndex + 1} / {cases.length} · piletaster skifter projekt
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {multi ? (
              <button
                type="button"
                onClick={goNext}
                className={`${arrowBtnClass} hidden sm:flex`}
                aria-label="Næste projekt"
              >
                <span aria-hidden className="text-xl leading-none">
                  ›
                </span>
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
