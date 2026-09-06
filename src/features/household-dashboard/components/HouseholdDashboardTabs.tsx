import React from "react";
import { Pressable, Text, View } from "react-native";

export type HouseholdDashboardTab = "LOCAL" | "ONLINE" | "COMMUNITY";

interface HouseholdDashboardTabsProps {
  activeTab: HouseholdDashboardTab;
  onlineLoading: boolean;
  onSelect: (tab: HouseholdDashboardTab) => void | Promise<void>;
}

interface TabDefinition {
  key: HouseholdDashboardTab;
  label: string;
}

const tabs: TabDefinition[] = [
  {
    key: "LOCAL",
    label: "Downloaded",
  },
  {
    key: "ONLINE",
    label: "Online",
  },
  {
    key: "COMMUNITY",
    label: "Community",
  },
];

export const HouseholdDashboardTabs = React.memo(
  function HouseholdDashboardTabs({
    activeTab,
    onlineLoading,
    onSelect,
  }: HouseholdDashboardTabsProps) {
    return (
      <View
        className="mx-4 mt-4 flex-row overflow-hidden rounded-lg bg-gray-200"
        accessibilityRole="tablist"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const isLoadingOnlineTab = tab.key === "ONLINE" && onlineLoading;

          return (
            <Pressable
              key={tab.key}
              onPress={() => {
                void onSelect(tab.key);
              }}
              disabled={isLoadingOnlineTab}
              accessibilityRole="tab"
              accessibilityLabel={`${tab.label} tab`}
              accessibilityState={{
                selected: isActive,
                disabled: isLoadingOnlineTab,
              }}
              className={`flex-1 py-2 ${
                isActive ? "bg-white" : ""
              } ${isLoadingOnlineTab ? "opacity-60" : ""}`}
            >
              <Text
                className={`text-center text-sm font-medium ${
                  isActive ? "text-gray-900" : "text-gray-600"
                }`}
                numberOfLines={1}
              >
                {isLoadingOnlineTab ? "Loading..." : tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  },
);
