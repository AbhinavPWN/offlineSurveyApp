import React, { memo, useCallback } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type TextInputFieldProps = {
  label: string;
  value: string | null;
  error?: string | null;
  keyboardType?: "default" | "numeric" | "number-pad";
  onChange: (value: string | null) => void;
  placeholder?: string;
  savingStatus?: "saving" | "saved" | "error";
  readonly?: boolean;
  onRetry?: () => void;
};

const FIELD_CONTAINER_CLASS = "mb-4";
// const FIELD_LABEL_CLASS = "mb-1.5 text-sm font-medium text-gray-900";
const FIELD_ERROR_CLASS = "mt-1.5 text-xs text-red-600";
const FIELD_INPUT_BASE_CLASS =
  "min-h-11 rounded-md border bg-white px-3 py-2.5 text-base text-gray-900";
const FIELD_INPUT_DEFAULT_CLASS = `${FIELD_INPUT_BASE_CLASS} border-gray-300`;

const FIELD_INPUT_READONLY_CLASS = `${FIELD_INPUT_BASE_CLASS} border-gray-200 bg-gray-100 text-gray-500`;
const FIELD_INPUT_ERROR_CLASS = `${FIELD_INPUT_BASE_CLASS} border-red-600`;

function TextInputFieldComponent({
  label,
  value,
  error = null,
  onChange,
  placeholder = "",
  savingStatus,
  keyboardType = "default",
  readonly = false,
  onRetry,
}: TextInputFieldProps) {
  const inputValue = value ?? "";

  const handleChange = useCallback(
    (text: string) => {
      let formatted = text;

      // BP FORMAT: auto insert "/"
      if (label.includes("Blood Pressure")) {
        const digits = text.replace(/\D/g, "");

        if (digits.length <= 3) {
          formatted = digits;
        } else {
          formatted = `${digits.slice(0, 3)}/${digits.slice(3, 6)}`;
        }
      }

      onChange(formatted.trim() === "" ? null : formatted);
    },
    [onChange, label],
  );

  return (
    <View className={FIELD_CONTAINER_CLASS}>
      <View className="flex-row justify-between items-center mb-1.5">
        <Text className="text-sm font-medium text-gray-900">{label}</Text>

        {savingStatus === "saving" && (
          <Text className="text-gray-400 text-xs">Saving...</Text>
        )}

        {savingStatus === "saved" && (
          <Text className="text-green-500 text-xs">Saved</Text>
        )}

        {savingStatus === "error" && (
          <Pressable onPress={onRetry}>
            <Text className="text-red-500 text-xs underline">Retry</Text>
          </Pressable>
        )}
      </View>

      <TextInput
        className={
          error
            ? FIELD_INPUT_ERROR_CLASS
            : readonly
              ? FIELD_INPUT_READONLY_CLASS
              : FIELD_INPUT_DEFAULT_CLASS
        }
        value={inputValue}
        onChangeText={handleChange}
        keyboardType={keyboardType}
        placeholder={placeholder}
        autoCorrect={false}
        underlineColorAndroid="transparent"
        submitBehavior="blurAndSubmit"
        returnKeyType="done"
        importantForAutofill="no"
        accessibilityLabel={label}
        editable={!readonly}
      />

      {error ? <Text className={FIELD_ERROR_CLASS}>{error}</Text> : null}
    </View>
  );
}

export const TextInputField = memo(TextInputFieldComponent);
