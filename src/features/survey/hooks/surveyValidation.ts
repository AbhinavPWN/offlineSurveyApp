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
  if (value === undefined || value === null) {
    return null;
  }

  // Parse stringified checkbox arrays such as '["1","2"]'
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Keep the original string when it is not JSON
    }
  }

  return value;
}

// ---------- HELPER: EMPTY CHECK ----------

function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim() === "";
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return false;
}

// ---------- VALIDATION ----------

export function validateSection(
  questions: QuestionConfig[],
  answers: SurveyAnswers,
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const question of questions) {
    // Do not validate questions skipped by business logic
    if (!isQuestionVisible(question, answers)) {
      continue;
    }

    const rawValue = answers[question.key];
    const value = normalizeValue(rawValue);

    // ---------- SIMPLE REQUIRED ----------
    if (question.required && isEmptyValue(value)) {
      errors[question.key] = "This field is required";
      continue;
    }

    for (const rule of question.validation ?? []) {
      // ---------- REQUIRED ----------
      if (rule.type === "required") {
        if (isEmptyValue(value)) {
          errors[question.key] = rule.message;
          break;
        }
      }

      // ---------- PATTERN ----------
      if (rule.type === "pattern") {
        if (typeof value === "string" && value) {
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

      // ---------- MINIMUM SELECTIONS ----------
      if (rule.type === "minSelections") {
        if (Array.isArray(value) && value.length < (rule.value ?? 1)) {
          errors[question.key] = rule.message;
          break;
        }
      }

      // ---------- CONDITIONALLY REQUIRED ----------
      if (rule.type === "requiredIf") {
        const dependentValue = normalizeValue(answers[rule.dependsOn]);

        if (dependentValue === rule.value && isEmptyValue(value)) {
          errors[question.key] = rule.message;
          break;
        }
      }
    }
  }

  return errors;
}

// ---------- SECTION COMPLETION ----------

export function isSectionComplete(
  questions: QuestionConfig[],
  answers: SurveyAnswers,
): boolean {
  for (const question of questions) {
    // Hidden questions do not affect completion
    if (!isQuestionVisible(question, answers)) {
      continue;
    }

    const rawValue = answers[question.key];
    const value = normalizeValue(rawValue);

    if (question.required && isEmptyValue(value)) {
      return false;
    }

    for (const rule of question.validation ?? []) {
      if (rule.type === "required" && isEmptyValue(value)) {
        return false;
      }
    }
  }

  return true;
}

// ---------- QUESTION VISIBILITY ----------

export function isQuestionVisible(
  question: QuestionConfig,
  answers: SurveyAnswers,
): boolean {
  const matchesCondition = (
    condition: NonNullable<QuestionConfig["visibleIf"]>,
  ): boolean => {
    const { dependsOn, operator = "equals", value } = condition;
    const actualValue = normalizeValue(answers[dependsOn]);

    switch (operator) {
      case "equals":
        return actualValue === value;

      case "notEquals":
        return actualValue !== value;

      case "includes":
        return (
          Array.isArray(actualValue) &&
          value !== undefined &&
          actualValue.includes(value)
        );

      case "notEmpty":
        return Array.isArray(actualValue)
          ? actualValue.length > 0
          : actualValue !== null &&
              actualValue !== undefined &&
              actualValue !== "";

      default:
        return false;
    }
  };

  // A normal single visibility condition
  if (question.visibleIf && !matchesCondition(question.visibleIf)) {
    return false;
  }

  // Every condition must match
  if (question.visibleIfAll && !question.visibleIfAll.every(matchesCondition)) {
    return false;
  }

  // At least one condition must match
  if (question.visibleIfAny && !question.visibleIfAny.some(matchesCondition)) {
    return false;
  }

  return true;
}
