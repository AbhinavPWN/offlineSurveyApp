import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title: string;

  progress: number;
  answeredQuestions: number;
  totalQuestions: number;

  currentIndex: number;
  totalSections: number;
  sections: string[];

  onPressGuidance: () => void;
};

// Short labels for sticky mobile UX
function getShortSectionLabel(label: string) {
  const map: Record<string, string> = {
    "Postpartum Care": "Postpartum",
    "Social Protection": "Social",
    "Disability Social Protection": "Disability",
    "Reproductive Health": "Reproductive",
    Pregnancy: "Pregnancy",
    "Adult Health": "Adult",
  };

  return map[label] ?? label;
}

function StepChip({
  label,
  status,
}: {
  label: string;
  status: "completed" | "current" | "upcoming";
}) {
  const containerClass =
    status === "completed"
      ? "bg-green-100"
      : status === "current"
        ? "bg-blue-100"
        : "bg-gray-100";

  const textClass =
    status === "completed"
      ? "text-green-700"
      : status === "current"
        ? "text-blue-700"
        : "text-gray-500";

  const icon = status === "completed" ? "✓" : status === "current" ? "●" : "○";

  return (
    <View className={`mr-2 rounded-full px-3 py-1.5 ${containerClass}`}>
      <Text className={`text-[13px] font-medium ${textClass}`}>
        <Text className="text-[10px]">{icon}</Text>{" "}
        {getShortSectionLabel(label)}
      </Text>
    </View>
  );
}

export default function SurveyStickyHeader({
  title,
  progress,
  answeredQuestions,
  totalQuestions,

  currentIndex,
  sections,

  onPressGuidance,
}: Props) {
  const isComplete = totalQuestions > 0 && answeredQuestions === totalQuestions;

  return (
    <View className="border-b border-gray-200 bg-white px-4 pb-3 pt-3">
      {/* Top row */}
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-[20px] font-semibold text-gray-900">
            {title}
          </Text>

          <Text className="mt-1 text-sm text-gray-500 py-1">
            {answeredQuestions} of {totalQuestions} answered
            {isComplete && (
              <Text className="text-green-600 text-[20px]"> ✓</Text>
            )}
          </Text>
        </View>

        {/* Guidance button */}
        <Pressable
          onPress={onPressGuidance}
          className="h-10 w-10 items-center justify-center rounded-full bg-blue-50"
        >
          <Ionicons name="information-circle" size={22} color="#2563eb" />
        </Pressable>
      </View>

      {/* Progress bar */}
      <View className="mt-3">
        <View className="h-2 overflow-hidden rounded-full bg-gray-200">
          <View
            className="h-2 rounded-full bg-blue-600"
            style={{
              width: `${Math.max(progress * 100, 2)}%`,
            }}
          />
        </View>
      </View>

      {/* Survey flow pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-3"
      >
        {sections.map((section, index) => {
          const status =
            index < currentIndex
              ? "completed"
              : index === currentIndex
                ? "current"
                : "upcoming";

          return (
            <StepChip
              key={`${section}-${index}`}
              label={section}
              status={status}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}
