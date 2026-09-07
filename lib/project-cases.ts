import { promises as fs } from "fs";
import path from "path";
import type { ProjectCase, ProjectType } from "@/lib/project-case-types";

export type { ProjectCase, ProjectType } from "@/lib/project-case-types";
export {
  PROJECT_TYPES,
  TYPE_LABELS,
  isProjectType,
} from "@/lib/project-case-types";

const DATA = path.join(process.cwd(), "data", "project-cases.json");

const FOTO_APP_PUBLIC_URL =
  (process.env.FOTO_APP_PUBLIC_URL || "https://hojfynsspartel-projekter.vercel.app").replace(
    /\/$/,
    "",
  );

type FotoPublicProject = {
  id: string;
  title: string;
  category?: string;
  year?: number | null;
  price_from?: number | null;
  priceLabel?: string | null;
  beforeUrl?: string | null;
  afterUrl?: string | null;
  published_at?: string | null;
};

function categoryToType(category: string | undefined): ProjectType {
  const c = (category || "").toLowerCase();
  if (c === "gulv") return "gulv";
  if (c === "maling") return "maling";
  if (c === "flyttelejlighed") return "flyttelejlighed";
  // facade / loft / vaeg / badevaerelse / andet → spartel
  return "spartel";
}

function fotoToCase(p: FotoPublicProject, order: number): ProjectCase | null {
  const before = (p.beforeUrl || "").trim();
  const after = (p.afterUrl || "").trim();
  if (!before || !after) return null;
  const year = p.year != null ? String(p.year) : "";
  const by = [year, p.priceLabel].filter(Boolean).join(" · ") || "Fyn";
  return {
    id: `foto-${p.id}`,
    title: p.title || "Projekt",
    type: categoryToType(p.category),
    by,
    before,
    after,
    temporary: false,
    published: true,
    blurb: p.priceLabel || undefined,
    createdAt: p.published_at || new Date().toISOString(),
    order,
  };
}

export async function readProjectCases(): Promise<ProjectCase[]> {
  try {
    const raw = await fs.readFile(DATA, "utf8");
    const list = JSON.parse(raw) as ProjectCase[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function writeProjectCases(list: ProjectCase[]) {
  await fs.mkdir(path.dirname(DATA), { recursive: true });
  await fs.writeFile(DATA, JSON.stringify(list, null, 2) + "\n", "utf8");
}

async function fetchFotoPublicCases(): Promise<ProjectCase[]> {
  const url = `${FOTO_APP_PUBLIC_URL}/api/public/projekter`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.warn("[project-cases] foto API", res.status, url);
      return [];
    }
    const data = (await res.json()) as unknown;
    const list = Array.isArray(data) ? (data as FotoPublicProject[]) : [];
    return list
      .map((p, i) => fotoToCase(p, i))
      .filter((c): c is ProjectCase => c != null);
  } catch (err) {
    console.warn("[project-cases] foto API fetch failed", err);
    return [];
  }
}

/** Offentlig: CMS published + foto-app publiceret (API first). */
export async function publicProjectCases(): Promise<ProjectCase[]> {
  const [cms, foto] = await Promise.all([readProjectCases(), fetchFotoPublicCases()]);
  const cmsPublished = cms
    .filter((c) => c.published && Boolean(c.before?.trim()) && Boolean(c.after?.trim()))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const seen = new Set(foto.map((c) => c.id));
  return [...foto, ...cmsPublished.filter((c) => !seen.has(c.id))];
}