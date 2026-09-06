import { promises as fs } from "fs";
import path from "path";
import type { ProjectCase } from "@/lib/project-case-types";

export type { ProjectCase, ProjectType } from "@/lib/project-case-types";
export {
  PROJECT_TYPES,
  TYPE_LABELS,
  isProjectType,
} from "@/lib/project-case-types";

const DATA = path.join(process.cwd(), "data", "project-cases.json");

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

/** Offentlig: kun published + både før og efter. */
export async function publicProjectCases(): Promise<ProjectCase[]> {
  const list = await readProjectCases();
  return list
    .filter((c) => c.published && Boolean(c.before?.trim()) && Boolean(c.after?.trim()))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
