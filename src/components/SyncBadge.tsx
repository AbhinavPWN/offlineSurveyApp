import React from "react";
import { View, Text } from "react-native";
import { SyncStatus } from "@/src/models/household.model";

interface Props {
  status: SyncStatus;
}

export const SyncBadge: React.FC<Props> = ({ status }) => {
  const bgColor =
    status === "SYNCED"
      ? "bg-green-600"
      : status === "PENDING"
        ? "bg-yellow-500"
        : "bg-red-600";

  return (
    <View className={`px-2 py-0.5 rounded-full ${bgColor}`}>
      <Text className="text-white text-xs">{status}</Text>
    </View>
  );
};
