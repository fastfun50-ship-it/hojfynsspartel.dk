import { readContent } from "@/lib/content";

const tints = ["bg-terracotta", "bg-sage", "bg-teal", "bg-gold"];

export default async function Ydelser() {
  const { ydelser } = await readContent();
  return (
    <section id="ydelser" className="bg-cream">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32">
        <p className="text-xs uppercase tracking-[0.22em] text-gold">Ydelser</p>
        <h2 className="display mt-3 text-[clamp(2rem,6vw,3.75rem)] text-ink">Fire spor. Ét niveau.</h2>
      </div>
      <div className="flex flex-col">
        {ydelser.map((s, i) => {
          const src = s.image.replace(/\.(webp|jpg|jpeg|png)$/i, "");
          const isJpg = /\.(jpe?g)$/i.test(s.image);
          return (
            <div
              key={s.id}
              className={`grid md:grid-cols-2 md:items-center ${i % 2 === 1 ? "ydelse-row-flip" : ""}`}
            >
              <div className="ydelse-photo relative flex max-h-[70vh] min-h-[40vh] items-center justify-center overflow-hidden bg-ink md:h-[70vh] md:max-h-[70vh] md:min-h-0">
                <picture className="flex h-full max-h-[70vh] w-full items-center justify-center">
                  {isJpg ? <source srcSet={`${src}.webp`} type="image/webp" /> : null}
                  <img
                    src={s.image}
                    alt={s.title}
                    className="max-h-[70vh] w-full object-contain object-center md:h-full"
                    loading="lazy"
                  />
                </picture>
              </div>
              <div
                className={`fade-in flex flex-col justify-center px-8 py-16 md:px-16 md:py-20 ${
                  i % 2 === 0 ? "bg-ink text-cream" : "bg-cream text-ink"
                }`}
              >
                <span className={`mb-6 inline-block h-1.5 w-16 ${tints[i] || "bg-gold"}`} aria-hidden />
                <h3 className="display text-4xl md:text-5xl">{s.title}</h3>
                <p
                  className={`mt-5 max-w-md text-lg leading-relaxed ${
                    i % 2 === 0 ? "text-cream/75" : "text-ink/70"
                  }`}
                >
                  {s.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
