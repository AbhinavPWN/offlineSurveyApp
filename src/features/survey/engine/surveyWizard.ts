import type { SurveySectionKey } from "./surveyClassifier";

export interface SurveyWizardState {
  sections: SurveySectionKey[];
  currentIndex: number;
}

function normalizeIndex(index: number, sectionCount: number): number {
  if (sectionCount <= 0) return 0;
  if (index < 0) return 0;
  if (index >= sectionCount) return sectionCount - 1;
  return index;
}

export function createSurveyWizard(
  sections: SurveySectionKey[],
  startSection?: SurveySectionKey,
): SurveyWizardState {
  const startIndex = startSection ? sections.indexOf(startSection) : 0;

  return {
    sections,
    currentIndex: normalizeIndex(startIndex, sections.length),
  };
}

export function getCurrentSection(
  state: SurveyWizardState,
): SurveySectionKey | null {
  if (state.sections.length === 0) return null;
  return state.sections[state.currentIndex] ?? null;
}

export function getNextSection(
  state: SurveyWizardState,
): SurveySectionKey | null {
  const nextIndex = state.currentIndex + 1;
  if (nextIndex >= state.sections.length) return null;
  return state.sections[nextIndex] ?? null;
}

export function goToNextSection(state: SurveyWizardState): SurveyWizardState {
  if (state.sections.length === 0) return state;

  return {
    ...state,
    currentIndex: normalizeIndex(state.currentIndex + 1, state.sections.length),
  };
}

export function goToPreviousSection(
  state: SurveyWizardState,
): SurveyWizardState {
  if (state.sections.length === 0) return state;

  return {
    ...state,
    currentIndex: normalizeIndex(state.currentIndex - 1, state.sections.length),
  };
}

export function resumeAtSection(
  state: SurveyWizardState,
  sectionKey: SurveySectionKey,
): SurveyWizardState {
  const targetIndex = state.sections.indexOf(sectionKey);

  if (targetIndex < 0) {
    return state;
  }

  return {
    ...state,
    currentIndex: targetIndex,
  };
}
