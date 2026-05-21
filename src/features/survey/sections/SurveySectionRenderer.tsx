import React, { memo, useMemo } from "react";
import { View } from "react-native";
// import { isQuestionVisibleNow } from "../hooks/surveyValidation";

import {
  QuestionConfig,
  QuestionRenderer,
} from "../components/QuestionRenderer";

type Props = {
  questions: QuestionConfig[];

  responses: Record<string, string | string[] | null>;
  errors: Record<string, string | null>;
  savingStatus: Record<string, "saving" | "saved" | "error">;
  setQuestionPosition?: (key: string, y: number) => void;
  dispatch: (action: any) => void;
};

const SurveySectionRendererComponent = ({
  questions,
  responses,
  errors,
  dispatch,
  savingStatus,
  setQuestionPosition,
}: Props) => {
  const renderedQuestions = useMemo(() => {
    return (
      questions
        // .filter((question) => isQuestionVisibleNow(question, responses))
        .map((question) => {
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
            <View
              key={question.key}
              onLayout={(e) => {
                setQuestionPosition?.(question.key, e.nativeEvent.layout.y);
              }}
            >
              <QuestionRenderer
                // key={question.key}
                question={question}
                value={parsedValue}
                error={errors[question.key] ?? null}
                savingStatus={savingStatus[question.key]}
                // visibleValue={visibleValue}
                answers={responses}
                dispatch={dispatch}
              />
            </View>
          );
        })
    );
  }, [
    questions,
    responses,
    errors,
    savingStatus,
    dispatch,
    setQuestionPosition,
  ]);
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
