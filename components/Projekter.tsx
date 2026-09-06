import { publicProjectCases } from "@/lib/project-cases";
import ProjekterClient from "@/components/ProjekterClient";

export default async function Projekter() {
  const cases = await publicProjectCases();
  return <ProjekterClient cases={cases} />;
}
