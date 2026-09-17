import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import type { HouseholdDashboardTab } from "./HouseholdDashboardTabs";

interface HouseholdDashboardEmptyStateProps {
  activeTab: HouseholdDashboardTab;
  isOnline: boolean;
  onlineLoading: boolean;
  onlineError: string | null;
  normalizedOnlineSearchQuery: string;
  onlineCount: number;
  normalizedLocalSearchQuery: string;
  downloadedCount: number;
  onRetryOnline: () => void | Promise<void>;
  onClearOnlineSearch: () => void;
  onClearLocalSearch: () => void;
}

export const HouseholdDashboardEmptyState = React.memo(
  function HouseholdDashboardEmptyState({
    activeTab,
    isOnline,
    onlineLoading,
    onlineError,
    normalizedOnlineSearchQuery,
    onlineCount,
    normalizedLocalSearchQuery,
    downloadedCount,
    onRetryOnline,
    onClearOnlineSearch,
    onClearLocalSearch,
  }: HouseholdDashboardEmptyStateProps) {
    if (activeTab === "ONLINE" && onlineLoading) {
      return (
        <View className="items-center px-6">
          <ActivityIndicator size="large" />

          <Text className="text-lg font-semibold text-gray-700 mt-4">
            Loading online households
          </Text>

          <Text className="text-gray-500 text-center mt-2">
            The server has many household records. This may take one or two
            minutes.
          </Text>
        </View>
      );
    }

    if (activeTab === "ONLINE" && !isOnline) {
      return (
        <View className="items-center px-6">
          <Text className="text-5xl mb-4">📡</Text>

          <Text className="text-lg font-semibold text-gray-700 mb-2">
            No Internet Connection
          </Text>

          <Text className="text-gray-500 text-center">
            Connect to the internet to view and download online households.
          </Text>
        </View>
      );
    }

    if (activeTab === "ONLINE" && onlineError) {
      return (
        <View className="items-center px-6">
          <Text className="text-5xl mb-4">⚠️</Text>

          <Text className="text-lg font-semibold text-red-700 mb-2">
            Unable to load households
          </Text>

          <Text className="text-gray-500 text-center">{onlineError}</Text>

          <Pressable
            onPress={() => void onRetryOnline()}
            className="bg-blue-600 px-5 py-2 rounded-lg mt-4"
          >
            <Text className="text-white font-medium">Try Again</Text>
          </Pressable>
        </View>
      );
    }

    if (
      activeTab === "ONLINE" &&
      normalizedOnlineSearchQuery &&
      onlineCount > 0
    ) {
      return (
        <View className="items-center px-6">
          <Text className="text-5xl mb-4">🔎</Text>

          <Text className="text-lg font-semibold text-gray-700 mb-2">
            No matching household found
          </Text>

          <Text className="text-gray-500 text-center">
            Try another household-head name or household ID.
          </Text>

          <Pressable
            onPress={onClearOnlineSearch}
            className="bg-blue-600 px-5 py-2 rounded-lg mt-4"
          >
            <Text className="text-white font-medium">Clear Search</Text>
          </Pressable>
        </View>
      );
    }

    if (
      activeTab === "LOCAL" &&
      normalizedLocalSearchQuery &&
      downloadedCount > 0
    ) {
      return (
        <View className="items-center px-6">
          <Text className="text-5xl mb-4">🔎</Text>

          <Text className="text-lg font-semibold text-gray-700 mb-2">
            No matching downloaded household found
          </Text>

          <Text className="text-gray-500 text-center">
            Try another household-head name, member name, or household ID.
          </Text>

          <Pressable
            onPress={onClearLocalSearch}
            className="bg-blue-600 px-5 py-2 rounded-lg mt-4"
          >
            <Text className="text-white font-medium">Clear Search</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View className="items-center px-6">
        <Text className="text-5xl mb-4">🏠</Text>

        <Text className="text-lg font-semibold text-gray-700 mb-2">
          No households yet
        </Text>

        <Text className="text-gray-500 text-center">
          {activeTab === "LOCAL"
            ? "Tap the + button below to create your first household listing."
            : "No households available online."}
        </Text>
      </View>
    );
  },
);
