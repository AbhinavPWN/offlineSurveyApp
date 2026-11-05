import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

export type HouseholdDashboardTab = "LOCAL" | "ONLINE" | "COMMUNITY" | "SURVEY";

interface HouseholdDashboardTabsProps {
  activeTab: HouseholdDashboardTab;
  onlineLoading: boolean;
  onSelect: (tab: HouseholdDashboardTab) => void | Promise<void>;
}

interface TabDefinition {
  key: HouseholdDashboardTab;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}

const tabs: TabDefinition[] = [
  {
    key: "LOCAL",
    label: "Downloaded",
    icon: "download-outline",
  },
  {
    key: "ONLINE",
    label: "Online",
    icon: "cloud-outline",
  },
  {
    key: "COMMUNITY",
    label: "Community",
    icon: "people-outline",
  },
  { key: "SURVEY", label: "Survey", icon: "clipboard-outline" },
];

export const HouseholdDashboardTabs = React.memo(
  function HouseholdDashboardTabs({
    activeTab,
    onlineLoading,
    onSelect,
  }: HouseholdDashboardTabsProps) {
    return (
      <View
        className="mx-4 mt-2 flex-row rounded-xl bg-gray-100 p-1"
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
              className={`flex-1 rounded-lg px-1 py-2 ${
                isActive ? "bg-blue-700" : ""
              } ${isLoadingOnlineTab ? "opacity-60" : ""}`}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={isActive ? "white" : "#4b5563"}
                style={{ alignSelf: "center", marginBottom: 4 }}
              />
              <Text
                className={`text-center text-xs font-medium ${
                  isActive ? "text-white" : "text-gray-600"
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
