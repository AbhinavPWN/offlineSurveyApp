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
    <View className="bg-white rounded-xl p-4 shadow-sm">
      <Text className="text-sm text-gray-500 mb-3">Sync Overview</Text>

      <View className="flex-row justify-between">
        <View className="items-center flex-1">
          <Text className="text-xl font-bold text-amber-600">{pending}</Text>
          <Text className="text-xs text-gray-500 mt-1">Pending</Text>
        </View>

        <View className="items-center flex-1">
          <Text className="text-xl font-bold text-red-600">{failed}</Text>
          <Text className="text-xs text-gray-500 mt-1">Failed</Text>
        </View>

        <View className="items-center flex-1">
          <Text className="text-xl font-bold text-green-600">{synced}</Text>
          <Text className="text-xs text-gray-500 mt-1">Synced</Text>
        </View>
      </View>
    </View>
  );
};
