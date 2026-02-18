import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";

import { HouseholdLocal } from "../models/household.model";
import { HouseholdLocalRepository } from "../repositories/HouseholdLocalRepository";
import { CreateHouseholdUseCase } from "../usecases/household/CreateHouseholdUseCase";
import { DownloadHouseholdsUseCase } from "../usecases/household/DownloadHouseholdsUseCase";

import { householdApiService, syncHouseholdUseCase } from "../di/container";

import { useAuth } from "../auth/context/useAuth";
import { SummaryBar } from "../components/SummaryBar";
import { SyncBadge } from "../components/SyncBadge";
import { NetworkServiceImpl } from "../utils/NetworkService";
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect } from "@react-navigation/native";
import { AppLogger } from "../utils/AppLogger";

interface Props {
  householdRepo: HouseholdLocalRepository;
  createHouseholdUseCase: CreateHouseholdUseCase;
}

function sortHouseholds(data: HouseholdLocal[]) {
  const priorityMap: Record<string, number> = {
    FAILED: 1,
    DRAFT: 2,
    PENDING: 3,
    SYNCED: 4,
  };

  return [...data].sort((a, b) => {
    const p1 = priorityMap[a.syncStatus] ?? 5;
    const p2 = priorityMap[b.syncStatus] ?? 5;

    if (p1 !== p2) return p1 - p2;

    const timeA = Number(a.lastModifiedAt) || 0;
    const timeB = Number(b.lastModifiedAt) || 0;

    return timeB - timeA;
  });
}

export const HouseholdDashboardScreen: React.FC<Props> = ({
  householdRepo,
  createHouseholdUseCase,
}) => {
  const router = useRouter();
  const { chwProfile, state, loading: authLoading, expireSession } = useAuth();

  const [households, setHouseholds] = useState<HouseholdLocal[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Check CONNECTIVITY
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(
        Boolean(state.isConnected && state.isInternetReachable !== false),
      );
    });

    return () => unsubscribe();
  }, []);

  // -----------------------------
  // Initialize Dashboard
  // -----------------------------
  useEffect(() => {
    if (!chwProfile) return;

    const initialize = async () => {
      setLoading(true);

      try {
        // 1️⃣ ALWAYS load local first
        const local = await householdRepo.listAllForCHW(chwProfile.userName);

        try {
          setHouseholds(sortHouseholds(local));
        } catch (error) {
          console.error("Sorting failed", error);
          setHouseholds(local);
        }

        // 2️⃣ Then attempt background download (if online)
        const downloadUseCase = new DownloadHouseholdsUseCase(
          householdApiService,
          householdRepo,
          async () => chwProfile.userName,
        );

        try {
          await downloadUseCase.execute();

          // Reload after download
          const updated = await householdRepo.listAllForCHW(
            chwProfile.userName,
          );

          setHouseholds(sortHouseholds(updated));
        } catch (error: any) {
          if (error?.response?.status === 401) {
            console.log("Session expired during download");

            expireSession();
          }
        }
      } catch (error) {
        console.error("Dashboard initialization failed", error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [chwProfile, expireSession, householdRepo]);

  // For Draft not showing immediately

  useFocusEffect(
    React.useCallback(() => {
      if (!chwProfile) return;

      const reload = async () => {
        const data = await householdRepo.listAllForCHW(chwProfile.userName);

        setHouseholds(sortHouseholds(data));
      };

      reload();
    }, [chwProfile, householdRepo]),
  );

  // -----------------------------
  // Add New Household
  // -----------------------------
  const handleAddNew = async () => {
    if (!chwProfile) return;

    if (!chwProfile.idofCHW) {
      await AppLogger.log("ERROR", "CREATE_ABORT_NULL_IDOFCHW", {
        chwUsername: chwProfile.userName,
      });
      alert("System error. Please login again.");
      return;
    }

    // 1 Check if draft already exists
    // 1 Check if REAL draft (not submitted yet) exists
    // const drafts = await householdRepo.listBySyncStatus(
    //   chwProfile.userName,
    //   "DRAFT",
    // );

    // if (drafts.length > 0) {
    //   const existingDraft = drafts[0];

    //   router.push({
    //     pathname: "/(app)/households/[householdId]",
    //     params: { householdId: existingDraft.localId },
    //   });

    //   return;
    // }

    // 2. Otherwise create new draft
    const { localId } = await createHouseholdUseCase.execute({
      chwUsername: chwProfile.userName,
      idofCHW: chwProfile.idofCHW,
      provinceCode: chwProfile.provinceCode,
      districtCode: chwProfile.districtCode,
      vdcnpCode: chwProfile.vdcnpCode,
      wardNo: chwProfile.wardNo,
    });

    console.log("CHW PROFILE:", chwProfile);

    router.push({
      pathname: "/(app)/households/[householdId]",
      params: { householdId: localId },
    });
  };

  // -----------------------------
  // Edit Existing Household
  // -----------------------------
  const handleEdit = (household: HouseholdLocal) => {
    router.push({
      pathname: "/(app)/households/[householdId]",
      params: { householdId: household.localId },
    });
  };

  // -----------------------------
  // Manual Sync
  // -----------------------------
  const handleManualSync = async () => {
    if (!chwProfile || syncing) return;

    const networkService = new NetworkServiceImpl();
    const isOnline = await networkService.isOnline();

    if (!isOnline) {
      alert("You are offline. Cannot sync.");
      return;
    }

    try {
      setSyncing(true);
      await syncHouseholdUseCase.execute(chwProfile.userName);

      const data = await householdRepo.listAllForCHW(chwProfile.userName);

      setHouseholds(sortHouseholds(data));
    } catch (error: any) {
      if (error?.message === "SESSION_EXPIRED") {
        alert("Session expired. Please login again.");
        return;
      }

      console.log("Sync error:", error?.message);
    } finally {
      setSyncing(false);
    }
  };

  // -----------------------------
  // Loading States
  // -----------------------------
  if (authLoading || !chwProfile) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Preparing your workspace...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Loading households…</Text>
      </View>
    );
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <View className="flex-1 bg-gray-50">
      {/* HEADER */}
      <View className="px-4 pt-6 pb-4 bg-white shadow-sm">
        {/* Title Row */}
        <Text className="text-2xl font-bold text-gray-900">Households</Text>

        {/* Subtitle + Action Row */}
        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-sm text-gray-500 flex-1 pr-2">
            Manage and update households in your assigned ward
          </Text>

          {!isOnline ? (
            <View className="px-3 py-1 rounded-full bg-gray-200">
              <Text className="text-gray-600 text-xs font-medium">Offline</Text>
            </View>
          ) : state === "UNLOCKED" ? (
            <Pressable
              onPress={handleManualSync}
              disabled={syncing}
              className={`px-4 py-2 rounded-full ${
                syncing ? "bg-gray-300" : "bg-blue-600"
              }`}
            >
              <Text className="text-white text-sm font-medium">
                {syncing ? "Syncing..." : "Sync"}
              </Text>
            </Pressable>
          ) : state === "SESSION_EXPIRED" ? (
            <Pressable
              onPress={() => router.replace("/login")}
              className="px-4 py-2 rounded-full bg-orange-500"
            >
              <Text className="text-white text-sm font-medium">Login</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* OFFLINE indicator  */}

      {!isOnline && (
        <View className="bg-red-100 border border-red-300 p-2 rounded mx-4 mt-2">
          <Text className="text-red-700 text-sm text-center">
            You are offline. Sync disabled.
          </Text>
        </View>
      )}

      {/* SUMMARY */}
      <View className="px-4 mt-4">
        <SummaryBar households={households} />
      </View>

      {/* LIST */}
      <FlatList
        data={households}
        keyExtractor={(item) =>
          item.localId?.toString() ?? Math.random().toString()
        }
        contentContainerStyle={{
          paddingBottom: 120,
          paddingTop: households.length === 0 ? 80 : 12,
        }}
        ListEmptyComponent={
          <View className="items-center px-6">
            <Text className="text-5xl mb-4">🏠</Text>

            <Text className="text-lg font-semibold text-gray-700 mb-2">
              No households yet
            </Text>

            <Text className="text-gray-500 text-center">
              Tap the + button below to create your first household listing.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleEdit(item)}
            className={`bg-white mx-4 mt-3 p-4 rounded-xl shadow-sm ${
              item.syncStatus === "FAILED"
                ? "border border-red-200"
                : item.syncStatus === "PENDING"
                  ? "border border-yellow-200"
                  : ""
            }`}
          >
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="text-base font-semibold text-gray-900">
                  {item.wardNo ? `Ward ${item.wardNo}` : "Ward not set"}
                </Text>

                {/* Lifecycle Labels */}

                {!item.householdId && (
                  <Text className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded mt-1">
                    Local Draft
                  </Text>
                )}

                {item.householdId && item.syncStatus === "SYNCED" && (
                  <Text className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded mt-1">
                    Synced From Server
                  </Text>
                )}

                {item.householdId && item.syncStatus === "PENDING" && (
                  <Text className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded mt-1">
                    Modified Locally
                  </Text>
                )}

                {item.syncStatus === "FAILED" && (
                  <Text className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded mt-1">
                    Sync Failed
                  </Text>
                )}
              </View>

              <SyncBadge status={item.syncStatus} />
            </View>

            <Text className="text-gray-700 mt-2">
              {item.address || "Address not specified"}
            </Text>

            <Text className="text-gray-500 text-sm mt-1">
              {item.noofHHMembers} Members
            </Text>

            <Text className="text-gray-400 text-xs mt-1">
              Updated {new Date(item.lastModifiedAt).toLocaleString()}
            </Text>
          </Pressable>
        )}
      />

      {/* FLOATING ADD BUTTON */}
      <Pressable
        onPress={handleAddNew}
        className="absolute bottom-8 right-6 w-16 h-16 rounded-full bg-blue-600 shadow-lg items-center justify-center"
      >
        <Text className="text-white text-3xl font-light">+</Text>
      </Pressable>
    </View>
  );
};
