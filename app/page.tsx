import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Ydelser from "@/components/Ydelser";
import Proces from "@/components/Proces";
import Projekter from "@/components/Projekter";
import Om from "@/components/Om";
import Tilbud from "@/components/Tilbud";
import Footer from "@/components/Footer";
import { readContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { kontakt } = await readContent();

  return (
    <main className="overflow-x-hidden">
      <Header />
      <Hero />
      <div className="color-rail" aria-hidden="true">
        <span /><span /><span /><span /><span /><span /><span /><span />
      </div>
      <Ydelser />
      <Proces />
      <Projekter />
      <Om />
      <Tilbud phone={kontakt.phone} />
      <Footer />
    </main>
  );
}
