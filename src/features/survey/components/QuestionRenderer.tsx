import React, { memo, useCallback, useMemo } from "react";
import { View } from "react-native";

import { TextInputField } from "./TextInputField";
import { RadioGroupField } from "./RadioGroupField";
import { SelectField } from "./SelectField";
import { CheckboxGroupField } from "./CheckboxGroupField";

// ---------- TYPES ----------

type QuestionType = "text" | "radio" | "select" | "checkbox";

type Option = {
  label: string;
  labelNp?: string;
  value: string;
};

type VisibleIf = {
  dependsOn: string;
  value: string;
};

type ValidationRule = {
  type: "required" | "minLength" | "maxLength" | "pattern";
  value?: RegExp;
  message: string;
};

export type QuestionConfig = {
  key: string;
  type: QuestionType;
  label: string;
  labelNp?: string;
  required?: boolean;
  inputFormat?: "bs-date";
  options?: Option[];
  visibleIf?: VisibleIf;
  keyboardType?: "default" | "numeric" | "number-pad";
  placeholder?: string;
  validation?: ValidationRule[];
};

type Props = {
  question: QuestionConfig;
  value: string | string[] | null;
  error: string | null;

  dispatch: (action: any) => void;

  visibleValue?: string | null;
  savingStatus?: "saving" | "saved" | "error";
};

// ---------- HELPERS ----------

function isQuestionVisible(
  question: QuestionConfig,
  visibleValue?: string | null,
): boolean {
  if (!question.visibleIf) return true;
  console.log("Render:", question.key);
  return visibleValue === question.visibleIf.value;
}

// Helper for Date format BS :

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
  visibleValue,
  savingStatus,
}: Props) => {
  // ---------- VISIBILITY ----------
  const visible = useMemo(() => {
    return isQuestionVisible(question, visibleValue);
  }, [question, visibleValue]);

  const handleChange = useCallback(
    (newValue: string | string[] | null) => {
      let finalValue = newValue;

      //  Apply BS date formatting
      if (
        question.type === "text" &&
        question.inputFormat === "bs-date" &&
        typeof newValue === "string"
      ) {
        finalValue = formatBSDate(newValue);
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
      field = (
        <TextInputField
          label={displayLabel}
          value={(value as string) ?? null}
          error={error}
          onChange={handleChange}
          placeholder={question.placeholder ?? ""}
          savingStatus={savingStatus}
          keyboardType={
            question.keyboardType === "number-pad" ? "number-pad" : "default"
          }
        />
      );
      break;

    case "radio":
      field = (
        <RadioGroupField
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
        />
      );
      break;

    case "checkbox":
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
        />
      );
      break;

    default:
      return null;
  }

  return <View>{field}</View>;
};

// ---------- MEMO (CRITICAL) ----------

const areEqual = (prev: Props, next: Props) => {
  return (
    prev.value === next.value &&
    prev.error === next.error &&
    prev.visibleValue === next.visibleValue &&
    prev.question === next.question &&
    prev.savingStatus === next.savingStatus
  );
};

export const QuestionRenderer = memo(QuestionRendererComponent, areEqual);
