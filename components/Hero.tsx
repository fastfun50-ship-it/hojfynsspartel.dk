import { readContent, phoneHref } from "@/lib/content";

export default async function Hero() {
  const { hero, kontakt } = await readContent();
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-ink">
      <picture className="absolute inset-0">
        {hero.desktopWebp ? (
          <source media="(min-width: 768px)" srcSet={hero.desktopWebp} type="image/webp" />
        ) : null}
        <source media="(min-width: 768px)" srcSet={hero.desktop} />
        {hero.mobileWebp ? <source srcSet={hero.mobileWebp} type="image/webp" /> : null}
        <img src={hero.mobile} alt="" className="h-full w-full object-cover" fetchPriority="high" />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-ink/20" />
      <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-5 pb-14 pt-24 md:px-10 md:pb-24">
        <div className="fade-in mx-auto w-full max-w-7xl">
          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-gold">Spartel · Maling · Finish</p>
          <h1 className="display max-w-4xl text-[clamp(2.75rem,10vw,6.5rem)] text-cream">{hero.h1}</h1>
          <p className="mt-5 max-w-xl text-lg text-cream/85 md:text-xl">{hero.under}</p>
          {hero.note ? <p className="mt-3 max-w-md text-sm text-cream/60">{hero.note}</p> : null}
          <div className="mt-8 flex w-full max-w-xl flex-wrap gap-3">
            <a href="/book" className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-gold px-5 text-base font-medium text-ink hover:bg-cream transition-colors sm:flex-none">Book et kig</a>
            <a href={phoneHref(kontakt.phone)} className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-cream/50 px-5 text-base text-cream hover:bg-cream/10 transition-colors sm:flex-none">Ring {kontakt.phone}</a>
          </div>
          <p className="mt-4">
            <a href="#tilbud" className="text-sm text-cream/55 underline-offset-4 hover:text-gold hover:underline transition-colors">Send os en besked</a>
          </p>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2 text-sm text-cream/70">
            <span>15 år</span><span className="text-gold">·</span><span>Vissenbjerg</span><span className="text-gold">·</span><span>Fyn</span>
          </div>
        </div>
      </div>
    </section>
  );
}
