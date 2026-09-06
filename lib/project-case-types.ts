export const PROJECT_TYPES = ["spartel", "maling", "gulv", "flyttelejlighed"] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export type ProjectCase = {
  id: string;
  title: string;
  type: ProjectType;
  /** By / område — aldrig fuldt personnavn */
  by: string;
  before: string;
  after: string;
  temporary?: boolean;
  published: boolean;
  blurb?: string;
  createdAt: string;
  order: number;
};

export const TYPE_LABELS: Record<ProjectType, string> = {
  spartel: "Spartel",
  maling: "Maling",
  gulv: "Gulv",
  flyttelejlighed: "Flyttelejlighed",
};

export function isProjectType(v: unknown): v is ProjectType {
  return typeof v === "string" && (PROJECT_TYPES as readonly string[]).includes(v);
}
