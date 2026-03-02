import React from "react";
import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { DropdownOption } from "../models/DropdownOptions";

interface Props {
  label: string;
  value: string | null;
  options: DropdownOption[];
  onChange: (value: string) => void;
  showNepali?: boolean;
}

export const FormDropdown = React.memo(function FormDropdown({
  label,
  value,
  options,
  onChange,
  showNepali,
}: Props) {
  // 🔥 Memoize Picker Items (prevents rebuilding hundreds of items every render)
  const renderedItems = React.useMemo(
    () =>
      options.map((opt) => (
        <Picker.Item
          key={opt.value}
          label={
            showNepali === false
              ? opt.labelEn
              : `${opt.labelNp} (${opt.labelEn})`
          }
          value={opt.value}
        />
      )),
    [options, showNepali],
  );

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
          {renderedItems}
        </Picker>
      </View>
    </View>
  );
});
