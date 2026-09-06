import { promises as fs } from "fs";
import path from "path";

export type SiteContent = {
  hero: {
    desktop: string;
    mobile: string;
    desktopWebp?: string;
    mobileWebp?: string;
    h1: string;
    under: string;
    note?: string;
  };
  ydelser: Array<{ id: string; title: string; body: string; image: string }>;
  om: {
    heading: string;
    michael: string;
    mikkel: string;
    body: string;
    closing?: string;
    image?: string;
  };
  kontakt: { phone: string; email: string; cvr: string };
};

const FILE = path.join(process.cwd(), "data", "site-content.json");

export async function readContent(): Promise<SiteContent> {
  const raw = await fs.readFile(FILE, "utf8");
  return JSON.parse(raw) as SiteContent;
}

export async function writeContent(content: SiteContent) {
  await fs.writeFile(FILE, JSON.stringify(content, null, 2) + "\n", "utf8");
}

export function phoneHref(phone: string) {
  return `tel:${phone.replace(/\s+/g, "")}`;
}
