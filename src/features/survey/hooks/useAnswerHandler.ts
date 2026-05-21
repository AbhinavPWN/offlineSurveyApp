import { enqueueAnswerWrite } from "../services/surveyWriteQueue";
import { surveySQLite } from "@/src/services/surveySQLite";
import { Dispatch, SetStateAction } from "react";
import type { SurveyAction } from "../state/surveyReducer";
import { QUESTION_MAP } from "../utils/questionMap";
import { isQuestionVisible } from "./surveyValidation";
import { calculateEDDFromLMP } from "../utils/pregnancyUtils";

type SavingStatus = Record<string, "saving" | "saved" | "error">;

type Props = {
  surveyId: string | null;
  dispatch: Dispatch<SurveyAction>;
  setSavingStatus: Dispatch<SetStateAction<SavingStatus>>;
  setErrors: Dispatch<SetStateAction<Record<string, string>>>;
  answers: Record<string, any>;
};

//  KEEP SAME TIMER MAP (global, not inside hook)
const clearStatusTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function useAnswerHandler({
  surveyId,
  dispatch,
  setSavingStatus,
  setErrors,
  answers,
}: Props) {
  return (action: SurveyAction) => {
    if (action.type === "SET_ANSWER") {
      const { questionKey, answer } = action.payload;

      if (!surveyId) return;

      // ---------- AUTO CALCULATE EDD ----------
      if (questionKey === "pregnantWomanQ1" && typeof answer === "string") {
        const edd = calculateEDDFromLMP(answer);

        if (edd) {
          dispatch({
            type: "SET_ANSWER",
            payload: {
              questionKey: "pregnantWomanQ2",
              answer: edd,
            },
          });

          enqueueAnswerWrite({
            surveyId,
            questionKey: "pregnantWomanQ2",
            answer: edd,
          });
        }
      }

      // ✅ FIXED TYPE
      setSavingStatus((prev) => {
        const next = { ...prev };
        next[questionKey] = "saving";
        return next;
      });

      let normalizedAnswer: string | null = null;

      if (Array.isArray(answer)) {
        normalizedAnswer = JSON.stringify(answer);
      } else if (typeof answer === "string") {
        normalizedAnswer = answer;
      } else {
        normalizedAnswer = null;
      }

      const simulatedAnswers = {
        ...answers,
        [questionKey]: answer,
      };

      const removedKeys: string[] = [];

      Object.keys(simulatedAnswers).forEach((key) => {
        const question = QUESTION_MAP[key];
        if (!question) return;

        const visible = isQuestionVisible(question, simulatedAnswers);

        if (!visible) {
          removedKeys.push(key);
          delete simulatedAnswers[key];
        }
      });

      enqueueAnswerWrite({
        surveyId,
        questionKey,
        answer: normalizedAnswer,

        onSuccess: () => {
          console.log("[onSuccess CALLED]", questionKey);

          // CLEAR EXISTING TIMER
          if (clearStatusTimers.has(questionKey)) {
            clearTimeout(clearStatusTimers.get(questionKey)!);
          }

          // DEBUG (unchanged)
          setTimeout(async () => {
            await surveySQLite.debugGetQueue();
          }, 100);

          // ✅ FIXED TYPE
          setSavingStatus((prev) => {
            const next = { ...prev };
            next[questionKey] = "saved";
            return next;
          });

          // AUTO CLEAR AFTER 2s
          const timer = setTimeout(() => {
            setSavingStatus((prev) => {
              const updated = { ...prev };

              if (updated[questionKey] === "saved") {
                delete updated[questionKey];
              }

              return updated;
            });

            clearStatusTimers.delete(questionKey);
          }, 2000);

          clearStatusTimers.set(questionKey, timer);
        },

        onError: () => {
          if (clearStatusTimers.has(questionKey)) {
            clearTimeout(clearStatusTimers.get(questionKey)!);
          }

          setSavingStatus((prev) => ({
            ...prev,
            [questionKey]: "error",
          }));
        },
      });

      for (const key of removedKeys) {
        enqueueAnswerWrite({
          surveyId,
          questionKey: key,
          answer: null,
        });
      }

      console.log("[Survey] Answer change:", questionKey, answer);

      // ✅ FIXED TYPE
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[questionKey];
        return updated;
      });
    }

    dispatch(action);
  };
}
