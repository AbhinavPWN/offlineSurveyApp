import React from "react";
import { View, Text } from "react-native";
import { HouseholdLocal } from "../models/household.model";

interface Props {
  households: HouseholdLocal[];
}

export const SummaryBar: React.FC<Props> = ({ households }) => {
  const pending = households.filter((h) => h.syncStatus === "PENDING").length;

  const failed = households.filter((h) => h.syncStatus === "FAILED").length;

  const synced = households.filter((h) => h.syncStatus === "SYNCED").length;

  return (
    <View className="flex-row justify-between rounded-lg bg-white px-3 py-2">
      <Text className="text-xs text-amber-700">Pending {pending}</Text>
      <Text className="text-xs text-red-700">Failed {failed}</Text>
      <Text className="text-xs text-green-700">Synced {synced}</Text>
    </View>
  );
};
