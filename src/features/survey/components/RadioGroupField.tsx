import React, { memo, useCallback } from "react";
import { Pressable, Text, View } from "react-native";

type RadioOption = {
  label: string;
  value: string;
};

type RadioGroupFieldProps = {
  label: string;
  value: string | null;
  options: RadioOption[];
  error?: string | null;
  onChange: (value: string) => void;
  savingStatus?: "saving" | "saved" | "error";
};

type RadioOptionItemProps = {
  label: string;
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
};

const FIELD_CONTAINER_CLASS = "mb-4";
// const FIELD_LABEL_CLASS = "mb-1.5 text-sm font-medium text-gray-900";
const FIELD_ERROR_CLASS = "mt-1.5 text-xs text-red-600";
const OPTION_BASE_CLASS =
  "mb-2 min-h-11 flex-row items-center rounded-md border bg-white px-3 py-2.5";
const OPTION_DEFAULT_CLASS = `${OPTION_BASE_CLASS} border-gray-300`;
const OPTION_SELECTED_CLASS = `${OPTION_BASE_CLASS} border-blue-600 bg-blue-50`;
const RADIO_OUTER_BASE_CLASS =
  "mr-3 h-[18px] w-[18px] items-center justify-center rounded-full border-2";
const RADIO_OUTER_DEFAULT_CLASS = `${RADIO_OUTER_BASE_CLASS} border-gray-500`;
const RADIO_OUTER_SELECTED_CLASS = `${RADIO_OUTER_BASE_CLASS} border-blue-600`;

function RadioOptionItemComponent({
  label,
  value,
  selected,
  onSelect,
}: RadioOptionItemProps) {
  const handlePress = useCallback(() => {
    onSelect(value);
  }, [onSelect, value]);

  return (
    <Pressable
      onPress={handlePress}
      android_ripple={{ color: "#E5E7EB" }}
      android_disableSound
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className={selected ? OPTION_SELECTED_CLASS : OPTION_DEFAULT_CLASS}
    >
      <View
        className={
          selected ? RADIO_OUTER_SELECTED_CLASS : RADIO_OUTER_DEFAULT_CLASS
        }
      >
        <View
          className={
            selected
              ? "h-2 w-2 rounded-full bg-blue-600"
              : "h-2 w-2 rounded-full bg-transparent"
          }
        />
      </View>

      <Text className="flex-1 text-sm text-gray-900">{label}</Text>
    </Pressable>
  );
}

const RadioOptionItem = memo(RadioOptionItemComponent);

function RadioGroupFieldComponent({
  label,
  value,
  options,
  error = null,
  onChange,
  savingStatus,
}: RadioGroupFieldProps) {
  const handleSelect = useCallback(
    (nextValue: string) => {
      onChange(nextValue);
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

      <View>
        {options.map((option) => (
          <RadioOptionItem
            key={option.value}
            label={option.label}
            value={option.value}
            selected={value === option.value}
            onSelect={handleSelect}
          />
        ))}
      </View>

      {error ? <Text className={FIELD_ERROR_CLASS}>{error}</Text> : null}
    </View>
  );
}

export const RadioGroupField = memo(RadioGroupFieldComponent);
