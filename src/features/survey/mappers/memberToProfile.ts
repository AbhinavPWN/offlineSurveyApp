//bridge between  Member domain and Survey domain

import { MemberSurveyProfile } from "../engine/surveyClassifier";

// Safe Date parsing
function parseDate(date?: string | null): Date | null {
  if (!date) return null;

  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? null : parsed;
}

// Age calculations
function calculateAge(dob: Date | null) {
  if (!dob) {
    return {
      ageYears: 0,
      ageMonths: 0,
      ageDays: 0,
    };
  }

  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  let days = now.getDate() - dob.getDate();

  if (days < 0) {
    months -= 1;
    days += 30;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return {
    ageYears: Math.max(years, 0),
    ageMonths: Math.max(months, 0),
    ageDays: Math.max(days, 0),
  };
}

export function mapMemberToSurveyProfile(member: any): MemberSurveyProfile {
  const dob = parseDate(member?.dob);
  const childDob = parseDate(member?.childDob);
  const { ageYears, ageMonths, ageDays } = calculateAge(dob);
  const gender = member?.gender ?? "U";
  const maritalStatus = member?.maritalStatus ?? "U";
  const isPregnant = member?.pregnancyStatus === "Y";
  const hasInfantInCare = !!childDob;
  const isPostpartum = false;
  const hasNeonateInCare = false;

  return {
    ageYears,
    ageMonths,
    ageDays,
    gender,
    maritalStatus,
    isPregnant,
    isPostpartum,
    hasNeonateInCare,
    hasInfantInCare,
  };
}
