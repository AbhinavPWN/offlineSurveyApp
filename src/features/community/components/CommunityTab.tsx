import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { FormDropdown } from "../../member-form/components/FormDropdown";
import {
  CommunityCategoryNo,
  CommunityMemberCategory,
} from "../../../services/api/dto/CommunityDTO";
import {
  communityCategoryNoOptions,
  communityMemberCategoryOptions,
} from "../master/communityMasterData";
import { CommunityMember } from "../models/CommunityMember";
import { useCommunityMemberDownload } from "../hooks/useCommunityMemberDownload";
import { CommunityMemberCard } from "./CommunityMemberCard";

interface CommunityTabProps {
  empId: string;
  isOnline: boolean;
}

function normalizeSearchValue(value: unknown): string {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function matchesCommunityMemberSearch(
  member: CommunityMember,
  normalizedQuery: string,
): boolean {
  if (!normalizedQuery) {
    return true;
  }

  const searchableValues = [
    member.memberName,
    member.clientNo,
    member.householdId,
    member.householdHeadName,
    member.address,
    member.municipalityName,
    member.relationship,
  ];

  return searchableValues.some((value) =>
    normalizeSearchValue(value).includes(normalizedQuery),
  );
}

function formatDownloadedTime(timestamp: number | null): string | null {
  if (!timestamp) {
    return null;
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString();
}

export const CommunityTab = React.memo(function CommunityTab({
  empId,
  isOnline,
}: CommunityTabProps) {
  const {
    categoryNo,
    setCategoryNo,
    memberCategory,
    setMemberCategory,
    members,
    lastDownloadedAt,
    hasSelectedFilters,
    canDownload,
    loadingLocalMembers,
    downloading,
    error,
    downloadMembers,
    refreshLocalMembers,
  } = useCommunityMemberDownload({
    empId,
    isOnline,
  });

  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    setSearchQuery("");
  }, [categoryNo, memberCategory]);

  const normalizedSearchQuery = React.useMemo(
    () => normalizeSearchValue(searchQuery),
    [searchQuery],
  );

  const filteredMembers = React.useMemo(
    () =>
      members.filter((member) =>
        matchesCommunityMemberSearch(member, normalizedSearchQuery),
      ),
    [members, normalizedSearchQuery],
  );

  const downloadedTimeLabel = React.useMemo(
    () => formatDownloadedTime(lastDownloadedAt),
    [lastDownloadedAt],
  );

  const handleDownload = React.useCallback(async () => {
    try {
      const summary = await downloadMembers();

      Alert.alert(
        "Download Complete",
        `${summary.stored} ${
          summary.stored === 1 ? "member" : "members"
        } saved on this device.${
          summary.skipped > 0
            ? ` ${summary.skipped} duplicate or invalid ${
                summary.skipped === 1 ? "record was" : "records were"
              } skipped.`
            : ""
        }`,
      );
    } catch (downloadError) {
      const message =
        downloadError instanceof Error
          ? downloadError.message
          : "Unable to download community members.";

      Alert.alert("Download Failed", message);
    }
  }, [downloadMembers]);

  const renderMember = React.useCallback(
    ({ item }: { item: CommunityMember }) => (
      <CommunityMemberCard member={item} />
    ),
    [],
  );

  const renderEmptyState = () => {
    if (loadingLocalMembers) {
      return (
        <View className="items-center px-6 py-12">
          <ActivityIndicator size="large" color="#2563EB" />

          <Text className="mt-4 text-gray-600">
            Loading downloaded members...
          </Text>
        </View>
      );
    }

    if (!hasSelectedFilters) {
      return (
        <View className="items-center px-6 py-12">
          <Text className="text-5xl">👥</Text>

          <Text className="mt-4 text-lg font-semibold text-gray-800">
            Select member filters
          </Text>

          <Text className="mt-2 text-center text-sm text-gray-500">
            Select both Category No. and Member Category to view or download
            eligible community members.
          </Text>
        </View>
      );
    }

    if (normalizedSearchQuery && members.length > 0) {
      return (
        <View className="items-center px-6 py-12">
          <Text className="text-5xl">🔎</Text>

          <Text className="mt-4 text-lg font-semibold text-gray-800">
            No matching member found
          </Text>

          <Text className="mt-2 text-center text-sm text-gray-500">
            Try another member name, client number, household ID, or address.
          </Text>

          <Pressable
            onPress={() => setSearchQuery("")}
            className="mt-4 rounded-lg bg-blue-600 px-5 py-2"
          >
            <Text className="font-medium text-white">Clear Search</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View className="items-center px-6 py-12">
        <Text className="text-5xl">📥</Text>

        <Text className="mt-4 text-lg font-semibold text-gray-800">
          No downloaded members
        </Text>

        <Text className="mt-2 text-center text-sm text-gray-500">
          {lastDownloadedAt
            ? "The server returned no members for this filter."
            : isOnline
              ? "Tap Download Members to save eligible members on this device."
              : "Connect to the internet to download members for this filter."}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={filteredMembers}
        keyExtractor={(member) => member.clientNo}
        renderItem={renderMember}
        ListHeaderComponent={
          <View>
            <View className="mx-4 mt-4 rounded-xl border border-gray-200 bg-white p-4">
              <Text className="text-lg font-semibold text-gray-900">
                Community Members
              </Text>

              <Text className="mt-1 text-sm text-gray-500">
                Download eligible members for community visits and keep them
                available offline.
              </Text>

              <View className="mt-4">
                <FormDropdown
                  label="Category No. / वर्ग नं."
                  value={categoryNo}
                  options={communityCategoryNoOptions}
                  onChange={(value) =>
                    setCategoryNo(value as CommunityCategoryNo)
                  }
                />

                <FormDropdown
                  label="Member Category / सदस्य वर्ग"
                  value={memberCategory}
                  options={communityMemberCategoryOptions}
                  onChange={(value) =>
                    setMemberCategory(value as CommunityMemberCategory)
                  }
                />
              </View>

              {!isOnline && (
                <View className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                  <Text className="text-center text-sm text-red-700">
                    You are offline. Previously downloaded members remain
                    available.
                  </Text>
                </View>
              )}

              <Pressable
                onPress={handleDownload}
                disabled={!canDownload}
                className={`items-center rounded-xl px-4 py-3 ${
                  canDownload ? "bg-blue-600 active:bg-blue-700" : "bg-gray-300"
                }`}
              >
                <View className="flex-row items-center">
                  {downloading && (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                      style={{ marginRight: 8 }}
                    />
                  )}

                  <Text
                    className={`font-semibold ${
                      canDownload ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {downloading
                      ? "Downloading..."
                      : lastDownloadedAt
                        ? "Refresh Download"
                        : "Download Members"}
                  </Text>
                </View>
              </Pressable>

              {downloadedTimeLabel && (
                <Text className="mt-3 text-center text-xs text-gray-500">
                  Last downloaded: {downloadedTimeLabel}
                </Text>
              )}

              {error && (
                <View className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                  <Text className="text-sm text-red-700">{error}</Text>
                </View>
              )}
            </View>

            {hasSelectedFilters && members.length > 0 && (
              <View className="mx-4 mt-4 mb-3">
                <Text className="text-sm text-gray-600">
                  {normalizedSearchQuery
                    ? `${filteredMembers.length} of ${members.length} members`
                    : `${members.length} downloaded ${
                        members.length === 1 ? "member" : "members"
                      }`}
                </Text>

                <View className="mt-3 flex-row items-center rounded-xl border border-gray-300 bg-white px-3">
                  <Text className="mr-2 text-lg text-gray-400">⌕</Text>

                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search members"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                    accessibilityLabel="Search downloaded community members"
                    className="flex-1 py-3 text-base text-gray-900"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />

                  {searchQuery.length > 0 && (
                    <Pressable
                      onPress={() => setSearchQuery("")}
                      accessibilityRole="button"
                      accessibilityLabel="Clear community member search"
                      className="ml-2 px-2 py-2"
                    >
                      <Text className="text-sm font-semibold text-blue-700">
                        Clear
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 120,
        }}
        refreshing={loadingLocalMembers && !downloading}
        onRefresh={refreshLocalMembers}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
});
