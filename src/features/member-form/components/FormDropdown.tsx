import React from "react";
import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { DropdownOption } from "../models/DropdownOptions";

interface Props {
  label: string;
  value: string | null;
  options: DropdownOption[];
  onChange: (value: string) => void;
}

export function FormDropdown({ label, value, options, onChange }: Props) {
  return (
    <View className="mb-4">
      <Text className="mb-1 font-medium">{label}</Text>

      <View className="border rounded-lg">
        <Picker
          selectedValue={value}
          onValueChange={(itemValue) => {
            if (itemValue !== null) {
              onChange(itemValue);
            }
          }}
        >
          <Picker.Item label="Select / छान्नुहोस्" value={null} />

          {options.map((opt) => (
            <Picker.Item
              key={opt.value}
              label={`${opt.labelNp} (${opt.labelEn})`}
              value={opt.value}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
}
