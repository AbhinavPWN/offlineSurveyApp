// src\screens\HouseholdDashboardScreen.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  Keyboard,
} from "react-native";
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
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect } from "@react-navigation/native";
import { AppLogger } from "../utils/AppLogger";
import { Household } from "../domain/models/Household";
import { resolveHouseholdAggregateStatus } from "../utils/resolveHouseholdAggregateStatus";
import { getAllMunicipalities } from "../repositories/addressRepository";
// import { getSurveyStatusForHousehold } from "../utils/getSurveyStatusForHousehold";
import { getSurveyStatusForMember } from "../utils/getSurveyStatusForMember";
import {
  buildGlobalSyncAlert,
  mapSyncStepStatusForUI,
} from "@/src/usecases/sync/buildGlobalSyncAlert";
import { CommunityTab } from "../features/community/components/CommunityTab";
import {
  HouseholdDashboardTab,
  HouseholdDashboardTabs,
} from "../features/household-dashboard/components/HouseholdDashboardTabs";
import { HouseholdDashboardListItem } from "../features/household-dashboard/components/HouseholdDashboardListItem";
import { HouseholdDashboardListControls } from "../features/household-dashboard/components/HouseholdDashboardListControls";
import { HouseholdDashboardHeader } from "../features/household-dashboard/components/HouseholdDashboardHeader";
import { HouseholdDashboardEmptyState } from "../features/household-dashboard/components/HouseholdDashboardEmptyState";
import {
  countSurveyStatuses,
  type HouseholdWithAggregate,
  isPregnantMember,
  matchesSearchTerms,
  normalizeSearchValue,
  sortHouseholds,
} from "../features/household-dashboard/utils/householdDashboardUtils";

interface Props {
  householdRepo: HouseholdLocalRepository;
  createHouseholdUseCase: CreateHouseholdUseCase;
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
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [onlineSearchQuery, setOnlineSearchQuery] = useState("");
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [onlineError, setOnlineError] = useState<string | null>(null);
  // const [activeTab, setActiveTab] = useState<"LOCAL" | "ONLINE">("LOCAL");
  const [activeTab, setActiveTab] = useState<HouseholdDashboardTab>("LOCAL");
  const [downloadedServerIds, setDownloadedServerIds] = useState<Set<string>>(
    new Set(),
  );
  const [municipalityMap, setMunicipalityMap] = useState<
    Record<string, string>
  >({});
  const [syncSteps, setSyncSteps] = useState<
    { step: string; status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" }[]
  >([]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () =>
      setIsKeyboardVisible(true),
    );

    const hideSubscription = Keyboard.addListener("keyboardDidHide", () =>
      setIsKeyboardVisible(false),
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Logging out will remove offline access on this device. You will need internet to login again.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            const netState = await NetInfo.fetch();

            const hasConfirmedInternet =
              netState.isConnected === true &&
              netState.isInternetReachable === true;

            if (!hasConfirmedInternet) {
              Alert.alert(
                "Offline Logout Disabled",
                "You are currently offline. To protect field work, logout is disabled while offline. Please continue using the app and unlock with your PIN when needed.",
              );
              return;
            }

            Alert.alert(
              "Confirm Logout",
              "Are you sure you want to logout? You will need internet to login again.",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Yes, Logout",
                  style: "destructive",
                  onPress: async () => {
                    await logout();
                    // router.replace("/login");
                  },
                },
              ],
            );
          },
        },
      ],
    );
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
    if (!chwProfile || !isOnline || onlineLoading) {
      return;
    }

    try {
      setOnlineLoading(true);
      setOnlineError(null);

      console.log("ONLINE HOUSEHOLD REQUEST", {
        userName: chwProfile.userName,
      });

      const response = await householdApiService.getHouseholdListing(
        chwProfile.userName,
      );

      console.log("ONLINE HOUSEHOLD SUCCESS", {
        count: response.length,
        firstHousehold: response[0] ?? null,
      });

      setOnlineHouseholds(response);
    } catch (error: any) {
      console.error("ONLINE HOUSEHOLD FAILED", {
        code: error?.code,
        message: error?.message,
        status: error?.response?.status,
        response: error?.response?.data,
      });

      if (error?.response?.status === 401) {
        expireSession();
        return;
      }

      const isTimeout =
        error?.code === "ECONNABORTED" ||
        error?.code === "ETIMEDOUT" ||
        String(error?.message ?? "")
          .toLowerCase()
          .includes("timeout");

      const message = isTimeout
        ? "The server took too long to return the household list. Please try again."
        : error?.response?.data?.response_message ||
          error?.message ||
          "Unable to load online households.";

      setOnlineError(message);

      Alert.alert("Unable to load households", message);
    } finally {
      setOnlineLoading(false);
    }
  };

  const handleSelectTab = async (
    selectedTab: HouseholdDashboardTab,
  ): Promise<void> => {
    if (selectedTab !== "ONLINE") {
      setActiveTab(selectedTab);
      return;
    }

    if (!isOnline) {
      Alert.alert(
        "No Internet Connection",
        "Connect to the internet to view online households.",
      );
      return;
    }

    setActiveTab("ONLINE");

    if (onlineHouseholds.length === 0) {
      await fetchOnlineHouseholds();
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

          const memberSearchNames = members
            .map((member) =>
              [member.firstName, member.middleName, member.lastName]
                .filter(Boolean)
                .join(" "),
            )
            .filter((name) => name.length > 0);

          // const aggregateStatus = resolveHouseholdAggregateStatus(h, members);
          const baseStatus = resolveHouseholdAggregateStatus(h, members);

          let aggregateStatus = baseStatus;

          const totalMembers = members.length;

          const pregnantWomenCount = members.filter((member) =>
            isPregnantMember(member.pregnancyStatus),
          ).length;

          const syncedMembers = members.filter(
            (m) => m.syncStatus === "SYNCED",
          ).length;

          const pendingMembers = members.filter(
            (m) => m.syncStatus === "PENDING",
          ).length;

          const failedMembers = members.filter(
            (m) => m.syncStatus === "FAILED",
          ).length;

          const draftMembers = members.filter(
            (m) => m.syncStatus === "DRAFT",
          ).length;

          // const surveyMemberStatuses = await Promise.all(
          //   members.map((member) => getSurveyStatusForMember(member.localId)),
          // );
          const surveyMemberStatuses = await Promise.all(
            members.map((member) =>
              getSurveyStatusForMember(member.clientNo || member.localId),
            ),
          );

          const surveyCounts = countSurveyStatuses(surveyMemberStatuses);

          const hasSurveyReadyToSync = surveyCounts.readyToSync > 0;

          //  SAFE merge: survey can make a fully synced household become "needs sync"
          if (hasSurveyReadyToSync && baseStatus === "FULLY_SYNCED") {
            aggregateStatus = "PARTIAL_PENDING";
          }

          return {
            household: h,
            aggregateStatus,
            totalMembers,
            syncedMembers,
            pendingMembers,
            failedMembers,
            draftMembers,
            surveyCounts,
            headName,
            headMobile,
            memberSearchNames,
            pregnantWomenCount,
            // surveyStatus,
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

  // const currentData = React.useMemo(
  //   () => (activeTab === "LOCAL" ? households : onlineHouseholds),
  //   [activeTab, households, onlineHouseholds],
  // );
  // Search mechanism
  const normalizedLocalSearchQuery = React.useMemo(
    () => normalizeSearchValue(localSearchQuery),
    [localSearchQuery],
  );

  const filteredLocalHouseholds = React.useMemo(() => {
    if (!normalizedLocalSearchQuery) {
      return households;
    }

    const compactIdQuery = normalizedLocalSearchQuery.replace(/[\s-]+/g, "");

    return households.filter((item) => {
      const householdId = normalizeSearchValue(item.household.householdId);
      const compactHouseholdId = householdId.replace(/[\s-]+/g, "");

      return (
        matchesSearchTerms(item.headName, normalizedLocalSearchQuery) ||
        item.memberSearchNames.some((name) =>
          matchesSearchTerms(name, normalizedLocalSearchQuery),
        ) ||
        householdId.includes(normalizedLocalSearchQuery) ||
        (compactIdQuery.length > 0 &&
          compactHouseholdId.includes(compactIdQuery))
      );
    });
  }, [households, normalizedLocalSearchQuery]);

  const normalizedOnlineSearchQuery = React.useMemo(
    () => normalizeSearchValue(onlineSearchQuery),
    [onlineSearchQuery],
  );

  const filteredOnlineHouseholds = React.useMemo(() => {
    if (!normalizedOnlineSearchQuery) {
      return onlineHouseholds;
    }

    const compactIdQuery = normalizedOnlineSearchQuery.replace(/[\s-]+/g, "");

    return onlineHouseholds.filter((household) => {
      const householdId = normalizeSearchValue(household.householdId);
      const compactHouseholdId = householdId.replace(/[\s-]+/g, "");

      return (
        matchesSearchTerms(
          household.householdHeadName,
          normalizedOnlineSearchQuery,
        ) ||
        householdId.includes(normalizedOnlineSearchQuery) ||
        (compactIdQuery.length > 0 &&
          compactHouseholdId.includes(compactIdQuery))
      );
    });
  }, [normalizedOnlineSearchQuery, onlineHouseholds]);

  // const currentData = React.useMemo(
  //   () =>
  //     activeTab === "LOCAL"
  //       ? filteredLocalHouseholds
  //       : filteredOnlineHouseholds,
  //   [activeTab, filteredLocalHouseholds, filteredOnlineHouseholds],
  // );
  const currentData = React.useMemo<
    (HouseholdWithAggregate | Household)[]
  >(() => {
    if (activeTab === "LOCAL") {
      return filteredLocalHouseholds;
    }

    if (activeTab === "ONLINE") {
      return filteredOnlineHouseholds;
    }

    return [];
  }, [activeTab, filteredLocalHouseholds, filteredOnlineHouseholds]);

  // Memoize renderItem
  const renderItem = React.useCallback(
    ({ item }: { item: HouseholdWithAggregate | Household }) => (
      <HouseholdDashboardListItem
        item={item}
        activeTab={activeTab}
        downloadedServerIds={downloadedServerIds}
        municipalityMap={municipalityMap}
        onEdit={handleEdit}
        onShowOptions={showOptions}
        onDownload={handleDownload}
      />
    ),
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

      setSyncSteps([
        { step: "HOUSEHOLD", status: "PENDING" },
        { step: "MEMBER", status: "PENDING" },
        { step: "SURVEY", status: "PENDING" },
      ]);

      const result = await globalSyncUseCase.execute(chwProfile.userName);

      if (!result || !result.steps) {
        console.log("❌ Sync returned invalid result:", result);

        Alert.alert(
          "Sync Error",
          "Unexpected sync response. Please try again.",
        );
        return;
      }

      console.log("✅ GLOBAL SYNC RESULT:", JSON.stringify(result, null, 2));

      setSyncSteps((prev) =>
        prev.map((s) => {
          const found = result.steps.find((r) => r.step === s.step);

          if (!found) return s;

          return {
            ...s,
            status: mapSyncStepStatusForUI(found.status),
          };
        }),
      );

      const data = await householdRepo.listAllForCHW(chwProfile.userName);
      const enriched = await buildAggregateHouseholds(data);
      setHouseholds(enriched);

      const alertContent = buildGlobalSyncAlert(result);

      Alert.alert(alertContent.title, alertContent.message);
    } catch (error: any) {
      if (error?.message === "SESSION_EXPIRED") {
        Alert.alert("Session expired", "Please login again.");
        return;
      }

      Alert.alert(
        "Sync Needs Attention",
        error?.message ||
          "Something went wrong while syncing. Please try again.",
      );
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
      {!isKeyboardVisible && (
        <HouseholdDashboardHeader
          isOnline={isOnline}
          authState={state}
          syncing={syncing}
          onLogout={handleLogout}
          onSync={handleManualSync}
          onLogin={() => router.replace("/login")}
        />
      )}

      {/* SUMMARY */}
      {/* DOWNLOADED HOUSEHOLD SYNC SUMMARY */}
      {!isKeyboardVisible && activeTab === "LOCAL" && (
        <View className="px-4 mt-4">
          <SummaryBar households={households.map((h) => h.household)} />
        </View>
      )}

      {/* TAB SWITCH UI */}
      {/* <View className="flex-row mx-4 mt-4 bg-gray-200 rounded-lg overflow-hidden">
        <Pressable
          onPress={() => setActiveTab("LOCAL")}
          className={`flex-1 py-2 ${activeTab === "LOCAL" ? "bg-white" : ""}`}
        >
          <Text className="text-center font-medium">Downloaded</Text>
        </Pressable> */}

      {/* Online */}
      {/* <Pressable
          disabled={onlineLoading}
          onPress={async () => {
            if (!isOnline) {
              Alert.alert(
                "No Internet Connection",
                "Connect to the internet to view online households.",
              );
              return;
            }

            setActiveTab("ONLINE");

            if (onlineHouseholds.length === 0) {
              await fetchOnlineHouseholds();
            }
          }}
          className={`flex-1 py-2 ${
            activeTab === "ONLINE" ? "bg-white" : ""
          } ${onlineLoading ? "opacity-60" : ""}`}
        >
          <Text className="text-center font-medium">
            {onlineLoading ? "Loading..." : "Online"}
          </Text>
        </Pressable>
      </View> */}
      {/* DASHBOARD TABS */}
      <HouseholdDashboardTabs
        activeTab={activeTab}
        onlineLoading={onlineLoading}
        onSelect={handleSelectTab}
      />

      {activeTab === "COMMUNITY" && (
        <CommunityTab
          key={JSON.stringify([chwProfile.userName, chwProfile.idofCHW])}
          empId={chwProfile.userName}
          supervisorId={chwProfile.idofCHW}
          isOnline={isOnline}
        />
      )}

      <HouseholdDashboardListControls
        activeTab={activeTab}
        isOnline={isOnline}
        onlineLoading={onlineLoading}
        localSearchQuery={localSearchQuery}
        normalizedLocalSearchQuery={normalizedLocalSearchQuery}
        downloadedCount={households.length}
        filteredDownloadedCount={filteredLocalHouseholds.length}
        onLocalSearchChange={setLocalSearchQuery}
        onlineSearchQuery={onlineSearchQuery}
        normalizedOnlineSearchQuery={normalizedOnlineSearchQuery}
        onlineCount={onlineHouseholds.length}
        filteredOnlineCount={filteredOnlineHouseholds.length}
        onOnlineSearchChange={setOnlineSearchQuery}
        onRefreshOnline={fetchOnlineHouseholds}
      />

      {activeTab !== "COMMUNITY" && syncing && !isKeyboardVisible && (
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
      {/* HOUSEHOLD LIST */}
      {activeTab !== "COMMUNITY" && (
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
            paddingBottom: isKeyboardVisible ? 24 : 120,
            paddingTop: currentData.length === 0 ? 80 : 12,
          }}
          ListEmptyComponent={
            <HouseholdDashboardEmptyState
              activeTab={activeTab}
              isOnline={isOnline}
              onlineLoading={onlineLoading}
              onlineError={onlineError}
              normalizedOnlineSearchQuery={normalizedOnlineSearchQuery}
              onlineCount={onlineHouseholds.length}
              normalizedLocalSearchQuery={normalizedLocalSearchQuery}
              downloadedCount={households.length}
              onRetryOnline={fetchOnlineHouseholds}
              onClearOnlineSearch={() => setOnlineSearchQuery("")}
              onClearLocalSearch={() => setLocalSearchQuery("")}
            />
          }
          renderItem={renderItem}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* FLOATING ADD BUTTON */}
      {activeTab === "LOCAL" && !isKeyboardVisible && (
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
