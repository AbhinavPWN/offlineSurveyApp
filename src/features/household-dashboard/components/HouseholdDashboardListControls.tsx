import React from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import type { HouseholdDashboardTab } from "./HouseholdDashboardTabs";

interface HouseholdDashboardListControlsProps {
  activeTab: HouseholdDashboardTab;
  isOnline: boolean;
  onlineLoading: boolean;
  localSearchQuery: string;
  normalizedLocalSearchQuery: string;
  downloadedCount: number;
  filteredDownloadedCount: number;
  onLocalSearchChange: (value: string) => void;
  onlineSearchQuery: string;
  normalizedOnlineSearchQuery: string;
  onlineCount: number;
  filteredOnlineCount: number;
  onOnlineSearchChange: (value: string) => void;
  onRefreshOnline: () => void | Promise<void>;
}

export const HouseholdDashboardListControls = React.memo(
  function HouseholdDashboardListControls({
    activeTab,
    isOnline,
    onlineLoading,
    localSearchQuery,
    normalizedLocalSearchQuery,
    downloadedCount,
    filteredDownloadedCount,
    onLocalSearchChange,
    onlineSearchQuery,
    normalizedOnlineSearchQuery,
    onlineCount,
    filteredOnlineCount,
    onOnlineSearchChange,
    onRefreshOnline,
  }: HouseholdDashboardListControlsProps) {
    if (activeTab === "LOCAL") {
      return (
        <View className="mx-4 mt-3">
          <Text className="text-sm text-gray-600">
            {normalizedLocalSearchQuery
              ? `${filteredDownloadedCount} of ${downloadedCount} downloaded households`
              : `${downloadedCount} downloaded ${
                  downloadedCount === 1 ? "household" : "households"
                }`}
          </Text>

          <View className="mt-3 flex-row items-center bg-white border border-gray-300 rounded-xl px-3">
            <Text className="text-gray-400 text-lg mr-2">⌕</Text>

            <TextInput
              value={localSearchQuery}
              onChangeText={onLocalSearchChange}
              placeholder="Search by head, member name, or household ID"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel="Search downloaded households"
              className="flex-1 py-3 text-base text-gray-900"
              onSubmitEditing={() => Keyboard.dismiss()}
            />

            {localSearchQuery.length > 0 && (
              <Pressable
                onPress={() => onLocalSearchChange("")}
                accessibilityRole="button"
                accessibilityLabel="Clear downloaded household search"
                className="ml-2 px-2 py-2"
              >
                <Text className="text-blue-700 text-sm font-semibold">
                  Clear
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      );
    }

    if (activeTab !== "ONLINE") return null;

    return (
      <View className="mx-4 mt-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-gray-600 flex-1 pr-3">
            {onlineLoading
              ? "Loading online households..."
              : normalizedOnlineSearchQuery
                ? `${filteredOnlineCount} of ${onlineCount} households`
                : `${onlineCount} online ${
                    onlineCount === 1 ? "household" : "households"
                  }`}
          </Text>

          <Pressable
            onPress={() => void onRefreshOnline()}
            disabled={onlineLoading || !isOnline}
            className={`px-4 py-2 rounded-lg ${
              onlineLoading || !isOnline
                ? "bg-gray-200"
                : "bg-blue-100 active:bg-blue-200"
            }`}
          >
            <View className="flex-row items-center">
              {onlineLoading && (
                <ActivityIndicator
                  size="small"
                  color="#6B7280"
                  style={{ marginRight: 6 }}
                />
              )}

              <Text
                className={`text-sm font-semibold ${
                  onlineLoading || !isOnline
                    ? "text-gray-500"
                    : "text-blue-700"
                }`}
              >
                {onlineLoading ? "Refreshing..." : "Refresh"}
              </Text>
            </View>
          </Pressable>
        </View>

        <View className="mt-3 flex-row items-center bg-white border border-gray-300 rounded-xl px-3">
          <Text className="text-gray-400 text-lg mr-2">⌕</Text>

          <TextInput
            value={onlineSearchQuery}
            onChangeText={onOnlineSearchChange}
            placeholder="Search by head name or household ID"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Search online households"
            className="flex-1 py-3 text-base text-gray-900"
            onSubmitEditing={() => Keyboard.dismiss()}
          />

          {onlineSearchQuery.length > 0 && (
            <Pressable
              onPress={() => onOnlineSearchChange("")}
              accessibilityRole="button"
              accessibilityLabel="Clear household search"
              className="ml-2 px-2 py-2"
            >
              <Text className="text-blue-700 text-sm font-semibold">
                Clear
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  },
);
