import React from "react";
import { Pressable, Text, View } from "react-native";

import { CommunityMember } from "../models/CommunityMember";

interface CommunityMemberCardProps {
  member: CommunityMember;
  selected?: boolean;
  disabled?: boolean;
  onPress?: (member: CommunityMember) => void;
}

function getGenderLabel(gender: string): string {
  switch (gender.trim().toUpperCase()) {
    case "F":
      return "Female";
    case "M":
      return "Male";
    case "O":
      return "Other";
    default:
      return gender.trim() || "Not specified";
  }
}

function formatOptionalDate(value: string | null): string | null {
  if (!value?.trim()) {
    return null;
  }

  return value.trim().split("T")[0].split(" ")[0];
}

export const CommunityMemberCard = React.memo(function CommunityMemberCard({
  member,
  selected = false,
  disabled = false,
  onPress,
}: CommunityMemberCardProps) {
  const pregnancyDate = formatOptionalDate(member.pregnancyDate);
  const isPregnant = member.pregnancyStatus.trim().toUpperCase() === "Y";

  const locationParts = [
    member.municipalityName,
    member.wardNo ? `Ward ${member.wardNo}` : null,
  ].filter(Boolean);

  const card = (
    <View
      className={`rounded-xl border bg-white p-4 ${
        selected ? "border-blue-500 bg-blue-50" : "border-gray-200"
      } ${disabled ? "opacity-60" : ""}`}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text
            className="text-base font-semibold text-gray-900"
            numberOfLines={2}
          >
            {member.memberName || "Unnamed member"}
          </Text>

          <Text className="mt-1 text-xs text-gray-500">
            Client No: {member.clientNo}
          </Text>
        </View>

        {onPress && (
          <View
            className={`h-6 w-6 items-center justify-center rounded-full border ${
              selected
                ? "border-blue-600 bg-blue-600"
                : "border-gray-400 bg-white"
            }`}
          >
            {selected && (
              <Text className="text-sm font-bold text-white">✓</Text>
            )}
          </View>
        )}
      </View>

      <View className="mt-3 flex-row flex-wrap">
        <View className="mr-2 mb-2 rounded-full bg-gray-100 px-3 py-1">
          <Text className="text-xs text-gray-700">
            {getGenderLabel(member.gender)}
          </Text>
        </View>

        <View className="mr-2 mb-2 rounded-full bg-gray-100 px-3 py-1">
          <Text className="text-xs text-gray-700">
            Age: {member.clientAge ?? "N/A"}
          </Text>
        </View>

        {isPregnant && (
          <View className="mb-2 rounded-full bg-pink-100 px-3 py-1">
            <Text className="text-xs font-medium text-pink-700">Pregnant</Text>
          </View>
        )}
      </View>

      <View className="mt-1 border-t border-gray-100 pt-3">
        <Text className="text-sm text-gray-700">
          Household Head:{" "}
          <Text className="font-medium text-gray-900">
            {member.householdHeadName || "Not available"}
          </Text>
        </Text>

        <Text className="mt-1 text-sm text-gray-700">
          Relationship: {member.relationship || "Not available"}
        </Text>

        {locationParts.length > 0 && (
          <Text className="mt-2 text-sm text-gray-700">
            {locationParts.join(" · ")}
          </Text>
        )}

        <Text className="mt-1 text-sm text-gray-600">
          {member.address || "Address not available"}
        </Text>

        {isPregnant && pregnancyDate && (
          <Text className="mt-2 text-xs text-pink-700">
            Pregnancy date: {pregnancyDate}
          </Text>
        )}

        <Text className="mt-2 text-xs text-gray-500">
          Household ID: {member.householdId || "Not available"}
        </Text>
      </View>
    </View>
  );

  if (!onPress) {
    return <View className="mx-4 mb-3">{card}</View>;
  }

  return (
    <Pressable
      onPress={() => onPress(member)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityLabel={`Select ${member.memberName}`}
      accessibilityState={{
        checked: selected,
        disabled,
      }}
      className="mx-4 mb-3 active:opacity-80"
    >
      {card}
    </Pressable>
  );
});
