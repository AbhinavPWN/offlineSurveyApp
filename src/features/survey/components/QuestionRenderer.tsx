import React, { memo, useCallback, useMemo } from "react";
import { Text, View } from "react-native";

import { TextInputField } from "./TextInputField";
import { BSDateDisplayField } from "./BSDateDisplayField";
import { RadioGroupField } from "./RadioGroupField";
import { SelectField } from "./SelectField";
import { CheckboxGroupField } from "./CheckboxGroupField";
import { isQuestionVisible } from "../hooks/surveyValidation";

// ---------- TYPES ----------

type QuestionType = "text" | "radio" | "select" | "checkbox";

type Option = {
  label: string;
  labelNp?: string;
  value: string;
};

export type VisibleIf = {
  dependsOn: string;
  operator?: "equals" | "notEquals" | "includes" | "notEmpty";
  value?: string;
};

type ValidationRule =
  | { type: "required"; message: string }
  | { type: "minSelections"; value: number; message: string }
  | { type: "pattern"; value?: RegExp; message: string }
  | {
      type: "requiredIf";
      dependsOn: string;
      value: string;
      message: string;
    };

export type QuestionConfig = {
  key: string;
  type: QuestionType;
  label: string;
  labelNp?: string;
  required?: boolean;
  inputFormat?: "bs-date";
  dayFirstDisplay?: boolean;
  options?: Option[];
  groupTitle?: string;
  groupTitleNp?: string;
  compactChoices?: boolean;

  // Single visibility condition
  visibleIf?: VisibleIf;

  // Show when at least one condition matches
  visibleIfAny?: VisibleIf[];

  // Show only when every condition matches
  visibleIfAll?: VisibleIf[];

  keyboardType?: "default" | "numeric" | "number-pad";
  readonly?: boolean;
  placeholder?: string;
  validation?: ValidationRule[];
};

type Props = {
  question: QuestionConfig;
  value: string | string[] | null;
  error: string | null;
  dispatch: (action: any) => void;
  answers: Record<string, any>;
  savingStatus?: "saving" | "saved" | "error";
};

// ---------- HELPERS ----------

function formatBSDate(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.length <= 4) return digits;

  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

// ---------- COMPONENT ----------

const QuestionRendererComponent = ({
  question,
  value,
  error,
  dispatch,
  answers,
  savingStatus,
}: Props) => {
  // ---------- VISIBILITY ----------
  const visible = useMemo(() => {
    return isQuestionVisible(question, answers);
  }, [question, answers]);

  const handleChange = useCallback(
    (newValue: string | string[] | null) => {
      let finalValue = newValue;

      // Apply BS date formatting
      if (
        question.type === "text" &&
        question.inputFormat === "bs-date" &&
        typeof newValue === "string"
      ) {
        finalValue = question.dayFirstDisplay
          ? newValue
          : formatBSDate(newValue);
      }

      dispatch({
        type: "SET_ANSWER",
        payload: {
          questionKey: question.key,
          answer: finalValue,
        },
      });
    },
    [dispatch, question],
  );

  const handleRetry = useCallback(() => {
    dispatch({
      type: "SET_ANSWER",
      payload: {
        questionKey: question.key,
        answer: value,
      },
    });
  }, [dispatch, question.key, value]);

  const displayLabel = useMemo(() => {
    return question.labelNp
      ? `${question.label}\n(${question.labelNp})`
      : question.label;
  }, [question.label, question.labelNp]);

  if (!visible) return null;

  // ---------- RENDER ----------
  let field = null;

  switch (question.type) {
    case "text":
      if (question.dayFirstDisplay) {
        field = (
          <BSDateDisplayField
            label={displayLabel}
            value={(value as string) ?? null}
            error={error}
            onChange={handleChange}
            savingStatus={savingStatus}
            onRetry={handleRetry}
            readonly={question.readonly}
          />
        );
        break;
      }
      field = (
        <TextInputField
          label={displayLabel}
          value={(value as string) ?? null}
          error={error}
          onChange={handleChange}
          placeholder={question.placeholder ?? ""}
          onRetry={handleRetry}
          savingStatus={savingStatus}
          keyboardType={
            question.keyboardType === "number-pad" ? "number-pad" : "default"
          }
          readonly={question.readonly}
        />
      );
      break;

    case "radio":
      field = (
        <RadioGroupField
          horizontal={question.compactChoices}
          label={displayLabel}
          value={(value as string) ?? null}
          error={error}
          onChange={handleChange}
          options={question.options ?? []}
          savingStatus={savingStatus}
        />
      );
      break;

    case "select":
      field = (
        <SelectField
          label={displayLabel}
          value={(value as string) ?? null}
          error={error}
          onChange={handleChange}
          options={question.options ?? []}
          savingStatus={savingStatus}
          onRetry={handleRetry}
        />
      );
      break;

    case "checkbox": {
      let safeValue: string[] = [];

      if (Array.isArray(value)) {
        safeValue = value;
      } else if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);

          if (Array.isArray(parsed)) {
            safeValue = parsed;
          }
        } catch {
          safeValue = [];
        }
      }

      field = (
        <CheckboxGroupField
          label={displayLabel}
          value={safeValue}
          error={error}
          onChange={handleChange}
          options={question.options ?? []}
          savingStatus={savingStatus}
          onRetry={handleRetry}
        />
      );
      break;
    }

    default:
      return null;
  }

  return (
    <View className="mb-4">
      {question.groupTitle && (
        <View className="mb-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
          <Text className="text-base font-bold text-blue-900">
            {question.groupTitle}
          </Text>
          {!!question.groupTitleNp && (
            <Text className="mt-1 text-sm text-blue-900">
              {question.groupTitleNp}
            </Text>
          )}
          <Text className="mt-2 text-xs text-blue-800">
            Select Yes or No for each item. / प्रत्येक विकल्पका लागि छ वा छैन
            छान्नुहोस्।
          </Text>
        </View>
      )}
      <View className="rounded-xl border border-gray-200 bg-white p-3">
        {field}
      </View>
    </View>
  );
};

// ---------- MEMO ----------

const areEqual = (prev: Props, next: Props) => {
  return (
    prev.value === next.value &&
    prev.error === next.error &&
    prev.answers === next.answers &&
    prev.question === next.question &&
    prev.savingStatus === next.savingStatus
  );
};

export const QuestionRenderer = memo(QuestionRendererComponent, areEqual);
