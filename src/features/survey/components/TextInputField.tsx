import React, { memo, useCallback } from "react";
import { Text, TextInput, View } from "react-native";

type TextInputFieldProps = {
  label: string;
  value: string | null;
  error?: string | null;
  keyboardType?: "default" | "numeric" | "number-pad";
  onChange: (value: string | null) => void;
  placeholder?: string;
  savingStatus?: "saving" | "saved" | "error";
};

const FIELD_CONTAINER_CLASS = "mb-4";
// const FIELD_LABEL_CLASS = "mb-1.5 text-sm font-medium text-gray-900";
const FIELD_ERROR_CLASS = "mt-1.5 text-xs text-red-600";
const FIELD_INPUT_BASE_CLASS =
  "min-h-11 rounded-md border bg-white px-3 py-2.5 text-base text-gray-900";
const FIELD_INPUT_DEFAULT_CLASS = `${FIELD_INPUT_BASE_CLASS} border-gray-300`;
const FIELD_INPUT_ERROR_CLASS = `${FIELD_INPUT_BASE_CLASS} border-red-600`;

function TextInputFieldComponent({
  label,
  value,
  error = null,
  onChange,
  placeholder = "",
  savingStatus,
  keyboardType = "default",
}: TextInputFieldProps) {
  const inputValue = value ?? "";

  const handleChange = useCallback(
    (text: string) => {
      //  normalize empty string → null (VERY IMPORTANT)
      onChange(text.trim() === "" ? null : text);
    },
    [onChange],
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
          <Text className="text-red-500 text-xs">Failed</Text>
        )}
      </View>

      <TextInput
        className={error ? FIELD_INPUT_ERROR_CLASS : FIELD_INPUT_DEFAULT_CLASS}
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
      />

      {error ? <Text className={FIELD_ERROR_CLASS}>{error}</Text> : null}
    </View>
  );
}

export const TextInputField = memo(TextInputFieldComponent);
