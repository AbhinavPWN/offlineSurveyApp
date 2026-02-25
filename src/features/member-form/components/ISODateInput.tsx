import React from "react";
import { View, Text, TextInput } from "react-native";

interface Props {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}

function formatISODate(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;

  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

export function ISODateInput({
  label,
  value,
  onChange,
  placeholder = "YYYY-MM-DD",
}: Props) {
  return (
    <View className="mb-4">
      <Text className="mb-1 font-medium">{label}</Text>

      <TextInput
        className="border rounded-lg px-3 py-2"
        keyboardType="number-pad"
        maxLength={10}
        value={value ?? ""}
        placeholder={placeholder}
        onChangeText={(text) => {
          const formatted = formatISODate(text);
          onChange(formatted || null);
        }}
      />
    </View>
  );
}
