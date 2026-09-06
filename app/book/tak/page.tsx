import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { phoneHref } from "@/lib/content";

export const metadata = {
  title: "Tak · Book et kig · Højfynsspartel",
};

const PHONE = "21 63 17 93";

export default function BookThanksPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <Header />
      <div className="mx-auto flex max-w-2xl flex-col items-start px-5 pb-24 pt-28 md:px-10 md:pt-36">
        <p className="text-xs uppercase tracking-[0.22em] text-gold">Booking</p>
        <h1 className="display mt-3 text-[clamp(2.25rem,7vw,3.5rem)]">Tak for din booking</h1>
        <p className="mt-5 text-lg text-ink/75 leading-relaxed">
          Vi har modtaget din forespørgsel og vender tilbage snarest — typisk samme dag.
        </p>
        <p className="mt-4 text-ink/70">
          Har du brug for at snakke med det samme? Ring{" "}
          <a href={phoneHref(PHONE)} className="font-medium text-ink underline-offset-4 hover:text-gold hover:underline">
            {PHONE}
          </a>
          .
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href="/"
            className="inline-flex min-h-12 items-center rounded-full bg-gold px-6 font-medium text-ink hover:bg-ink hover:text-cream transition-colors"
          >
            Til forsiden
          </a>
          <a
            href={phoneHref(PHONE)}
            className="inline-flex min-h-12 items-center rounded-full border border-ink/25 px-6 text-ink hover:border-gold transition-colors"
          >
            Ring {PHONE}
          </a>
        </div>
      </div>
      <Footer />
    </main>
  );
}
