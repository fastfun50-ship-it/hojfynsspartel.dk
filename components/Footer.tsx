import { readContent, phoneHref } from "@/lib/content";
import { site } from "@/config/site";

export default async function Footer() {
  const { kontakt } = await readContent();
  return (
    <footer className="border-t-2 border-gold bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-10">
        <p className="display text-xl">{site.brand}</p>
        <p className="mt-2 text-cream/75">{site.line}</p>
        <p className="mt-2 text-cream/75">
          <a href={phoneHref(kontakt.phone)} className="hover:text-gold">
            {kontakt.phone}
          </a>
          {" · "}
          {kontakt.email}
        </p>
        <p className="mt-2 text-cream/75">CVR {kontakt.cvr}</p>
      </div>
    </footer>
  );
}
