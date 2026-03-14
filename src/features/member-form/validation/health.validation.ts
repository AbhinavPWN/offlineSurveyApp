import { MemberFormState } from "../models/MemberFormState";

export interface HealthValidationErrors {
  healthConditions?: string;
  disabilityIdent?: string;
  disabilityDifficulty?: string;
  pregnancyDate?: string;
  vaccinationStatus?: string;
  childDob?: string;
}

export function validateHealthStep(
  state: MemberFormState,
): HealthValidationErrors {
  const errors: HealthValidationErrors = {};

  /**
   * Health conditions
   * Not mandatory.
   * Only validate if "Other" is selected.
   */
  if (state.healthConditionsOth && !state.healthConditionsOthers?.trim()) {
    errors.healthConditions = "Please specify other health condition";
  }

  /**
   * Disability identification
   */
  if (state.disabilityIdentYn && !state.disabilityIdent) {
    errors.disabilityIdent = "Please select disability type";
  }

  /**
   * Disability functional difficulty
   */
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

  /**
   * Pregnancy rules
   */
  if (state.gender === "F") {
    if (state.pregnancyStatus === "Y" && !state.pregnancyDate) {
      errors.pregnancyDate = "Pregnancy date is required";
    }

    if (state.motherofChild && !state.childDob) {
      errors.childDob = "Child date of birth is required";
    }
  }

  /**
   * Vaccination rule for children (<18)
   */
  if (state.dob) {
    const age = calculateAge(state.dob);

    if (age < 18 && !state.vaccinationStatus) {
      errors.vaccinationStatus = "Vaccination status required for children";
    }
  }

  return errors;
}

/**
 * Lightweight age calculation
 */
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
