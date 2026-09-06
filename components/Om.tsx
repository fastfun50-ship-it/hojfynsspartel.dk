import { readContent } from "@/lib/content";

export default async function Om() {
  const { om } = await readContent();
  return (
    <section id="om" className="bg-cream text-ink">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-2 md:gap-20 md:px-10 md:py-32">
        <div className="fade-in">
          <p className="text-xs uppercase tracking-[0.22em] text-gold">Om</p>
          <h2 className="display mt-3 text-[clamp(2rem,6vw,3.75rem)]">{om.heading}</h2>
          <p className="mt-8 text-lg leading-relaxed text-ink/75">{om.body}</p>
          <p className="mt-5 text-lg leading-relaxed text-ink/75">{om.michael}</p>
          <p className="mt-3 text-lg leading-relaxed text-ink/75">{om.mikkel}</p>
          {om.closing ? (
            <p className="mt-5 text-lg leading-relaxed text-ink/75">{om.closing}</p>
          ) : null}
        </div>
        <div className="relative min-h-[42vh] overflow-hidden md:min-h-full">
          {om.image ? (
            <img src={om.image} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : null}
        </div>
      </div>
    </section>
  );
}
