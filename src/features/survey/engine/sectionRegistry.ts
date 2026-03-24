import type { SurveySectionKey } from "./surveyClassifier";

export type SurveySectionComponentName =
  | "NeonateSection"
  | "InfantSection"
  | "ChildrenSection"
  | "FemaleAdolescentUnmarriedSection"
  | "FemaleAdolescentMarriedSection"
  | "MaleAdolescentSection"
  | "FemaleReproductiveSection"
  | "PregnantWomanSection"
  | "PostpartumWomanSection"
  | "AdultSection";

const SECTION_REGISTRY: Record<SurveySectionKey, SurveySectionComponentName> = {
  neonate: "NeonateSection",
  infant: "InfantSection",
  children: "ChildrenSection",
  feAdolescentUn: "FemaleAdolescentUnmarriedSection",
  feAdolescentMa: "FemaleAdolescentMarriedSection",
  maAdolescentMa: "MaleAdolescentSection",
  feReproductive: "FemaleReproductiveSection",
  pregnantWoman: "PregnantWomanSection",
  postpartumWo: "PostpartumWomanSection",
  adultMf: "AdultSection",
};

export function getSectionComponentName(
  sectionKey: SurveySectionKey,
): SurveySectionComponentName {
  return SECTION_REGISTRY[sectionKey];
}

export function getRegisteredSectionKeys(): SurveySectionKey[] {
  return Object.keys(SECTION_REGISTRY) as SurveySectionKey[];
}

export function getSectionRegistry(): Readonly<
  Record<SurveySectionKey, SurveySectionComponentName>
> {
  return SECTION_REGISTRY;
}

export function isSurveySectionKey(value: string): value is SurveySectionKey {
  return value in SECTION_REGISTRY;
}
