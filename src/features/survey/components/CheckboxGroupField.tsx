import React, { memo, useCallback } from "react";
import { Pressable, Text, View } from "react-native";

type Option = {
  label: string;
  labelNp?: string;
  value: string;
};

type Props = {
  label: string;
  value: string[];
  options: Option[];
  onChange: (value: string[]) => void;
  error?: string | null;
  savingStatus?: "saving" | "saved" | "error";
};

function CheckboxGroupFieldComponent({
  label,
  value,
  options,
  onChange,
  error,
  savingStatus,
}: Props) {
  //  GUARANTEE: value is always array
  const current = value;

  console.log("[Checkbox UI Value]", current);

  const handleToggle = useCallback(
    (val: string) => {
      let newValue: string[];

      if (current.includes(val)) {
        newValue = current.filter((v) => v !== val);
      } else {
        newValue = [...current, val];
      }

      onChange(newValue);
    },
    [current, onChange],
  );

  return (
    <View className="mb-4">
      {/* Label + Saving Status */}
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

      {/* Options */}
      {options.map((opt) => {
        const selected = current.includes(opt.value);

        return (
          <Pressable
            key={opt.value}
            onPress={() => handleToggle(opt.value)}
            className={`mb-2 flex-row items-center border rounded-md px-3 py-2 ${
              selected ? "bg-blue-50 border-blue-500" : "border-gray-300"
            }`}
          >
            <Text className="mr-2">{selected ? "☑" : "☐"}</Text>

            <View>
              <Text className="text-sm text-gray-900">{opt.label}</Text>

              {opt.labelNp && (
                <Text className="text-xs text-gray-500 mt-1">
                  ( {opt.labelNp} )
                </Text>
              )}
            </View>
          </Pressable>
        );
      })}

      {/* Error */}
      {error ? <Text className="text-red-500 text-xs">{error}</Text> : null}
    </View>
  );
}

export const CheckboxGroupField = memo(CheckboxGroupFieldComponent);
