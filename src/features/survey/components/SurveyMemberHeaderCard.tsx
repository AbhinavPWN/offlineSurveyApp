import React, { useMemo } from "react";
import { Text, View } from "react-native";

import {
  MemberSurveyProfile,
  SurveySectionKey,
} from "../engine/surveyClassifier";
import { SECTION_CONFIG } from "../config/sectionConfig";

type Props = {
  member: any;
  profile: MemberSurveyProfile;
  effectiveSections: SurveySectionKey[];
};

function Chip({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "default" | "info";
}) {
  const className = variant === "info" ? "bg-blue-50" : "bg-gray-100";

  const textClassName = variant === "info" ? "text-blue-700" : "text-gray-700";

  return (
    <View className={`mr-2 mb-2 rounded-full px-3 py-2 ${className}`}>
      <Text className={`text-xs font-semibold ${textClassName}`}>{label}</Text>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-1.5">
      <Text className="text-sm text-gray-500">{label}</Text>

      <Text className="text-sm font-semibold text-gray-800">{value}</Text>
    </View>
  );
}

export default function SurveyMemberHeaderCard({
  member,
  profile,
  effectiveSections,
}: Props) {
  const fullName = `${member?.firstName ?? ""} ${
    member?.lastName ?? ""
  }`.trim();

  const genderLabel =
    profile.gender === "F"
      ? "Female"
      : profile.gender === "M"
        ? "Male"
        : "Unknown";

  const ageLabel =
    profile.ageYears != null ? `${profile.ageYears} yrs` : "Unknown";

  // Dynamic primary category
  const primarySection = effectiveSections[0];

  const primaryCategory = primarySection
    ? SECTION_CONFIG[primarySection]?.title
    : "Survey";

  // Dynamic contextual status chips
  const currentStatus = useMemo(() => {
    const items: string[] = [];

    if (profile.maritalStatus === "M") {
      items.push("Married");
    }

    if (profile.isPregnant) {
      items.push("Pregnant");
    }

    if (profile.isPostpartum) {
      items.push("Postpartum");
    }

    if (profile.isDisabled) {
      items.push("Disability");
    }

    if (profile.childAgeDays != null && profile.childAgeDays >= 0) {
      items.push(`Newborn ${profile.childAgeDays} days`);
    }

    if (profile.hasInfantInCare) {
      items.push("Infant in Care");
    }

    if (profile.hasChildInCare) {
      items.push("Child in Care");
    }

    return items;
  }, [profile]);

  return (
    <View className="mb-4 rounded-3xl border border-gray-200 bg-white p-5">
      {/* Header */}
      <View>
        <Text className="text-2xl font-bold text-gray-900">
          {fullName || "Unnamed member"}
        </Text>

        <Text className="mt-1 text-base text-gray-600">
          {genderLabel} • {ageLabel}
        </Text>
      </View>

      {/* Member Verification */}
      <View className="mt-5">
        <Text className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Member Verification
        </Text>

        <View className="mt-2 rounded-2xl bg-gray-50 p-4">
          <DetailRow label="Gender" value={genderLabel} />

          <DetailRow label="Age" value={ageLabel} />

          <DetailRow
            label="Marital Status"
            value={profile.maritalStatus === "M" ? "Married" : "Unmarried"}
          />

          {profile.childAgeDays != null && (
            <DetailRow
              label="Child Age"
              value={`${profile.childAgeDays} days`}
            />
          )}
        </View>
      </View>

      {/* Current Status */}
      {currentStatus.length > 0 && (
        <View className="mt-5">
          <Text className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Current Status
          </Text>

          <View className="mt-3 flex-row flex-wrap">
            {currentStatus.map((item) => (
              <Chip key={item} label={item} variant="info" />
            ))}
          </View>
        </View>
      )}

      {/* Survey Category */}
      <View className="mt-5">
        <Text className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Survey Category
        </Text>

        <Text className="mt-2 text-lg font-semibold text-gray-900">
          {primaryCategory}
        </Text>

        <Text className="mt-1 text-sm text-gray-500">
          {effectiveSections.length} survey section
          {effectiveSections.length > 1 ? "s" : ""} included
        </Text>
      </View>
    </View>
  );
}
