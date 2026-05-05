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
  childAgeDays: number | null;
  gender?: "M" | "F" | string | null;
  maritalStatus?: "M" | "U" | string | null;
  isPregnant?: boolean | null;
  isPostpartum?: boolean | null;
  hasNeonateInCare?: boolean | null;
  hasInfantInCare?: boolean | null;
  hasChildInCare?: boolean | null;
}

/* ---------------- CONFIG ---------------- */
const NEONATE_MAX_DAYS = 28;
const POSTPARTUM_MAX_DAYS = 42;
const INFANT_MAX_DAYS = 180;
const CHILD_MAX_DAYS = 1800;

/* ---------------- HELPERS ---------------- */

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
  return typeof value === "number" && !Number.isNaN(value) ? value : null;
}

function getAgeInYears(profile: MemberSurveyProfile): number | null {
  const years = toSafeNumber(profile.ageYears);
  if (years !== null) return years;

  const months = toSafeNumber(profile.ageMonths);
  if (months !== null) return months / 12;

  const days = toSafeNumber(profile.ageDays);
  if (days !== null) return days / 365;

  return null;
}

/* MAIN LOGIC */
export function determineSurveyClassification(profile: MemberSurveyProfile): {
  primary: SurveySectionKey | null;
  isPostpartum: boolean;
} {
  const DEBUG = true;

  const logs: any = {
    input: {},
    checks: [],
    result: null,
  };

  const age = getAgeInYears(profile);
  const female = isFemale(profile.gender);
  const male = isMale(profile.gender);
  const married = isMarried(profile.maritalStatus);

  const childAgeDays = profile.childAgeDays ?? null;

  // Derived from Ui flags (Later will be replacing with direct input)
  const isMother =
    profile.hasNeonateInCare === true ||
    profile.hasInfantInCare === true ||
    profile.hasChildInCare === true;

  //  Postpartum = overlay (not primary)
  const isPostpartum =
    female &&
    isMother &&
    childAgeDays !== null &&
    childAgeDays >= 0 &&
    childAgeDays <= POSTPARTUM_MAX_DAYS;

  logs.input = {
    gender: profile.gender,
    maritalStatus: profile.maritalStatus,
    age,
    childAgeDays,
    isMother,
    isPregnant: profile.isPregnant,
    isPostpartum,
  };

  // ---------------- CHILD PRIORITY ----------------
  // Primary Section logic only
  if (female && isMother && childAgeDays !== null) {
    // Neonate
    const isNeonate = childAgeDays >= 0 && childAgeDays <= NEONATE_MAX_DAYS;

    logs.checks.push({ rule: "neonate", result: isNeonate });

    if (isNeonate) {
      logs.result = "neonate";
      if (DEBUG) console.log("[CLASSIFIER_TRACE]", logs);
      return { primary: "neonate", isPostpartum };
    }

    // Infant
    const isInfant =
      childAgeDays > NEONATE_MAX_DAYS && childAgeDays <= INFANT_MAX_DAYS;

    logs.checks.push({ rule: "infant", result: isInfant });

    if (isInfant) {
      logs.result = "infant";
      if (DEBUG) console.log("[CLASSIFIER_TRACE]", logs);
      return { primary: "infant", isPostpartum };
    }

    // Children
    const isChildren =
      childAgeDays > INFANT_MAX_DAYS && childAgeDays <= CHILD_MAX_DAYS;

    logs.checks.push({ rule: "children", result: isChildren });

    if (isChildren) {
      logs.result = "children";
      if (DEBUG) console.log("[CLASSIFIER_TRACE]", logs);
      return { primary: "children", isPostpartum };
    }
  }

  // ---------------- ADOLESCENT ----------------

  const isAdolescent = age !== null && age >= 10 && age <= 19;
  logs.checks.push({ rule: "isAdolescent", result: isAdolescent });

  if (isAdolescent) {
    const isFeUn = female && !married;
    logs.checks.push({ rule: "feAdolescentUn", result: isFeUn });

    if (isFeUn) {
      logs.result = "feAdolescentUn";
      if (DEBUG) console.log("[CLASSIFIER_TRACE]", logs);
      return { primary: "feAdolescentUn", isPostpartum };
    }

    const isFeMa = female && married;
    logs.checks.push({ rule: "feAdolescentMa", result: isFeMa });

    if (isFeMa) {
      logs.result = "feAdolescentMa";
      if (DEBUG) console.log("[CLASSIFIER_TRACE]", logs);
      return { primary: "feAdolescentMa", isPostpartum };
    }

    const isMaMa = male && married;
    logs.checks.push({ rule: "maAdolescentMa", result: isMaMa });

    if (isMaMa) {
      logs.result = "maAdolescentMa";
      if (DEBUG) console.log("[CLASSIFIER_TRACE]", logs);
      return { primary: "maAdolescentMa", isPostpartum };
    }
  }

  // ---------------- REPRODUCTIVE ----------------

  const isReproductiveRange =
    female && married && age !== null && age >= 20 && age <= 49;

  logs.checks.push({
    rule: "reproductiveRange",
    result: isReproductiveRange,
  });

  if (isReproductiveRange) {
    const isPregnant = profile.isPregnant === true;

    logs.checks.push({ rule: "pregnantWoman", result: isPregnant });

    if (isPregnant) {
      logs.result = "pregnantWoman";
      if (DEBUG) console.log("[CLASSIFIER_TRACE]", logs);
      return { primary: "pregnantWoman", isPostpartum };
    }

    logs.result = "feReproductive";
    if (DEBUG) console.log("[CLASSIFIER_TRACE]", logs);
    return { primary: "feReproductive", isPostpartum };
  }

  // ---------------- ADULT ----------------

  const isAdult = age !== null && age >= 35;
  logs.checks.push({ rule: "adultMf", result: isAdult });

  if (isAdult) {
    logs.result = "adultMf";
    if (DEBUG) console.log("[CLASSIFIER_TRACE]", logs);
    return { primary: "adultMf", isPostpartum };
  }

  // Fallback - No matching section

  logs.result = null;
  if (DEBUG) console.log("[CLASSIFIER_TRACE]", logs);

  return { primary: null, isPostpartum };
}
