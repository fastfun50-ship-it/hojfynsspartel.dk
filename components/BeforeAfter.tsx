"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

type Props = {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
  initial?: number;
};

export default function BeforeAfter({
  beforeSrc,
  afterSrc,
  beforeAlt = "Før",
  afterAlt = "Efter",
  initial = 50,
}: Props) {
  const [pos, setPos] = useState(() => Math.min(100, Math.max(0, initial)));
  const [rootW, setRootW] = useState(0);
  const dragging = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const labelId = useId();

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setRootW(el.offsetWidth));
    ro.observe(el);
    setRootW(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const setFromClientX = useCallback((clientX: number) => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, next)));
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      setFromClientX(e.clientX);
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [setFromClientX]);

  return (
    <div
      ref={rootRef}
      className="relative aspect-[4/5] w-full select-none overflow-hidden bg-ink/10 touch-none md:aspect-[16/10]"
      onPointerDown={(e) => {
        if (e.button !== 0 && e.pointerType === "mouse") return;
        dragging.current = true;
        try {
          (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        } catch {
          /* ignore */
        }
        setFromClientX(e.clientX);
      }}
    >
      {/* Baggrund = efter (højre). Venstre clip = før. */}
      <img
        src={afterSrc}
        alt={afterAlt}
        className="absolute inset-0 block h-full w-full object-cover"
        draggable={false}
      />

      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${pos}%` }}
      >
        <div className="relative h-full" style={{ width: rootW || "100%" }}>
          <img
            src={beforeSrc}
            alt={beforeAlt}
            className="absolute inset-0 block h-full w-full object-cover"
            draggable={false}
            style={{ width: rootW || "100%", maxWidth: "none" }}
          />
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-cream shadow-[0_0_0_1px_rgba(0,0,0,0.25)]"
        style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
      >
        <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cream/80 bg-ink/80 text-cream shadow-md">
          <span className="text-xs" aria-hidden>
            {"‹ ›"}
          </span>
        </span>
      </div>

      <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-ink/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-cream">
        Før
      </span>
      <span className="pointer-events-none absolute right-3 top-3 z-10 rounded-full bg-ink/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-cream">
        Efter
      </span>

      <span id={labelId} className="sr-only">
        Før / efter-slider
      </span>
      <div
        role="slider"
        tabIndex={0}
        aria-labelledby={labelId}
        aria-label="Før / efter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        className="absolute inset-y-0 z-20 w-11 -translate-x-1/2 cursor-ew-resize outline-none focus-visible:ring-2 focus-visible:ring-gold"
        style={{ left: `${pos}%` }}
      />
    </div>
  );
}
