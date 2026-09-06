const steps = [
  {
    n: "01",
    title: "Book et kig",
    body: "Vi går rummet igennem sammen.",
    href: "/book",
  },
  {
    n: "02",
    title: "Underlaget først",
    body: "Spartel og maling sidder kun, hvis det underliggende er i orden. En maler kan ikke rette en dårlig tømrers arbejde. Er underlaget ikke klar, siger vi det med det samme.",
  },
  {
    n: "03",
    title: "Tilbud inden 24 timer",
    body: "Opmåling på stedet. Tilbud på mail.",
  },
  {
    n: "04",
    title: "Start- og slutdato",
    body: "Når tilbuddet er godkendt, låser vi dagene. Rummet skal være tomt — eller I siger til, så vi ved, at der skal flyttes og dækkes. Ellers tager det længere tid, og I betaler for det.",
  },
  {
    n: "05",
    title: "Gennemgang",
    body: "Når vi er færdige, går vi rummet igennem sammen. Først når du er tilfreds, er opgaven lukket.",
  },
];

export default function Proces() {
  return (
    <section id="proces" className="bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32">
        <p className="text-xs uppercase tracking-[0.22em] text-gold">Proces</p>
        <h2 className="display mt-3 text-[clamp(2rem,6vw,3.75rem)]">Sådan arbejder vi</h2>
        <ol className="mt-16 flex flex-col gap-12 md:mt-20 md:gap-14">
          {steps.map((s, i) => (
            <li
              key={s.n}
              className="fade-in border-t border-gold/40 pt-8"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <span className="text-sm text-gold">{s.n}</span>
              <h3 className="display mt-3 text-2xl md:text-3xl">
                {"href" in s && s.href ? (
                  <a href={s.href} className="hover:text-gold transition-colors">
                    {s.title}
                  </a>
                ) : (
                  s.title
                )}
              </h3>
              <p className="mt-4 max-w-2xl text-cream/70 leading-relaxed">{s.body}</p>
              {"href" in s && s.href ? (
                <p className="mt-3">
                  <a href={s.href} className="text-sm text-gold hover:underline underline-offset-4">
                    Book her
                  </a>
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
