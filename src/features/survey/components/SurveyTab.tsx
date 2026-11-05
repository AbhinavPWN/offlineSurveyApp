import { useFocusEffect } from "@react-navigation/native";
import {
  SurveyStatusRepository,
  type HouseholdSurveySummary,
  type PendingSurveyDisplay,
} from "@/src/repositories/SurveyStatusRepository";
import { useOnlineSession } from "@/src/auth/context/useOnlineSession";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { isAxiosError } from "axios";
import type { Household } from "@/src/domain/models/Household";
import {
  surveyListingCacheRepository,
  householdApiService,
  householdLocalRepository,
  downloadHouseholdWithMembersUseCase,
} from "@/src/di/container";

const surveyStatusRepository = new SurveyStatusRepository();

export function SurveyTab({
  username,
  chwId,
  isOnline,
  active,
  syncRevision,
}: {
  username: string;
  chwId: string;
  isOnline: boolean;
  active: boolean;
  syncRevision: boolean;
}) {
  const router = useRouter();
  const { valid, requireLogin } = useOnlineSession();
  const [day, setDay] = useState(0);
  const [dayPickerOpen, setDayPickerOpen] = useState(false);
  const [rows, setRows] = useState<Household[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [opening, setOpening] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const request = useRef(0);
  const openingLock = useRef(false);
  const mounted = useRef(true);
  const activeTab = useRef(active);
  activeTab.current = active;
  useEffect(() => {
    if (!active) setDayPickerOpen(false);
  }, [active]);
  useEffect(() => {
    const activeRequest = request;
    mounted.current = true;
    return () => {
      mounted.current = false;
      activeRequest.current++;
    };
  }, []);

  const [summaries, setSummaries] = useState<
    Record<string, HouseholdSurveySummary>
  >({});
  const [pending, setPending] = useState<PendingSurveyDisplay[]>([]);
  const [showPending, setShowPending] = useState(false);
  const [statusError, setStatusError] = useState(false);
  useFocusEffect(
    React.useCallback(() => {
      if (!active || syncRevision) return;
      let current = true;
      void Promise.all([
        surveyStatusRepository.summaries(username),
        surveyStatusRepository.pending(username),
      ])
        .then(([stats, waiting]) => {
          if (current) {
            setSummaries(
              Object.fromEntries(stats.map((item) => [item.householdId, item])),
            );
            setPending(waiting);
            setStatusError(false);
          }
        })
        .catch(() => {
          if (current) setStatusError(true);
        });
      return () => {
        current = false;
      };
    }, [active, syncRevision, username]),
  );

  function chooseDay(value: number) {
    request.current++;
    setDay(value);
    setRows([]);
    setLoaded(false);
    setError("");
    setNotice("");
    setQuery("");
    setLoading(false);
  }

  async function load() {
    if (!day || loading) return;
    if (isOnline && !requireLogin()) return;
    const ticket = ++request.current;
    setLoading(true);
    setError("");
    setNotice("");
    setRows([]);
    setLoaded(false);
    try {
      if (isOnline) {
        const households = await householdApiService.getHouseholdVisitListing({
          day,
          chwUsername: username,
        });
        if (ticket !== request.current) return;
        setRows(households);
        setLoaded(true);
        try {
          await surveyListingCacheRepository.save(username, day, households);
        } catch {
          if (ticket === request.current)
            setNotice(
              "Households loaded, but this list could not be saved for offline use.",
            );
        }
      } else {
        const cache = await surveyListingCacheRepository.get(username, day);
        if (ticket !== request.current) return;
        if (!cache)
          throw new Error(
            "Connect to the internet and load this day once before using it offline.",
          );
        setRows(cache.households);
        setLoaded(true);
        setNotice(
          `Offline list • saved ${new Date(cache.updatedAt).toLocaleString()}. Members must already be downloaded.`,
        );
      }
    } catch (err) {
      // Wi-Fi can remain connected while internet access disappears.
      // Only transport failures may fall back to cache; never hide HTTP errors.
      if (isAxiosError(err) && !err.response) {
        try {
          const cache = await surveyListingCacheRepository.get(username, day);
          if (ticket !== request.current) return;
          if (cache) {
            setRows(cache.households);
            setLoaded(true);
            setNotice(
              `Connection unavailable • showing list saved ${new Date(cache.updatedAt).toLocaleString()}. Members must already be downloaded.`,
            );
            return;
          }
        } catch {
          // Keep the original request error visible if the cache is unavailable.
        }
      }
      if (ticket === request.current)
        setError(
          isAxiosError(err) && err.response?.status === 401
            ? "Your login has expired. Sign in again to load households."
            : err instanceof Error
              ? err.message
              : "Could not load households. Please try again.",
        );
    } finally {
      if (ticket === request.current) setLoading(false);
    }
  }

  async function open(household: Household) {
    if (openingLock.current) return;
    openingLock.current = true;
    setOpening(household.householdId);
    try {
      let local = await householdLocalRepository.getByHouseholdId(
        household.householdId,
      );
      if (local && local.chwUsername !== username)
        throw new Error(
          "This household is stored under another account. Please contact support.",
        );
      if (!local) {
        if (isOnline && !requireLogin()) return;
        if (!isOnline)
          throw new Error(
            "This household's members are not downloaded. Connect to the internet to open it first.",
          );
        await downloadHouseholdWithMembersUseCase.execute(
          household,
          username,
          chwId,
        );
        local = await householdLocalRepository.getByHouseholdId(
          household.householdId,
        );
      }
      if (!local)
        throw new Error("Could not open this household. Please try again.");
      if (!mounted.current || !activeTab.current) return;
      router.push({
        pathname: "/households/[householdId]/members",
        params: { householdId: local.localId, mode: "survey" },
      });
    } catch (err) {
      if (mounted.current && activeTab.current)
        Alert.alert(
          "Unable to open household",
          err instanceof Error ? err.message : "Please try again.",
        );
    } finally {
      openingLock.current = false;
      if (mounted.current) setOpening(null);
    }
  }

  const search = query.trim().toLowerCase();
  const filtered = rows.filter((row) =>
    [row.householdHeadName, row.householdId, row.address].some((value) =>
      value?.toLowerCase().includes(search),
    ),
  );
  return (
    <View className="flex-1 px-4 pt-4">
      <Text className="text-xl font-bold text-gray-900">Household surveys</Text>
      {!valid && (
        <Pressable
          onPress={requireLogin}
          accessibilityRole="button"
          className="mt-2 rounded-lg bg-amber-50 p-2"
        >
          <Text className="text-amber-800">
            Sign in to load or sync. Saved answers remain available. Tap to sign
            in.
          </Text>
        </Pressable>
      )}
      <View className="mt-3 flex-row items-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose household day"
          disabled={!!opening}
          onPress={() => setDayPickerOpen(true)}
          className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-3"
        >
          <Text className="font-semibold text-gray-900">
            {day ? `Day ${day} ▾` : "Choose day ▾"}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!day || loading || !!opening}
          onPress={() => void load()}
          className={`rounded-xl px-4 py-3 ${!day || loading || opening ? "bg-gray-300" : "bg-blue-700"}`}
        >
          <Text className="font-semibold text-white">
            {loading ? "Loading…" : "Show households"}
          </Text>
        </Pressable>
      </View>
      <Modal
        visible={dayPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDayPickerOpen(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.45)",
            padding: 24,
          }}
        >
          <View
            className="rounded-2xl bg-white p-4"
            style={{ maxHeight: "85%" }}
          >
            <Text className="mb-3 text-lg font-bold text-gray-900">
              Choose household day
            </Text>
            <FlatList
              data={Array.from({ length: 32 }, (_, i) => i + 1)}
              numColumns={4}
              keyExtractor={(item) => String(item)}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Day ${item}`}
                  accessibilityState={{ selected: day === item }}
                  onPress={() => {
                    chooseDay(item);
                    setDayPickerOpen(false);
                  }}
                  style={{
                    flex: 1,
                    minHeight: 48,
                    margin: 3,
                    justifyContent: "center",
                    borderRadius: 8,
                    backgroundColor: day === item ? "#1d4ed8" : "#f3f4f6",
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      fontWeight: "600",
                      color: day === item ? "white" : "#111827",
                    }}
                  >
                    {item}
                  </Text>
                </Pressable>
              )}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => setDayPickerOpen(false)}
              className="mt-3 py-3"
            >
              <Text className="text-center font-semibold text-blue-700">
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {loading && <ActivityIndicator className="mt-3" />}
      {!!error && (
        <Text accessibilityRole="alert" className="mt-3 text-red-700">
          {error}
        </Text>
      )}
      {!!notice && <Text className="mt-3 text-sm text-gray-600">{notice}</Text>}
      {loaded && (
        <>
          <Text className="mt-4 font-semibold text-gray-800">
            Day {day} • {rows.length} households
          </Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search head name, household ID or address"
            accessibilityLabel="Search survey households"
            autoCorrect={false}
            className="mt-2 rounded-xl border border-gray-300 bg-white px-3 py-3"
          />
        </>
      )}
      <Pressable
        accessibilityRole="button"
        onPress={() => setShowPending((value) => !value)}
        className="mt-3 rounded-lg bg-amber-50 p-3"
      >
        <Text className="font-semibold text-amber-900">
          {showPending
            ? "Back to day households"
            : `Pending sync · ${pending.length} ${pending.length === 1 ? "survey" : "surveys"} (all days)`}
        </Text>
      </Pressable>
      {statusError && (
        <Text className="mt-2 text-red-700">
          Survey status could not be refreshed. Reopen this tab to try again.
        </Text>
      )}
      {showPending ? (
        <FlatList
          data={pending}
          keyExtractor={(item) => item.surveyId}
          contentContainerStyle={{ paddingBottom: 32 }}
          ListEmptyComponent={
            <Text className="py-5 text-center text-gray-600">
              No completed surveys are waiting to sync.
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              disabled={syncRevision}
              className="mt-3 rounded-xl border border-gray-200 bg-white p-4"
              onPress={() =>
                router.push({
                  pathname: "/households/[householdId]/members",
                  params: {
                    householdId: item.householdLocalId,
                    mode: "survey",
                  },
                })
              }
            >
              <Text className="font-semibold text-gray-900">
                {item.memberName}
              </Text>
              <Text className="mt-1 text-sm text-gray-600">
                Household: {item.householdId}
              </Text>
              <Text
                className={`mt-2 font-semibold ${item.review ? "text-red-700" : "text-amber-700"}`}
              >
                {item.review
                  ? "Submission needs checking — contact support"
                  : "Saved on phone · waiting to sync"}
              </Text>
            </Pressable>
          )}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.householdId}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 32 }}
          ListEmptyComponent={
            loaded ? (
              <Text className="py-6 text-center text-gray-600">
                {rows.length
                  ? "No matching households."
                  : "No households found for this day."}
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              disabled={!!opening}
              onPress={() => void open(item)}
              className="mt-3 rounded-xl border border-gray-200 bg-white p-4"
            >
              <Text className="text-base font-semibold text-gray-900">
                {item.householdHeadName || "Household"}
              </Text>
              <Text className="mt-1 text-sm text-gray-600">
                {item.householdId}
              </Text>
              <Text className="mt-1 text-sm text-gray-600">
                {item.address} • {item.memberCount} members
              </Text>
              {summaries[item.householdId] && (
                <View className="mt-2">
                  {!!summaries[item.householdId].ready && (
                    <Text className="text-sm font-semibold text-amber-700">
                      {summaries[item.householdId].ready}{" "}
                      {summaries[item.householdId].ready === 1
                        ? "survey"
                        : "surveys"}{" "}
                      waiting to sync
                    </Text>
                  )}
                  {!!summaries[item.householdId].inProgress && (
                    <Text className="text-sm text-blue-700">
                      {summaries[item.householdId].inProgress} surveys in
                      progress
                    </Text>
                  )}
                  {!!summaries[item.householdId].synced && (
                    <Text className="text-sm text-green-700">
                      {summaries[item.householdId].synced}{" "}
                      {summaries[item.householdId].synced === 1
                        ? "survey"
                        : "surveys"}{" "}
                      synced
                    </Text>
                  )}
                  {!!summaries[item.householdId].review && (
                    <Text className="text-sm font-semibold text-red-700">
                      {summaries[item.householdId].review} submissions need
                      checking
                    </Text>
                  )}
                </View>
              )}
              <Text className="mt-3 font-semibold text-blue-700">
                {opening === item.householdId
                  ? "Opening household…"
                  : "View members →"}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
