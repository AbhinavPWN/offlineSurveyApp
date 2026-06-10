import { MemberFormState } from "../models/MemberFormState";

export interface HealthValidationErrors {
  healthConditionsOthers?: string;
  disabilityIdent?: string;
  disabilityDifficulty?: string;
  pregnancyDate?: string;
  vaccinationStatus?: string;
  childDob?: string;
  hasHealthCondition?: string;
}

export function validateHealthStep(
  state: MemberFormState,
): HealthValidationErrors {
  const errors: HealthValidationErrors = {};

  // For UI only field, not part of actual form state
  if (!state.hasHealthCondition) {
    errors.hasHealthCondition =
      "Please select whether this member has any health condition.";
  }

  const hasSelectedHealthCondition =
    state.healthConditionsDia ||
    state.healthConditionsHyp ||
    state.healthConditionsCar ||
    state.healthConditionsChr ||
    state.healthConditionsOth;

  if (state.hasHealthCondition === "Y" && !hasSelectedHealthCondition) {
    errors.hasHealthCondition = "Please select at least one health condition.";
  }

  //  Health conditions Not mandatory. Only validate if "Other" is selected.

  if (
    state.hasHealthCondition === "Y" &&
    state.healthConditionsOth &&
    !state.healthConditionsOthers?.trim()
  ) {
    errors.healthConditionsOthers = "Please specify other health condition";
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
  // if (state.disabilityStatus === "Y") {
  //   const difficulties = [
  //     state.seeing,
  //     state.hearing,
  //     state.walking,
  //     state.remembering,
  //     state.selfCare,
  //     state.communicating,
  //   ];

  //   const hasAnyDifficulty = difficulties.some(
  //     (value) => value && value !== "N",
  //   );

  //   if (!hasAnyDifficulty) {
  //     errors.disabilityDifficulty = "At least one difficulty must be selected";
  //   }
  // }

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

  // Vaccination rule for children aged 5 or below.Uses clientAge, not DOB.

  const clientAge =
    state.clientAge !== null &&
    state.clientAge !== undefined &&
    state.clientAge !== ""
      ? Number(state.clientAge)
      : null;

  const isVaccinationAge =
    clientAge !== null &&
    Number.isFinite(clientAge) &&
    clientAge >= 0 &&
    clientAge <= 5;

  if (isVaccinationAge && !state.vaccinationStatus) {
    errors.vaccinationStatus =
      "Vaccination status is required for children aged 5 or below";
  }

  return errors;
}

/**
 * Lightweight age calculation
 */
/*function calculateAge(isoDate: string): number {
  const today = new Date();
  const dob = new Date(isoDate);

  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}
*/
