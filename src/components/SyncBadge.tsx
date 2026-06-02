import React from "react";
import { View, Text } from "react-native";
import { AggregateSyncStatus } from "../models/AggregateSyncStatus";

interface Props {
  status: AggregateSyncStatus;
}

function getBadgeMeta(status: AggregateSyncStatus) {
  switch (status) {
    case "FULLY_SYNCED":
      return {
        label: "✓ Synced",
        bgColor: "bg-green-600",
      };

    case "PENDING":
      return {
        label: "↻ Ready to Sync",
        bgColor: "bg-yellow-500",
      };

    case "PARTIAL_PENDING":
      return {
        label: "↻ Needs Sync",
        bgColor: "bg-yellow-500",
      };

    case "FAILED":
      return {
        label: "⚠ Needs Attention",
        bgColor: "bg-red-600",
      };

    case "PARTIAL_FAILED":
      return {
        label: "⚠ Some Issues",
        bgColor: "bg-red-600",
      };

    case "DRAFT":
      return {
        label: "Not Completed",
        bgColor: "bg-orange-500",
      };

    default:
      return {
        label: "Unknown",
        bgColor: "bg-gray-400",
      };
  }
}

export const SyncBadge: React.FC<Props> = ({ status }) => {
  const meta = getBadgeMeta(status);

  return (
    <View className={`px-2 py-0.5 rounded-full ${meta.bgColor}`}>
      <Text className="text-white text-xs font-medium">{meta.label}</Text>
    </View>
  );
};
