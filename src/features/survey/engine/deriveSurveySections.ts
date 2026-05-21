import {
  determineSurveyClassification,
  MemberSurveyProfile,
  SurveySectionKey,
} from "./surveyClassifier";

/* ---------- OVERLAY DERIVATION ---------- */

function deriveOverlaySections(
  profile: MemberSurveyProfile,
  answers: Record<string, any>,
  primary: SurveySectionKey,
  isPostpartum: boolean,
): SurveySectionKey[] {
  const overlays: SurveySectionKey[] = [];

  // ---------- POSTPARTUM ----------
  if (isPostpartum && primary !== "postpartumWo") {
    overlays.push("postpartumWo");
  }

  // ---------- PREGNANCY ----------
  if (primary === "feReproductive" && answers.feReproductiveQ3 === "Y") {
    overlays.push("pregnantWoman");
  }

  // ---------- SOCIAL PROTECTION WOMEN ----------
  const age = profile.ageYears ?? 0;

  const isEligibleForSocialProtectionWomen =
    profile.gender === "F" && age >= 15;

  if (isEligibleForSocialProtectionWomen) {
    overlays.push("socialProtectionWomen");
  }

  // ---------- DISABILITY OVERLAY ----------
  const isEligibleForDisabilityOverlay =
    profile.isDisabled === true && (profile.ageYears ?? 0) >= 1;

  if (isEligibleForDisabilityOverlay) {
    overlays.push("disableInfant");
  }

  return overlays;
}

/* ---------- FINAL SECTION DERIVATION ---------- */

export function deriveSurveySections(
  profile: MemberSurveyProfile,
  answers: Record<string, any>,
): SurveySectionKey[] {
  const sections: SurveySectionKey[] = [];

  // ---------- PRIMARY ----------
  const classification = determineSurveyClassification(profile);

  const primary = classification.primary;

  if (!primary) {
    return sections;
  }

  sections.push(primary);

  // ---------- OVERLAYS ----------
  const overlays = deriveOverlaySections(
    profile,
    answers,
    primary,
    classification.isPostpartum,
  );

  sections.push(...overlays);

  return sections;
}
