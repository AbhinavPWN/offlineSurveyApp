import React, { memo, useMemo } from "react";
import { View } from "react-native";
import { isQuestionVisibleNow } from "../hooks/surveyValidation";

import {
  QuestionConfig,
  QuestionRenderer,
} from "../components/QuestionRenderer";

type Props = {
  questions: QuestionConfig[];

  responses: Record<string, string | string[] | null>;
  errors: Record<string, string | null>;
  savingStatus: Record<string, "saving" | "saved" | "error">;
  dispatch: (action: any) => void;
};

const SurveySectionRendererComponent = ({
  questions,
  responses,
  errors,
  dispatch,
  savingStatus,
}: Props) => {
  const renderedQuestions = useMemo(() => {
    return questions
      .filter((question) => isQuestionVisibleNow(question, responses))
      .map((question) => {
        let visibleValue: string | null | undefined = undefined;

        if (question.visibleIf) {
          const rawValue = responses[question.visibleIf.dependsOn];

          if (typeof rawValue === "string") {
            visibleValue = rawValue;
          } else {
            visibleValue = null;
          }
        }

        const rawValue = responses[question.key];

        let parsedValue: string | string[] | null = rawValue ?? null;

        if (question.type === "checkbox") {
          if (Array.isArray(rawValue)) {
            parsedValue = rawValue;
          } else if (typeof rawValue === "string") {
            try {
              const parsed = JSON.parse(rawValue);

              if (Array.isArray(parsed)) {
                parsedValue = parsed;
              } else {
                parsedValue = [];
              }
            } catch {
              parsedValue = [];
            }
          } else {
            parsedValue = [];
          }
        }

        return (
          <QuestionRenderer
            key={question.key}
            question={question}
            value={parsedValue}
            error={errors[question.key] ?? null}
            savingStatus={savingStatus[question.key]}
            visibleValue={visibleValue}
            dispatch={dispatch}
          />
        );
      });
  }, [questions, responses, errors, savingStatus, dispatch]);
  console.log("[RENDER WITH ERRORS]", errors);
  return <View>{renderedQuestions}</View>;
};

export const SurveySectionRenderer = memo(
  SurveySectionRendererComponent,
  (prev, next) => {
    //  force re-render when errors change
    if (prev.errors !== next.errors) return false;

    if (prev.responses !== next.responses) return false;
    if (prev.savingStatus !== next.savingStatus) return false;
    if (prev.questions !== next.questions) return false;

    return true;
  },
);
