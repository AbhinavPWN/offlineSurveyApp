import { MemberFormState } from "../models/MemberFormState";

export interface HealthValidationErrors {
  healthConditions?: string;
  disabilityIdent?: string;
  disabilityDifficulty?: string;
  pregnancyDate?: string;
  vaccinationStatus?: string;
}

export function validateHealthStep(
  state: MemberFormState,
): HealthValidationErrors {
  const errors: HealthValidationErrors = {};

  // Health condition required
  if (state.healthConditionsYn && !state.healthConditions) {
    errors.healthConditions = "Please select health condition";
  }

  // Disability identification required
  if (state.disabilityIdentYn && !state.disabilityIdent) {
    errors.disabilityIdent = "Please select disability type";
  }

  // Disability difficulty validation
  if (state.disabilityStatus === "Y") {
    const difficulties = [
      state.seeing,
      state.hearing,
      state.walking,
      state.remembering,
      state.selfCare,
      state.communicating,
    ];

    const hasAnyDifficulty = difficulties.some(
      (value) => value && value !== "N",
    );

    if (!hasAnyDifficulty) {
      errors.disabilityDifficulty = "At least one difficulty must be selected";
    }
  }

  // Pregnancy rules
  if (state.gender !== "F") {
    // no validation needed here, just ignore
  } else {
    if (state.pregnancyStatus === "Y" && !state.pregnancyDate) {
      errors.pregnancyDate = "Pregnancy date is required";
    }
  }

  // Vaccination rule (<18)
  if (state.dob) {
    const age = calculateAge(state.dob);

    if (age < 18 && !state.vaccinationStatus) {
      errors.vaccinationStatus = "Vaccination status required for children";
    }
  }

  return errors;
}

// Utility (lightweight, no heavy libs)
function calculateAge(isoDate: string): number {
  const today = new Date();
  const dob = new Date(isoDate);

  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}
