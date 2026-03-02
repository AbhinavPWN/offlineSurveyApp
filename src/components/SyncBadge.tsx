import React from "react";
import { View, Text } from "react-native";
import { AggregateSyncStatus } from "../models/AggregateSyncStatus";

interface Props {
  status: AggregateSyncStatus;
}

export const SyncBadge: React.FC<Props> = ({ status }) => {
  const getBgColor = () => {
    switch (status) {
      case "FULLY_SYNCED":
        return "bg-green-600";

      case "PARTIAL_PENDING":
      case "PENDING":
        return "bg-yellow-500";

      case "PARTIAL_FAILED":
      case "FAILED":
        return "bg-red-600";

      case "DRAFT":
        return "bg-orange-500";

      default:
        return "bg-gray-400";
    }
  };

  return (
    <View className={`px-2 py-0.5 rounded-full ${getBgColor()}`}>
      <Text className="text-white text-xs">{status}</Text>
    </View>
  );
};
