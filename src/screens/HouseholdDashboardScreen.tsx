// src\screens\HouseholdDashboardScreen.tsx

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
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect } from "@react-navigation/native";
import { AppLogger } from "../utils/AppLogger";
import { Household } from "../domain/models/Household";
import { resolveHouseholdAggregateStatus } from "../utils/resolveHouseholdAggregateStatus";
import { AggregateSyncStatus } from "../models/AggregateSyncStatus";
import { getAllMunicipalities } from "../repositories/addressRepository";
import { getSurveyStatusForHousehold } from "../utils/getSurveyStatusForHousehold";

interface Props {
  householdRepo: HouseholdLocalRepository;
  createHouseholdUseCase: CreateHouseholdUseCase;
}

type HouseholdWithAggregate = {
  household: HouseholdLocal;
  aggregateStatus: AggregateSyncStatus;
  totalMembers: number;
  syncedMembers: number;

  headName?: string;
  headMobile?: string;
  surveyStatus?: "NONE" | "DRAFT" | "PENDING" | "SYNCED";
};

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
  const { logout } = useAuth();
  const { chwProfile, state, loading: authLoading, expireSession } = useAuth();

  const [households, setHouseholds] = useState<HouseholdWithAggregate[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [onlineHouseholds, setOnlineHouseholds] = useState<Household[]>([]);
  const [activeTab, setActiveTab] = useState<"LOCAL" | "ONLINE">("LOCAL");
  const [downloadedServerIds, setDownloadedServerIds] = useState<Set<string>>(
    new Set(),
  );
  const [municipalityMap, setMunicipalityMap] = useState<
    Record<string, string>
  >({});
  const [syncSteps, setSyncSteps] = useState<
    { step: string; status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" }[]
  >([]);

  const handleLogout = async () => {
    await logout();
    // router.replace("/login");
  };

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

  // Helper Function
  const buildAggregateHouseholds = React.useCallback(
    async (raw: HouseholdLocal[]): Promise<HouseholdWithAggregate[]> => {
      const sorted = sortHouseholds(raw);

      const enriched = await Promise.all(
        sorted.map(async (h) => {
          const members = await householdMemberLocalRepository.listByHousehold(
            h.localId,
          );

          // Find household head
          const head = members.find((m) => m.headHousehold === "Y");

          const headName = head
            ? [head.firstName, head.middleName, head.lastName]
                .filter(Boolean)
                .join(" ")
            : "Household head not added";

          const headMobile = head?.mobileNo ?? "No mobile";

          // const aggregateStatus = resolveHouseholdAggregateStatus(h, members);
          const baseStatus = resolveHouseholdAggregateStatus(h, members);

          // 🔥 NEW: get survey status
          const surveyStatus = await getSurveyStatusForHousehold(h.householdId);

          let aggregateStatus = baseStatus;

          // 🔒 SAFE merge (only adjust when needed)
          if (surveyStatus === "PENDING") {
            if (baseStatus === "FULLY_SYNCED") {
              aggregateStatus = "PARTIAL_PENDING";
            }
          }

          const totalMembers = members.length;

          const syncedMembers = members.filter(
            (m) => m.syncStatus === "SYNCED",
          ).length;

          return {
            household: h,
            aggregateStatus,
            totalMembers,
            syncedMembers,
            headName,
            headMobile,
            surveyStatus,
          };
        }),
      );

      return enriched;
    },
    [],
  );

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
        const enriched = await buildAggregateHouseholds(updated);
        setHouseholds(enriched);

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
    [buildAggregateHouseholds, chwProfile, householdRepo],
  );

  // -----------------------------
  // Initialize Dashboard
  // -----------------------------

  useEffect(() => {
    if (!chwProfile) return;

    const initialize = async () => {
      setLoading(true);

      try {
        // Load municipality lookup
        const municipalities = await getAllMunicipalities();

        const map: Record<string, string> = {};

        for (const m of municipalities) {
          map[m.id] = m.name_en;
        }

        setMunicipalityMap(map);

        //  STEP 1: Repair old broken rows FIRST
        await householdRepo.repairMissingIdOfChw(
          chwProfile.userName,
          chwProfile.idofCHW,
        );

        // 🔥 STEP 2: Now load corrected data
        const local = await householdRepo.listAllForCHW(chwProfile.userName);

        const enriched = await buildAggregateHouseholds(local);

        setHouseholds(enriched);

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

    setTimeout(() => {
      initialize();
    }, 0);
  }, [buildAggregateHouseholds, chwProfile, householdRepo]);

  // For Draft not showing immediately

  useFocusEffect(
    React.useCallback(() => {
      if (!chwProfile) return;

      const reload = async () => {
        const data = await householdRepo.listAllForCHW(chwProfile.userName);

        const enriched = await buildAggregateHouseholds(data);

        setHouseholds(enriched);
        const ids = new Set(
          data.filter((h) => h.householdId).map((h) => h.householdId as string),
        );

        setDownloadedServerIds(ids);
      };

      reload();
    }, [buildAggregateHouseholds, chwProfile, householdRepo]),
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

      const enriched = await buildAggregateHouseholds(updated);
      setHouseholds(enriched);

      const ids = new Set(
        updated
          .filter((h) => h.householdId)
          .map((h) => h.householdId as string),
      );

      setDownloadedServerIds(ids);
    },
    [householdRepo, chwProfile, buildAggregateHouseholds],
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
    ({ item }: { item: HouseholdWithAggregate | Household }) => {
      if (activeTab === "LOCAL") {
        const {
          household: local,
          aggregateStatus,
          totalMembers,
          syncedMembers,
          headName,
          headMobile,
          surveyStatus,
        } = item as HouseholdWithAggregate;
        if (!local.localId) return null;

        return (
          <Pressable
            onPress={() => handleEdit(local)}
            className={`bg-white mx-4 mt-3 p-4 rounded-xl shadow-sm ${
              aggregateStatus === "FAILED" ||
              aggregateStatus === "PARTIAL_FAILED"
                ? "border border-red-300"
                : aggregateStatus === "PENDING" ||
                    aggregateStatus === "PARTIAL_PENDING"
                  ? "border border-yellow-300"
                  : aggregateStatus === "DRAFT"
                    ? "border border-orange-300"
                    : ""
            }`}
          >
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="text-base font-semibold">
                  {headName || "Household Head"}
                </Text>

                <Text className="text-sm text-gray-600">
                  Mobile: {headMobile || "No mobile"}
                </Text>

                <Text className="text-sm text-gray-700 mt-1">
                  {municipalityMap[local.vdcnpCode] || "Municipality"} - Ward{" "}
                  {local.wardNo}
                </Text>

                {/* STATUS LABEL */}
                {aggregateStatus === "DRAFT" && (
                  <Text className="text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded mt-1">
                    Draft
                  </Text>
                )}

                {aggregateStatus === "PENDING" && (
                  <Text className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded mt-1">
                    Household Pending
                  </Text>
                )}

                {/* {aggregateStatus === "PARTIAL_PENDING" && (
                  <Text className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded mt-1">
                    Member Pending
                  </Text>
                )} */}
                {aggregateStatus === "PARTIAL_PENDING" && (
                  <Text className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded mt-1">
                    Member / Survey Pending
                  </Text>
                )}

                {aggregateStatus === "FAILED" && (
                  <Text className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded mt-1">
                    Household Failed
                  </Text>
                )}

                {aggregateStatus === "PARTIAL_FAILED" && (
                  <Text className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded mt-1">
                    Member Failed
                  </Text>
                )}

                {aggregateStatus === "FULLY_SYNCED" && (
                  <Text className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded mt-1">
                    Fully Synced
                  </Text>
                )}
              </View>

              {/* RIGHT SIDE: Badge + Menu */}
              <View className="items-end">
                <SyncBadge status={aggregateStatus} />
                {aggregateStatus === "FULLY_SYNCED" && (
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
              Address: {local.address || "Address not specified"}
            </Text>

            <Text className="text-xs text-gray-500 mt-1">
              Household ID: {local.householdId || "Not synced yet"}
            </Text>

            <View className="mt-1">
              {totalMembers === 0 ? (
                <Text className="text-gray-400 text-sm">No Members Added</Text>
              ) : (
                <>
                  <Text className="text-gray-500 text-sm">
                    {totalMembers} Members
                  </Text>

                  <Text
                    className={`text-xs mt-0.5 ${
                      syncedMembers === totalMembers
                        ? "text-green-600"
                        : syncedMembers === 0
                          ? "text-red-600"
                          : "text-yellow-600"
                    }`}
                  >
                    {syncedMembers} / {totalMembers} Members Synced
                  </Text>
                  {surveyStatus === "PENDING" && (
                    <Text className="text-yellow-600 text-xs mt-1">
                      Survey Pending
                    </Text>
                  )}
                </>
              )}
            </View>
          </Pressable>
        );
      }

      const online = item as Household;
      if (!online.householdId) return null;

      return (
        <View className="bg-white mx-4 mt-3 p-4 rounded-xl shadow-sm">
          <Text className="text-base font-semibold">
            Household ID: {online.householdId}
          </Text>

          <Text className="text-sm text-gray-700 mt-1">
            Ward: {online.wardNo}
          </Text>

          <Text className="text-gray-600 mt-2">
            Address: {online.address || "Address not specified"}
          </Text>

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
    [
      activeTab,
      downloadedServerIds,
      handleDownload,
      handleEdit,
      municipalityMap,
      showOptions,
    ],
  );

  // -----------------------------
  // Manual Sync
  // -----------------------------
  const handleManualSync = async () => {
    if (!chwProfile || syncing) return;

    try {
      setSyncing(true);

      //  Initialize steps BEFORE sync
      setSyncSteps([
        { step: "HOUSEHOLD", status: "PENDING" },
        { step: "MEMBER", status: "PENDING" },
        { step: "SURVEY", status: "PENDING" },
      ]);

      const result = await globalSyncUseCase.execute(chwProfile.userName);

      //  ADDING THIS GUARD
      if (!result || !result.steps) {
        console.log("❌ Sync returned invalid result:", result);

        Alert.alert(
          "Sync Error",
          "Unexpected sync response. Please try again.",
        );
        return;
      }

      //  Update step statuses AFTER sync
      if (result?.steps) {
        setSyncSteps((prev) =>
          prev.map((s) => {
            const found = result.steps.find((r) => r.step === s.step);

            if (!found) return s;

            return {
              ...s,
              status: found.status === "SUCCESS" ? "SUCCESS" : "FAILED",
            };
          }),
        );
      }

      console.log("✅ GLOBAL SYNC RESULT:", result);

      // Extract failures
      const failedSteps = result.steps.filter((s) => s.status === "FAILED");
      const successSteps = result.steps.filter((s) => s.status === "SUCCESS");

      // Reload updated local data
      const data = await householdRepo.listAllForCHW(chwProfile.userName);
      const enriched = await buildAggregateHouseholds(data);
      setHouseholds(enriched);

      // -----------------------------
      // Smart Alert Handling
      // -----------------------------
      // -----------------------------
      //  Smart Alert Handling (Improved)
      // -----------------------------
      if (failedSteps.length === 0) {
        Alert.alert(
          "Sync Complete",
          successSteps.length > 0
            ? successSteps
                .map((s) => {
                  if (s.step === "HOUSEHOLD") return "• Household synced";
                  if (s.step === "MEMBER") return "• Members synced";
                  if (s.step === "SURVEY") return "• Survey synced";
                  return `• ${s.step}`;
                })
                .join("\n")
            : "Nothing to sync",
        );
      } else if (successSteps.length === 0) {
        Alert.alert(
          "Sync Failed",
          failedSteps
            .map((s) => {
              if (s.step === "HOUSEHOLD")
                return `• Household failed: ${s.message || ""}`;
              if (s.step === "MEMBER")
                return `• Members failed: ${s.message || ""}`;
              if (s.step === "SURVEY")
                return `• Survey failed: ${s.message || ""}`;
              return `• ${s.step}: ${s.message || "Failed"}`;
            })
            .join("\n"),
        );
      } else {
        Alert.alert(
          "Partial Sync",
          `✅ Success:\n${successSteps
            .map((s) => {
              if (s.step === "HOUSEHOLD") return "• Household synced";
              if (s.step === "MEMBER") return "• Members synced";
              if (s.step === "SURVEY") return "• Survey synced";
              return `• ${s.step}`;
            })
            .join("\n")}\n\n❌ Failed:\n${failedSteps
            .map((s) => {
              if (s.step === "HOUSEHOLD")
                return `• Household failed: ${s.message || ""}`;
              if (s.step === "MEMBER")
                return `• Members failed: ${s.message || ""}`;
              if (s.step === "SURVEY")
                return `• Survey failed: ${s.message || ""}`;
              return `• ${s.step}: ${s.message || "Failed"}`;
            })
            .join("\n")}`,
        );
      }
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
        {/* Title + Logout Row */}
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-gray-900">Households</Text>

          <Pressable
            onPress={handleLogout}
            className="bg-red-100 px-3 py-1 rounded-md"
          >
            <Text className="text-red-600 text-sm font-medium">Logout</Text>
          </Pressable>
        </View>

        {/* Subtitle + Action Row */}
        <View className="flex-row justify-between items-center mt-4">
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
        <SummaryBar households={households.map((h) => h.household)} />
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

      {syncing && (
        <View className="mx-4 mt-3 bg-white p-3 rounded-lg shadow-sm">
          <Text className="font-semibold mb-2">Sync Progress</Text>

          {syncSteps.map((s) => (
            <View key={s.step} className="flex-row justify-between py-1">
              <Text>{s.step}</Text>

              <Text>
                {s.status === "PENDING" && "⏳"}
                {s.status === "SUCCESS" && "✅"}
                {s.status === "FAILED" && "❌"}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* LIST */}
      <FlatList<HouseholdWithAggregate | Household>
        data={currentData}
        keyExtractor={(item, index) => {
          if (activeTab === "LOCAL") {
            const local = (item as HouseholdWithAggregate).household;
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
