import { promises as fs } from "fs";
import path from "path";

export type ProjectImage = {
  id: string;
  title: string;
  src: string;
  createdAt: string;
  order: number;
};

const DATA = path.join(process.cwd(), "data", "projects.json");

export const FALLBACK: ProjectImage[] = [
  { id: "bad-original-01", title: "Bad — original", src: "/images/bad-original-01.jpg", createdAt: "", order: 0 },
  { id: "rum-02", title: "Rum 02", src: "/images/rum-02.jpg", createdAt: "", order: 1 },
  { id: "rum-03", title: "Rum 03", src: "/images/rum-03.jpg", createdAt: "", order: 2 },
];

export async function readProjects(): Promise<ProjectImage[]> {
  try {
    const raw = await fs.readFile(DATA, "utf8");
    const list = JSON.parse(raw) as ProjectImage[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function writeProjects(list: ProjectImage[]) {
  await fs.mkdir(path.dirname(DATA), { recursive: true });
  await fs.writeFile(DATA, JSON.stringify(list, null, 2) + "\n", "utf8");
}

/** Forside: mindst 3 billeder — pad med Pia rum hvis uploads er få/tomme. */
export async function projectsForGallery(): Promise<ProjectImage[]> {
  const list = [...(await readProjects())].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  if (list.length >= 3) return list;
  if (list.length === 0) return FALLBACK;
  const srcs = new Set(list.map((p) => p.src));
  const padded = [...list];
  for (const f of FALLBACK) {
    if (padded.length >= 3) break;
    if (!srcs.has(f.src)) padded.push({ ...f, order: padded.length });
  }
  return padded;
}
