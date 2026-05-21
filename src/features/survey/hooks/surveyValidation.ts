import { QuestionConfig } from "../components/QuestionRenderer";
import { SurveyAnswers } from "../state/surveyReducer";

function isValidBSDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  // Basic sanity checks
  if (year < 2000 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 32) return false;

  return true;
}

// ---------- HELPER: NORMALIZE VALUE ----------
function normalizeValue(value: unknown): unknown {
  // Handle undefined / null directly
  if (value === undefined || value === null) return null;

  // Try parsing stringified arrays (e.g. "[]", '["1","2"]')
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // ignore parse error
    }
  }

  return value;
}

// ---------- HELPER: EMPTY CHECK ----------
function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;

  if (typeof value === "string") {
    return value.trim() === "";
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return false;
}

// ---------- VISIBILITY ----------

// ---------- VALIDATION ----------
export function validateSection(
  questions: QuestionConfig[],
  answers: SurveyAnswers,
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const question of questions) {
    if (!isQuestionVisible(question, answers)) continue;

    // if (!question.validation) continue;

    const rawValue = answers[question.key];
    const value = normalizeValue(rawValue);

    // ---------- SIMPLE REQUIRED ----------
    if (question.required && isEmptyValue(value)) {
      errors[question.key] = "This field is required";
      continue;
    }

    for (const rule of question.validation ?? []) {
      // REQUIRED
      if (rule.type === "required") {
        if (isEmptyValue(value)) {
          errors[question.key] = rule.message;
          break;
        }
      }

      // PATTERN
      if (rule.type === "pattern") {
        if (typeof value === "string" && value) {
          //  Special handling for BS date
          if (question.inputFormat === "bs-date") {
            if (!isValidBSDate(value)) {
              errors[question.key] = rule.message;
              break;
            }
          } else if (rule.value && !rule.value.test(value)) {
            errors[question.key] = rule.message;
            break;
          }
        }
      }

      if (rule.type === "minSelections") {
        if (Array.isArray(value) && value.length < (rule.value ?? 1)) {
          errors[question.key] = rule.message;
          break;
        }
      }

      if (rule.type === "requiredIf") {
        const dependent = normalizeValue(answers[rule.dependsOn]);

        if (dependent === rule.value && isEmptyValue(value)) {
          errors[question.key] = rule.message;
          break;
        }
      }
    }
  }

  return errors;
}

// ---------- COMPLETION ----------
export function isSectionComplete(
  questions: QuestionConfig[],
  answers: SurveyAnswers,
): boolean {
  for (const question of questions) {
    if (!isQuestionVisible(question, answers)) continue;

    // if (!question.validation) continue;

    const rawValue = answers[question.key];
    const value = normalizeValue(rawValue);

    // ---------- SIMPLE REQUIRED ----------
    if (question.required && isEmptyValue(value)) {
      return false;
    }

    for (const rule of question.validation ?? []) {
      if (rule.type === "required") {
        if (isEmptyValue(value)) {
          return false;
        }
      }
    }
  }

  return true;
}

export function isQuestionVisible(
  question: QuestionConfig,
  answers: SurveyAnswers,
): boolean {
  if (!question.visibleIf) return true;

  const { dependsOn, operator = "equals", value } = question.visibleIf;

  const actual = normalizeValue(answers[dependsOn]);

  switch (operator) {
    case "equals":
      return actual === value;

    case "notEquals":
      return actual !== value;

    case "includes":
      return Array.isArray(actual) && actual.includes(value);

    case "notEmpty":
      return Array.isArray(actual)
        ? actual.length > 0
        : actual !== null && actual !== undefined && actual !== "";

    default:
      return false;
  }
}
