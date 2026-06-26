import { DifficultyLevel } from "../features/member-form/master/health.enum";

export interface FunctionalDifficultyValues {
  seeing?: string | null;
  hearing?: string | null;
  walking?: string | null;
  remembering?: string | null;
  selfCare?: string | null;
  communicating?: string | null;
}

function normalizeDifficulty(value?: string | null): string {
  return value?.trim().toUpperCase() ?? "";
}

/**
 * Disability is identified only when at least one of the six functional
 * difficulty fields is A (a lot of difficulty) or C (cannot do at all).
 */
export function hasDisabilityIdentified(
  values: FunctionalDifficultyValues,
): boolean {
  return [
    values.seeing,
    values.hearing,
    values.walking,
    values.remembering,
    values.selfCare,
    values.communicating,
  ].some((value) => {
    const normalizedValue = normalizeDifficulty(value);

    return (
      normalizedValue === DifficultyLevel.A_LOT_OF_DIFFICULTY ||
      normalizedValue === DifficultyLevel.CANNOT_DO
    );
  });
}
