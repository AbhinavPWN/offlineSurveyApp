import React from "react";
import { View, Text } from "react-native";
import { HouseholdLocal } from "@/src/models/household.model";

interface Props {
  households: HouseholdLocal[];
}

export const SummaryBar: React.FC<Props> = ({ households }) => {
  const pending = households.filter((h) => h.syncStatus === "PENDING").length;

  const failed = households.filter((h) => h.syncStatus === "FAILED").length;

  return (
    <View className="flex-row justify-around bg-gray-100 py-3">
      <Text className="text-gray-700">Pending: {pending}</Text>
      <Text className="text-red-600">Failed: {failed}</Text>
    </View>
  );
};
