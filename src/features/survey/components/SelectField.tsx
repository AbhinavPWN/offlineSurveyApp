import React, { memo, useCallback, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

type SelectOption = {
  label: string;
  labelNp?: string;
  value: string;
};

type SelectFieldProps = {
  label: string;
  value: string | null;
  options: SelectOption[];
  placeholder?: string;
  error?: string | null;
  onChange: (value: string) => void;
  savingStatus?: "saving" | "saved" | "error";
  onRetry?: () => void;
};

type SelectOptionItemProps = {
  label: string;
  selected: boolean;
  value: string;
  onSelect: (value: string) => void;
};

const FIELD_CONTAINER_CLASS = "mb-4";
// const FIELD_LABEL_CLASS = "mb-1.5 text-sm font-medium text-gray-900";
const FIELD_ERROR_CLASS = "mt-1.5 text-xs text-red-600";
const FIELD_CONTROL_BASE_CLASS =
  "min-h-11 flex-row items-center justify-between rounded-md border bg-white px-3 py-2.5";
const FIELD_CONTROL_DEFAULT_CLASS = `${FIELD_CONTROL_BASE_CLASS} border-gray-300`;
const FIELD_CONTROL_ERROR_CLASS = `${FIELD_CONTROL_BASE_CLASS} border-red-600`;

function formatOptionLabel(option: SelectOption) {
  return option.labelNp ? `${option.label} (${option.labelNp})` : option.label;
}

function SelectOptionItemComponent({
  label,
  selected,
  value,
  onSelect,
}: SelectOptionItemProps) {
  const handlePress = useCallback(() => {
    onSelect(value);
  }, [onSelect, value]);

  const containerClass = selected
    ? "min-h-11 flex-row items-center border-b border-gray-200 bg-blue-50 px-4 py-3"
    : "min-h-11 flex-row items-center border-b border-gray-200 bg-white px-4 py-3";

  const textClass = selected
    ? "flex-1 text-sm font-medium text-blue-700"
    : "flex-1 text-sm text-gray-900";

  return (
    <Pressable
      onPress={handlePress}
      android_ripple={{ color: "#E5E7EB" }}
      android_disableSound
      className={containerClass}
    >
      <Text className={textClass}>{label}</Text>
    </Pressable>
  );
}

const SelectOptionItem = memo(SelectOptionItemComponent);

function SelectFieldComponent({
  label,
  value,
  options,
  placeholder = "Select an option",
  error = null,
  onChange,
  savingStatus,
  onRetry,
}: SelectFieldProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const selectedLabel = useMemo(() => {
    if (!value) return placeholder;

    const selectedOption = options.find((o) => o.value === value);
    return selectedOption ? formatOptionLabel(selectedOption) : placeholder;
  }, [options, placeholder, value]);

  const openModal = useCallback(() => setIsModalVisible(true), []);
  const closeModal = useCallback(() => setIsModalVisible(false), []);

  const handleSelect = useCallback(
    (nextValue: string) => {
      onChange(nextValue);
      setIsModalVisible(false);
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
          <Pressable onPress={onRetry}>
            <Text className="text-red-500 text-xs underline">Retry</Text>
          </Pressable>
        )}
      </View>

      <Pressable
        onPress={openModal}
        android_ripple={{ color: "#E5E7EB" }}
        android_disableSound
        accessibilityRole="button"
        accessibilityLabel={label}
        className={
          error ? FIELD_CONTROL_ERROR_CLASS : FIELD_CONTROL_DEFAULT_CLASS
        }
      >
        <Text
          className={
            value
              ? "flex-1 text-base text-gray-900"
              : "flex-1 text-base text-gray-400"
          }
        >
          {selectedLabel}
        </Text>
        <Text className="ml-3 text-base text-gray-500">▼</Text>
      </Pressable>

      {error ? <Text className={FIELD_ERROR_CLASS}>{error}</Text> : null}

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        hardwareAccelerated
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-center px-4">
          <Pressable
            className="absolute inset-0 bg-black/30"
            onPress={closeModal}
          />

          <View className="max-h-[70%] rounded-lg border border-gray-200 bg-white">
            <View className="border-b border-gray-200 px-4 py-3">
              <Text className="text-sm font-medium text-gray-900">{label}</Text>
            </View>

            <ScrollView bounces={false} keyboardShouldPersistTaps="handled">
              {options.map((option) => (
                <SelectOptionItem
                  key={option.value}
                  label={formatOptionLabel(option)}
                  selected={value === option.value}
                  value={option.value}
                  onSelect={handleSelect}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export const SelectField = memo(SelectFieldComponent);
