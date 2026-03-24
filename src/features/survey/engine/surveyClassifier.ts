export type SurveySectionKey =
  | "neonate"
  | "infant"
  | "children"
  | "feAdolescentUn"
  | "feAdolescentMa"
  | "maAdolescentMa"
  | "feReproductive"
  | "pregnantWoman"
  | "postpartumWo"
  | "adultMf";

export interface MemberSurveyProfile {
  ageYears?: number | null;
  ageMonths?: number | null;
  ageDays?: number | null;
  gender?: "M" | "F" | string | null;
  maritalStatus?: "M" | "U" | string | null;
  isPregnant?: boolean | null;
  isPostpartum?: boolean | null;
  hasNeonateInCare?: boolean | null;
  hasInfantInCare?: boolean | null;
}

const SECTION_ORDER: SurveySectionKey[] = [
  "neonate",
  "infant",
  "children",
  "feAdolescentUn",
  "feAdolescentMa",
  "maAdolescentMa",
  "feReproductive",
  "pregnantWoman",
  "postpartumWo",
  "adultMf",
];

function isFemale(gender?: string | null): boolean {
  return (gender ?? "").toUpperCase() === "F";
}

function isMale(gender?: string | null): boolean {
  return (gender ?? "").toUpperCase() === "M";
}

function isMarried(maritalStatus?: string | null): boolean {
  return (maritalStatus ?? "").toUpperCase() === "M";
}

function toSafeNumber(value?: number | null): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return value;
}

export function determineEligibleSurveySections(
  profile: MemberSurveyProfile,
): SurveySectionKey[] {
  const sectionSet = new Set<SurveySectionKey>();

  const ageYears = toSafeNumber(profile.ageYears);
  const ageMonths = toSafeNumber(profile.ageMonths);
  const ageDays = toSafeNumber(profile.ageDays);

  const female = isFemale(profile.gender);
  const male = isMale(profile.gender);
  const married = isMarried(profile.maritalStatus);

  const adolescent = ageYears !== null && ageYears >= 10 && ageYears <= 19;
  const reproductiveFemale =
    female && ageYears !== null && ageYears >= 20 && ageYears <= 49;

  if (
    (ageDays !== null && ageDays >= 0 && ageDays <= 28) ||
    profile.hasNeonateInCare
  ) {
    sectionSet.add("neonate");
  }

  if (
    (ageMonths !== null && ageMonths >= 0 && ageMonths <= 12) ||
    (ageYears !== null && ageYears < 1) ||
    profile.hasInfantInCare
  ) {
    sectionSet.add("infant");
  }

  if (ageYears !== null && ageYears >= 1 && ageYears <= 9) {
    sectionSet.add("children");
  }

  if (female && adolescent && !married) {
    sectionSet.add("feAdolescentUn");
  }

  if (female && adolescent && married) {
    sectionSet.add("feAdolescentMa");
  }

  if (male && adolescent) {
    sectionSet.add("maAdolescentMa");
  }

  if (reproductiveFemale) {
    sectionSet.add("feReproductive");
  }

  if (female && profile.isPregnant) {
    sectionSet.add("pregnantWoman");
  }

  if (female && profile.isPostpartum) {
    sectionSet.add("postpartumWo");
  }

  if (ageYears !== null && ageYears >= 35) {
    sectionSet.add("adultMf");
  }

  return SECTION_ORDER.filter((key) => sectionSet.has(key));
}
