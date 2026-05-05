// DETECTOR (CLEAN VERSION)
import { SurveySectionKey } from "../engine/surveyClassifier";

export function detectSectionsFromAnswers(
  answers: Record<string, string | null>,
): SurveySectionKey[] {
  const sections = new Set<SurveySectionKey>();

  for (const key of Object.keys(answers)) {
    if (key.startsWith("neonate")) sections.add("neonate");
    if (key.startsWith("postpartumWo")) sections.add("postpartumWo");
    if (key.startsWith("infant")) sections.add("infant");
    if (key.startsWith("children")) sections.add("children");
    if (key.startsWith("feAdolescentUn")) sections.add("feAdolescentUn");
    if (key.startsWith("feAdolescentMa")) sections.add("feAdolescentMa");
    if (key.startsWith("maAdolescentMa")) sections.add("maAdolescentMa");
    if (key.startsWith("feReproductive")) sections.add("feReproductive");
    if (key.startsWith("pregnantWoman")) sections.add("pregnantWoman");
    if (key.startsWith("adultMf")) sections.add("adultMf");
  }

  return Array.from(sections);
}
