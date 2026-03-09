import React from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { DropdownOption } from "../models/DropdownOptions";

interface Props {
  label: string;
  value: string | null;
  options: DropdownOption[];
  onChange: (value: string) => void;
  showNepali?: boolean;
}

function getOptionLabel(opt: DropdownOption, showNepali?: boolean) {
  return showNepali === false
    ? opt.labelEn
    : `${opt.labelNp} (${opt.labelEn})`;
}

export const FormDropdown = React.memo(
  function FormDropdown({ label, value, options, onChange, showNepali }: Props) {
    const [open, setOpen] = React.useState(false);

    const safeOptions = Array.isArray(options) ? options : [];

    const normalizedValue =
      typeof value === "string" && value.trim().length > 0 ? value : null;

    const selected = safeOptions.find((opt) => opt.value === normalizedValue);
    const display = selected
      ? getOptionLabel(selected, showNepali)
      : "Select / छान्नुहोस्";

    return (
      <View className="mb-4">
        <Text className="mb-1 font-medium">{label}</Text>

        <Pressable
          onPress={() => setOpen(true)}
          className="border rounded-lg px-3 py-3 bg-white"
        >
          <Text>{display}</Text>
        </Pressable>

        <Modal visible={open} transparent animationType="fade">
          <View className="flex-1 bg-black/40 justify-center px-4">
            <View className="bg-white rounded-xl max-h-[70%] overflow-hidden">
              <View className="px-4 py-3 border-b border-gray-200 flex-row justify-between items-center">
                <Text className="font-semibold">Select Option</Text>
                <TouchableOpacity onPress={() => setOpen(false)}>
                  <Text className="text-blue-600">Close</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={safeOptions}
                keyExtractor={(item) => String(item.value)}
                ListHeaderComponent={
                  <Pressable
                    onPress={() => setOpen(false)}
                    className="px-4 py-3 border-b border-gray-100"
                  >
                    <Text className="text-gray-600">Select / छान्नुहोस्</Text>
                  </Pressable>
                }
                renderItem={({ item }) => {
                  const isSelected = item.value === normalizedValue;

                  return (
                    <Pressable
                      onPress={() => {
                        onChange(item.value);
                        setOpen(false);
                      }}
                      className={`px-4 py-3 border-b border-gray-100 ${
                        isSelected ? "bg-blue-50" : "bg-white"
                      }`}
                    >
                      <Text className={isSelected ? "text-blue-700" : "text-black"}>
                        {getOptionLabel(item, showNepali)}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            </View>
          </View>
        </Modal>
      </View>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.label !== nextProps.label) return false;
    if (prevProps.value !== nextProps.value) return false;
    if (prevProps.showNepali !== nextProps.showNepali) return false;

    if (prevProps.options === nextProps.options) return true;
    if (prevProps.options.length !== nextProps.options.length) return false;

    for (let i = 0; i < prevProps.options.length; i++) {
      const prev = prevProps.options[i];
      const next = nextProps.options[i];
      if (
        prev.value !== next.value ||
        prev.labelEn !== next.labelEn ||
        prev.labelNp !== next.labelNp
      ) {
        return false;
      }
    }

    return true;
  },
);
