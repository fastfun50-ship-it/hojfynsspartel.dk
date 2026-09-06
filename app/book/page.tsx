import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookForm from "@/components/BookForm";
import { listBookableDates, readBookingConfig } from "@/lib/booking";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Book et kig · Højfynsspartel",
  description: "Book et kig — tirsdag til fredag, formiddag eller eftermiddag.",
};

export default async function BookPage() {
  const config = await readBookingConfig();
  const bookableDates = listBookableDates(config, 60);

  return (
    <main className="min-h-screen bg-cream text-ink">
      <Header />
      <div className="mx-auto max-w-3xl px-5 pb-20 pt-28 md:px-10 md:pb-28 md:pt-32">
        <p className="text-xs uppercase tracking-[0.22em] text-gold">Booking</p>
        <h1 className="display mt-3 text-[clamp(2.25rem,7vw,3.5rem)] text-ink">Book et kig</h1>
        <p className="mt-4 max-w-xl text-ink/70 leading-relaxed">
          Vi kommer forbi og går rummet igennem sammen. Vælg dato (tir–fre) og tidsrum — vi bekræfter
          snarest.
        </p>
        <div className="mt-10 rounded-2xl border border-ink/10 bg-cream p-5 shadow-sm md:p-8">
          <BookForm config={config} bookableDates={bookableDates} />
        </div>
      </div>
      <Footer />
    </main>
  );
}
