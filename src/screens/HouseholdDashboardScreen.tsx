import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";

import { HouseholdLocal } from "../models/household.model";
import { HouseholdLocalRepository } from "../repositories/HouseholdLocalRepository";
import { CreateHouseholdUseCase } from "../usecases/household/CreateHouseholdUseCase";
import {
  householdApiService,
  globalSyncUseCase,
  downloadHouseholdWithMembersUseCase,
  householdMemberLocalRepository,
} from "../di/container";
import { useAuth } from "../auth/context/useAuth";
import { SummaryBar } from "../components/SummaryBar";
import { SyncBadge } from "../components/SyncBadge";
// import { NetworkServiceImpl } from "../utils/NetworkService";
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect } from "@react-navigation/native";
import { AppLogger } from "../utils/AppLogger";
import { Household } from "../domain/models/Household";

interface Props {
  householdRepo: HouseholdLocalRepository;
  createHouseholdUseCase: CreateHouseholdUseCase;
}

// const downloadUseCase = new DownloadHouseholdWithMembersUseCase(
//   householdRepo,
//   memberRepo, // you must pass this
//   memberApiService,
// );

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
  const [onlineHouseholds, setOnlineHouseholds] = useState<Household[]>([]);
  const [activeTab, setActiveTab] = useState<"LOCAL" | "ONLINE">("LOCAL");
  const [downloadedServerIds, setDownloadedServerIds] = useState<Set<string>>(
    new Set(),
  );

  // Check CONNECTIVITY
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(
        Boolean(state.isConnected && state.isInternetReachable !== false),
      );
    });

    return () => unsubscribe();
  }, []);

  // Fetch Online List separately
  const fetchOnlineHouseholds = async () => {
    if (!chwProfile) return;
    if (!isOnline) return;

    try {
      const response = await householdApiService.getHouseholdListing(
        chwProfile.userName,
      );

      setOnlineHouseholds(response);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        expireSession();
      }
    }
  };

  // Adding Download Method:

  const handleDownload = React.useCallback(
    async (h: Household) => {
      if (!chwProfile) return;

      try {
        await downloadHouseholdWithMembersUseCase.execute(
          h,
          chwProfile.userName,
          chwProfile.idofCHW,
        );

        const updated = await householdRepo.listAllForCHW(chwProfile.userName);

        setHouseholds(sortHouseholds(updated));

        setDownloadedServerIds((prev) => {
          const next = new Set(prev);
          next.add(h.householdId);
          return next;
        });

        alert("Household downloaded successfully.");

        // 👇 ADD THIS BLOCK
        const inserted = await householdRepo.getByHouseholdId(h.householdId);

        if (inserted) {
          const members = await householdMemberLocalRepository.listByHousehold(
            inserted.localId,
          );

          console.log("📦 Members in local DB:", members.length);
        }
      } catch (error: any) {
        if (error?.message === "ALREADY_DOWNLOADED") {
          alert("Already downloaded.");
          return;
        }

        alert("Download failed.");
      }
    },
    [chwProfile, householdRepo],
  );

  // -----------------------------
  // Initialize Dashboard
  // -----------------------------

  useEffect(() => {
    if (!chwProfile) return;

    const initialize = async () => {
      setLoading(true);

      try {
        // 🔥 STEP 1: Repair old broken rows FIRST
        await householdRepo.repairMissingIdOfChw(
          chwProfile.userName,
          chwProfile.idofCHW,
        );

        // 🔥 STEP 2: Now load corrected data
        const local = await householdRepo.listAllForCHW(chwProfile.userName);

        setHouseholds(sortHouseholds(local));

        // 🔥 STEP 3: Rebuild downloaded server id set
        const ids = new Set(
          local
            .filter((h) => h.householdId)
            .map((h) => h.householdId as string),
        );

        setDownloadedServerIds(ids);
      } catch (error) {
        console.error("Dashboard initialization failed", error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [chwProfile, householdRepo]);

  // For Draft not showing immediately

  useFocusEffect(
    React.useCallback(() => {
      if (!chwProfile) return;

      const reload = async () => {
        const data = await householdRepo.listAllForCHW(chwProfile.userName);

        setHouseholds(sortHouseholds(data));
        const ids = new Set(
          data.filter((h) => h.householdId).map((h) => h.householdId as string),
        );

        setDownloadedServerIds(ids);
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
  const handleEdit = React.useCallback(
    (household: HouseholdLocal) => {
      router.push({
        pathname: "/(app)/households/[householdId]",
        params: { householdId: household.localId },
      });
    },
    [router],
  );

  // Handler for deleting local list
  const handleRemoveLocal = React.useCallback(
    async (local: HouseholdLocal) => {
      await householdRepo.deleteLocal(local.localId);

      const updated = await householdRepo.listAllForCHW(chwProfile!.userName);

      setHouseholds(sortHouseholds(updated));

      const ids = new Set(
        updated
          .filter((h) => h.householdId)
          .map((h) => h.householdId as string),
      );

      setDownloadedServerIds(ids);
    },
    [householdRepo, chwProfile],
  );

  const showOptions = React.useCallback(
    (local: HouseholdLocal) => {
      Alert.alert("Household Options", "", [
        {
          text: "Remove local copy",
          style: "destructive",
          onPress: () => handleRemoveLocal(local),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]);
    },
    [handleRemoveLocal],
  );

  const currentData = React.useMemo(
    () => (activeTab === "LOCAL" ? households : onlineHouseholds),
    [activeTab, households, onlineHouseholds],
  );

  // Memoize renderItem
  const renderItem = React.useCallback(
    ({ item }: { item: HouseholdLocal | Household }) => {
      if (activeTab === "LOCAL") {
        const local = item as HouseholdLocal;
        if (!local.localId) return null;

        return (
          <Pressable
            onPress={() => handleEdit(local)}
            className={`bg-white mx-4 mt-3 p-4 rounded-xl shadow-sm ${
              local.syncStatus === "FAILED"
                ? "border border-red-300"
                : local.syncStatus === "PENDING"
                  ? "border border-yellow-300"
                  : local.syncStatus === "DRAFT"
                    ? "border border-orange-300"
                    : ""
            }`}
          >
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="text-base font-semibold">
                  Ward {local.wardNo || "Not set"}
                </Text>

                {/* STATUS LABEL */}
                {local.syncStatus === "DRAFT" && (
                  <Text className="text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded mt-1">
                    Draft
                  </Text>
                )}

                {local.syncStatus === "PENDING" && (
                  <Text className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded mt-1">
                    Pending Sync
                  </Text>
                )}

                {local.syncStatus === "FAILED" && (
                  <Text className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded mt-1">
                    Sync Failed
                  </Text>
                )}

                {local.syncStatus === "SYNCED" && (
                  <Text className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded mt-1">
                    Synced
                  </Text>
                )}
              </View>

              {/* RIGHT SIDE: Badge + Menu */}
              <View className="items-end">
                <SyncBadge status={local.syncStatus} />
                {local.syncStatus === "SYNCED" && (
                  <Pressable
                    onPress={() => showOptions(local)}
                    className="mt-2 px-2 py-1"
                  >
                    <Text style={{ fontSize: 18 }}>⋮</Text>
                  </Pressable>
                )}
              </View>
            </View>

            <Text className="text-gray-600 mt-2">
              {local.address || "Address not specified"}
            </Text>

            <Text className="text-gray-500 text-sm mt-1">
              {local.noofHHMembers} Members
            </Text>
          </Pressable>
        );
      }

      const online = item as Household;
      if (!online.householdId) return null;

      return (
        <View className="bg-white mx-4 mt-3 p-4 rounded-xl shadow-sm">
          <Text className="text-base font-semibold">Ward {online.wardNo}</Text>

          <Text className="text-gray-600 mt-2">{online.address}</Text>

          <Text className="text-gray-500 text-sm mt-1">
            {online.memberCount} Members
          </Text>

          {downloadedServerIds.has(online.householdId) ? (
            <Text className="text-green-600 mt-3 font-medium">
              Already Downloaded
            </Text>
          ) : (
            <Pressable
              onPress={() => handleDownload(online)}
              className="mt-3 bg-blue-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white text-center font-medium">
                Download
              </Text>
            </Pressable>
          )}
        </View>
      );
    },
    [activeTab, downloadedServerIds, handleDownload, handleEdit, showOptions],
  );

  // -----------------------------
  // Manual Sync
  // -----------------------------
  const handleManualSync = async () => {
    if (!chwProfile || syncing) return;

    try {
      setSyncing(true);

      await globalSyncUseCase.execute(chwProfile.userName);

      // Reload updated local data after sync
      const data = await householdRepo.listAllForCHW(chwProfile.userName);
      setHouseholds(sortHouseholds(data));

      Alert.alert("Success", "Sync completed successfully.");
    } catch (error: any) {
      if (error?.message === "SESSION_EXPIRED") {
        Alert.alert("Session expired", "Please login again.");
        return;
      }

      Alert.alert("Sync Failed", error?.message || "Unknown error");
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

      {/* TAB SWITCH UI */}
      <View className="flex-row mx-4 mt-4 bg-gray-200 rounded-lg overflow-hidden">
        <Pressable
          onPress={() => setActiveTab("LOCAL")}
          className={`flex-1 py-2 ${activeTab === "LOCAL" ? "bg-white" : ""}`}
        >
          <Text className="text-center font-medium">Downloaded</Text>
        </Pressable>

        <Pressable
          onPress={async () => {
            if (!isOnline) {
              alert(
                "You are offline. Connect to internet to view online households.",
              );
              return;
            }

            setActiveTab("ONLINE");
            await fetchOnlineHouseholds();
          }}
          className={`flex-1 py-2 ${activeTab === "ONLINE" ? "bg-white" : ""}`}
        >
          <Text className="text-center font-medium">Online</Text>
        </Pressable>
      </View>

      {/* LIST */}
      <FlatList<HouseholdLocal | Household>
        data={currentData}
        keyExtractor={(item, index) => {
          if (activeTab === "LOCAL") {
            const local = item as HouseholdLocal;
            return local.localId ?? `local-${index}`;
          }

          const online = item as Household;
          return online.householdId ?? `online-${index}`;
        }}
        contentContainerStyle={{
          paddingBottom: 120,
          paddingTop: currentData.length === 0 ? 80 : 12,
        }}
        ListEmptyComponent={
          activeTab === "ONLINE" && !isOnline ? (
            <View className="items-center px-6">
              <Text className="text-5xl mb-4">📡</Text>

              <Text className="text-lg font-semibold text-gray-700 mb-2">
                No Internet Connection
              </Text>

              <Text className="text-gray-500 text-center">
                Connect to the internet to view and download online households.
              </Text>
            </View>
          ) : (
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
          )
        }
        renderItem={renderItem}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />

      {/* FLOATING ADD BUTTON */}
      {activeTab === "LOCAL" && (
        <Pressable
          onPress={handleAddNew}
          className="absolute bottom-8 right-6 w-16 h-16 rounded-full bg-blue-600 shadow-lg items-center justify-center"
        >
          <Text className="text-white text-3xl font-light">+</Text>
        </Pressable>
      )}
    </View>
  );
};
