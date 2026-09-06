"use client";

import { useEffect, useState } from "react";

type Props = {
  phone: string;
  phoneHref: string;
};

export default function HeaderBar({ phone, phoneHref }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
        scrolled
          ? "bg-ink/85 backdrop-blur-md border-b border-cream/10"
          : "bg-transparent border-b border-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-5 md:px-10">
        <a href="/" className="min-w-0 text-cream">
          <span className="display block text-lg tracking-wide md:text-xl">Højfynsspartel</span>
          <span className="mt-0.5 block text-[11px] uppercase tracking-[0.18em] text-cream/70">
            Vissenbjerg · Fyn
          </span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-cream/90 md:flex">
          <a href="/#ydelser" className="hover:text-gold transition-colors">
            Ydelser
          </a>
          <a href="/#projekter" className="hover:text-gold transition-colors">
            Projekter
          </a>
          <a href="/#om" className="hover:text-gold transition-colors">
            Om
          </a>
          <a
            href="/book"
            className="inline-flex min-h-11 items-center rounded-full bg-gold px-4 py-2 font-medium text-ink hover:bg-cream transition-colors"
          >
            Book et kig
          </a>
        </nav>
        <div className="flex shrink-0 items-center gap-3 md:hidden">
          <a
            href={phoneHref}
            className="inline-flex min-h-11 items-center text-sm text-cream/80 underline-offset-2 hover:text-gold hover:underline"
            aria-label={`Ring ${phone}`}
          >
            Ring
          </a>
          <a
            href="/book"
            className="inline-flex min-h-11 items-center rounded-full bg-gold px-4 py-2 text-sm font-medium text-ink hover:bg-cream transition-colors"
          >
            Book et kig
          </a>
        </div>
      </div>
    </header>
  );
}
