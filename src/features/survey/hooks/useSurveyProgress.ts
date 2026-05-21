import { QuestionConfig } from "../components/QuestionRenderer";
import { SurveyAnswers } from "../state/surveyReducer";
import { SurveySectionKey } from "../engine/surveyClassifier";
import { isQuestionVisible } from "./surveyValidation";

// ---------- TYPES ----------
type ProgressResult = {
  totalQuestions: number;
  answeredQuestions: number;
  progress: number;
};

function normalizeValue(value: unknown): unknown {
  if (value === undefined || value === null) return null;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }

  return value;
}

// ---------- MAIN FUNCTION ----------
export function calculateSurveyProgress(
  sections: SurveySectionKey[],
  answers: SurveyAnswers,
  sectionQuestions: Record<SurveySectionKey, QuestionConfig[]>,
): ProgressResult {
  // flatten all questions
  const allQuestions = sections.flatMap((section) => sectionQuestions[section]);

  // filter visible questions
  const visibleQuestions = allQuestions.filter((q) =>
    isQuestionVisible(q, answers),
  );

  const totalQuestions = visibleQuestions.length;

  const answeredQuestions = visibleQuestions.filter((q) => {
    const rawValue = answers[q.key];
    const value = normalizeValue(rawValue);

    if (value === null || value === undefined) return false;

    if (typeof value === "string") return value.trim() !== "";

    if (Array.isArray(value)) return value.length > 0;

    return true;
  }).length;

  const progress =
    totalQuestions === 0 ? 0 : answeredQuestions / totalQuestions;

  return {
    totalQuestions,
    answeredQuestions,
    progress: Math.min(Math.max(progress, 0), 1), // safeProgress
  };
}
