import React from "react";
import { Modal, Pressable, Text, View, ScrollView } from "react-native";

type Props = {
  visible: boolean;

  memberName: string;
  surveyCategory: string;
  sections: string[];

  incompleteCount: number;

  onClose: () => void;
  onConfirm: () => void;
};

function SectionChip({ label }: { label: string }) {
  return (
    <View className="mr-2 mb-2 rounded-full bg-gray-100 px-3 py-2">
      <Text className="text-xs font-medium text-gray-700">{label}</Text>
    </View>
  );
}

export default function SurveyFinishModal({
  visible,
  memberName,
  surveyCategory,
  sections,
  incompleteCount,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/40 px-5">
        <View className="max-h-[85%] w-full rounded-3xl bg-white p-5">
          {/* Header */}
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-2xl font-bold text-gray-900">
                Complete Survey?
              </Text>

              <Text className="mt-1 text-sm text-gray-500">
                Review before finishing
              </Text>
            </View>

            {/* Close Button */}
            <Pressable
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
            >
              <Text className="text-lg font-semibold text-gray-700">✕</Text>
            </Pressable>
          </View>

          <ScrollView className="mt-5" showsVerticalScrollIndicator={false}>
            {/* Member */}
            <View className="rounded-2xl bg-gray-50 p-4">
              <Text className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Member
              </Text>

              <Text className="mt-2 text-base font-semibold text-gray-900">
                {memberName}
              </Text>
            </View>

            {/* Category */}
            {/* <View className="mt-4 rounded-2xl bg-gray-50 p-4">
              <Text className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Survey Category
              </Text>

              <Text className="mt-2 text-base font-semibold text-gray-900">
                {surveyCategory}
              </Text>
            </View> */}

            {/* Sections */}
            <View className="mt-4 rounded-2xl bg-gray-50 p-4">
              <Text className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Included Survey Sections
              </Text>

              <View className="mt-3 flex-row flex-wrap">
                {sections.map((section) => (
                  <SectionChip key={section} label={section} />
                ))}
              </View>
            </View>

            {/* Warning */}
            {incompleteCount > 0 && (
              <View className="mt-4 rounded-2xl border border-yellow-300 bg-yellow-50 p-4">
                <Text className="text-sm font-semibold text-yellow-800">
                  ⚠ {incompleteCount} required question
                  {incompleteCount > 1 ? "s" : ""} incomplete
                </Text>

                <Text className="mt-1 text-sm text-yellow-700">
                  You may finish now and edit this survey later.
                </Text>
              </View>
            )}

            {/* Trust message */}
            <View className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4">
              <Text className="text-sm text-green-800">
                ✓ Responses are already saved on this phone.
              </Text>

              <Text className="mt-1 text-sm text-green-700">
                You can return and edit this survey later.
              </Text>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View className="mt-5 flex-row">
            <Pressable
              onPress={onClose}
              className="mr-2 flex-1 rounded-2xl bg-gray-200 py-4"
            >
              <Text className="text-center font-medium text-gray-800">
                Go Back
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              className="ml-2 flex-1 rounded-2xl bg-green-600 py-4"
            >
              <Text className="text-center font-semibold text-white">
                Finish Survey
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
