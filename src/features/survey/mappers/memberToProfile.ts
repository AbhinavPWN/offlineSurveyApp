import { MemberSurveyProfile } from "../engine/surveyClassifier";

type MemberDTO = {
  client_age?: number | string | null;
  dob?: string | null;
  gender?: string | null;
  maritaL_STATUS?: string | null;
  pregnancY_STATUS?: string | null;
  motherofChild?: string | null;
  childDob?: string | null;
};

// Normalize helper functions
function normalizeGender(g?: string | null): "M" | "F" | "U" {
  const value = (g ?? "").toUpperCase();
  if (value === "F" || value === "FEMALE") return "F";
  if (value === "M" || value === "MALE") return "M";
  return "U";
}

function normalizeMaritalStatus(m?: string | null): "M" | "U" {
  const value = (m ?? "").toUpperCase();
  if (value === "M" || value === "MARRIED") return "M";
  return "U";
}

function parseDate(date?: string | null): Date | null {
  if (!date) return null;
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function calculateAgeYears(dob: Date | null): number {
  if (!dob) return 0;

  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();

  if (
    now.getMonth() < dob.getMonth() ||
    (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())
  ) {
    years--;
  }

  return Math.max(years, 0);
}

function calculateChildAgeDays(childDob: Date | null): number | null {
  if (!childDob) return null;

  const now = new Date();
  const diff = now.getTime() - childDob.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function mapMemberToSurveyProfile(
  member: MemberDTO,
): MemberSurveyProfile {
  const dob = parseDate(member?.dob);
  const childDob = parseDate(member?.childDob);

  let parsedAge: number | null = null;

  if (typeof member?.client_age === "number") {
    parsedAge = member.client_age;
  } else if (typeof member?.client_age === "string") {
    const n = Number(member.client_age);
    parsedAge = !isNaN(n) ? n : null;
  }

  const ageYears =
    parsedAge !== null && parsedAge > 0 ? parsedAge : calculateAgeYears(dob);

  const gender = normalizeGender(member?.gender);
  const maritalStatus = normalizeMaritalStatus(member?.maritaL_STATUS);

  const isPregnant = member?.pregnancY_STATUS === "Y";
  const isMother = member?.motherofChild === "Y";

  const now = Date.now();
  const childAgeDays = calculateChildAgeDays(childDob);

  const ageDays =
    dob !== null
      ? Math.floor((now - dob.getTime()) / (1000 * 60 * 60 * 24))
      : null;

  let hasNeonateInCare = false;
  let hasInfantInCare = false;
  let hasChildInCare = false;

  if (isMother && childAgeDays !== null) {
    if (childAgeDays >= 0 && childAgeDays <= 28) {
      hasNeonateInCare = true;
    } else if (childAgeDays >= 29 && childAgeDays <= 180) {
      hasInfantInCare = true;
    } else if (childAgeDays >= 181 && childAgeDays <= 1800) {
      hasChildInCare = true;
    }
  }

  // Postpartum (temporary rule)
  const isPostpartum = isMother && childAgeDays !== null && childAgeDays <= 42;

  return {
    ageYears,
    ageDays,
    childAgeDays,
    gender,
    maritalStatus,
    isPregnant,
    isPostpartum,
    hasNeonateInCare,
    hasInfantInCare,
    hasChildInCare,
  };
}
