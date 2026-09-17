import React from "react";
import { Pressable, Text, View } from "react-native";

import type { AuthState } from "../../../auth/model/AuthState";
import SupportLogButton from "../../../components/support/SupportLogButton";

interface HouseholdDashboardHeaderProps {
  isOnline: boolean;
  authState: AuthState;
  syncing: boolean;
  onLogout: () => void;
  onSync: () => void;
  onLogin: () => void;
}

export const HouseholdDashboardHeader = React.memo(
  function HouseholdDashboardHeader({
    isOnline,
    authState,
    syncing,
    onLogout,
    onSync,
    onLogin,
  }: HouseholdDashboardHeaderProps) {
    return (
      <>
        <View className="px-4 pt-6 pb-4 bg-white shadow-sm">
          <View className="flex-row justify-between items-center">
            <Text className="text-2xl font-bold text-gray-900">Households</Text>

            <View className="flex-row items-center gap-3">
              <SupportLogButton />

              <Pressable
                onPress={onLogout}
                className="border border-red-500 bg-red-50 px-2 py-2 rounded-xl active:bg-red-100"
              >
                <Text className="text-red-600 font-semibold">Logout</Text>
              </Pressable>
            </View>
          </View>

          <View className="flex-row justify-between items-center mt-4">
            <Text className="text-sm text-gray-500 flex-1 pr-2">
              Manage and update households in your assigned ward
            </Text>

            {!isOnline ? (
              <View className="px-3 py-1 rounded-full bg-gray-200">
                <Text className="text-gray-600 text-xs font-medium">
                  Offline
                </Text>
              </View>
            ) : authState === "UNLOCKED" ? (
              <Pressable
                onPress={onSync}
                disabled={syncing}
                className={`px-4 py-2 rounded-full ${
                  syncing ? "bg-gray-300" : "bg-blue-600"
                }`}
              >
                <Text className="text-white text-sm font-medium">
                  {syncing ? "Syncing..." : "Sync"}
                </Text>
              </Pressable>
            ) : authState === "SESSION_EXPIRED" ? (
              <Pressable
                onPress={onLogin}
                className="px-4 py-2 rounded-full bg-orange-500"
              >
                <Text className="text-white text-sm font-medium">Login</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {!isOnline && (
          <View className="bg-red-100 border border-red-300 p-2 rounded mx-4 mt-2">
            <Text className="text-red-700 text-sm text-center">
              You are offline. Sync disabled.
            </Text>
          </View>
        )}
      </>
    );
  },
);
