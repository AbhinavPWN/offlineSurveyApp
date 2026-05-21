// utils/questionMap.ts
import { SECTION_QUESTIONS } from "../config/SectionQuestions";

export const QUESTION_MAP = Object.values(SECTION_QUESTIONS)
  .flat()
  .reduce(
    (acc, q) => {
      acc[q.key] = q;
      return acc;
    },
    {} as Record<string, any>,
  );
