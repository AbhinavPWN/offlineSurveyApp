import React, { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import type { AuthState } from "../../../auth/model/AuthState";
import SupportLogButton from "../../../components/support/SupportLogButton";
interface HouseholdDashboardHeaderProps {
  isOnline: boolean;
  authState: AuthState;
  syncing: boolean;
  syncLabel: string;
  showSync: boolean;
  onLogout: () => void;
  onSync: () => void;
  onLogin: () => void;
}
export const HouseholdDashboardHeader = React.memo(
  function HouseholdDashboardHeader({
    isOnline,
    authState,
    syncing,
    syncLabel,
    showSync,
    onLogout,
    onSync,
    onLogin,
  }: HouseholdDashboardHeaderProps) {
    const [accountOpen, setAccountOpen] = useState(false);
    const expired = authState === "SESSION_EXPIRED";
    return (
      <View className="bg-white px-4 py-2">
        <View className="flex-row items-center justify-between gap-2">
          <Text
            className={`text-xs font-semibold ${!isOnline ? "text-gray-600" : expired ? "text-amber-700" : "text-green-700"}`}
          >
            {!isOnline ? "Offline" : expired ? "Sign in required" : "Online"}
          </Text>
          {showSync && (
            <Pressable
              accessibilityRole="button"
              disabled={!isOnline || syncing}
              onPress={expired ? onLogin : onSync}
              className={`rounded-lg px-3 py-3 ${!isOnline || syncing ? "bg-gray-300" : expired ? "bg-amber-600" : "bg-blue-700"}`}
            >
              <Text className="text-sm font-semibold text-white">
                {syncing ? (syncLabel.startsWith("Syncing") || syncLabel.includes("processed") ? syncLabel : "Syncing…") : expired ? "Sign in to sync" : syncLabel}
              </Text>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            onPress={() => setAccountOpen(true)}
            className="rounded-lg border border-gray-300 px-3 py-3"
          >
            <Text className="text-sm font-semibold text-gray-700">Account</Text>
          </Pressable>
        </View>
        <Modal
          transparent
          visible={accountOpen}
          animationType="fade"
          onRequestClose={() => setAccountOpen(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              padding: 24,
              backgroundColor: "rgba(0,0,0,.45)",
            }}
          >
            <View className="rounded-xl bg-white p-4">
              <Text className="mb-4 text-lg font-bold">
                Account and support
              </Text>
              <SupportLogButton textClassName="text-center text-white font-semibold" />
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setAccountOpen(false);
                  onLogout();
                }}
                className="mt-3 rounded-lg border border-red-300 p-3"
              >
                <Text className="text-center font-semibold text-red-700">
                  Sign out
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setAccountOpen(false)}
                className="mt-3 p-3"
              >
                <Text className="text-center font-semibold text-blue-700">
                  Close
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    );
  },
);
