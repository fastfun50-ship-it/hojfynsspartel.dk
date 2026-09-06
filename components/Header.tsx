import { readContent, phoneHref } from "@/lib/content";
import HeaderBar from "./HeaderBar";

export default async function Header() {
  const { kontakt } = await readContent();
  return <HeaderBar phone={kontakt.phone} phoneHref={phoneHref(kontakt.phone)} />;
}
