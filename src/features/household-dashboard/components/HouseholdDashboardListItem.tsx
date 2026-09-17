import React from "react";
import { Pressable, Text, View } from "react-native";

import { SyncBadge } from "../../../components/SyncBadge";
import type { Household } from "../../../domain/models/Household";
import type { HouseholdLocal } from "../../../models/household.model";
import type { HouseholdDashboardTab } from "./HouseholdDashboardTabs";
import {
  formatServerModifiedDate,
  getAggregateMainMessage,
  getHouseholdDetailStatus,
  getMemberDetailStatus,
  getSurveyDetailStatus,
  type HouseholdWithAggregate,
} from "../utils/householdDashboardUtils";

interface HouseholdDashboardListItemProps {
  item: HouseholdWithAggregate | Household;
  activeTab: HouseholdDashboardTab;
  downloadedServerIds: ReadonlySet<string>;
  municipalityMap: Readonly<Record<string, string>>;
  onEdit: (household: HouseholdLocal) => void;
  onShowOptions: (household: HouseholdLocal) => void;
  onDownload: (household: Household) => void;
}

export const HouseholdDashboardListItem = React.memo(
  function HouseholdDashboardListItem({
    item,
    activeTab,
    downloadedServerIds,
    municipalityMap,
    onEdit,
    onShowOptions,
    onDownload,
  }: HouseholdDashboardListItemProps) {
    if (activeTab === "LOCAL") {
      const {
        household: local,
        aggregateStatus,
        totalMembers,
        syncedMembers,
        pendingMembers,
        failedMembers,
        draftMembers,
        surveyCounts,
        headName,
        headMobile,
        pregnantWomenCount,
      } = item as HouseholdWithAggregate;

      if (!local.localId) return null;
      const aggregateMessage = getAggregateMainMessage(aggregateStatus);
      const householdDetail = getHouseholdDetailStatus(local.syncStatus);
      const memberDetail = getMemberDetailStatus({
        totalMembers,
        syncedMembers,
        pendingMembers,
        failedMembers,
        draftMembers,
      });
      const surveyDetail = getSurveyDetailStatus(surveyCounts, totalMembers);

      return (
        <Pressable
          onPress={() => onEdit(local)}
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

              <Text
                className={`text-xs px-2 py-1 rounded mt-2 self-start ${aggregateMessage.className}`}
              >
                {aggregateMessage.text}
              </Text>
            </View>

            <View className="items-end">
              <SyncBadge status={aggregateStatus} />
              {aggregateStatus === "FULLY_SYNCED" && (
                <Pressable
                  onPress={() => onShowOptions(local)}
                  className="mt-2 px-2 py-1"
                >
                  <Text style={{ fontSize: 18 }}>⋮</Text>
                </Pressable>
              )}
            </View>
          </View>

          {pregnantWomenCount > 0 && (
            <View className="mt-3 flex-row items-center justify-between rounded-lg border border-pink-300 bg-pink-50 px-3 py-2">
              <Text className="text-sm font-medium text-pink-500 ">
                Pregnant women / गर्भवती महिला
              </Text>

              <Text className="text-base font-bold text-pink-700">
                {pregnantWomenCount}
              </Text>
            </View>
          )}

          <Text className="text-gray-600 mt-2">
            Address: {local.address || "Address not specified"}
          </Text>

          <Text className="text-xs text-gray-500 mt-1">
            Household ID: {local.householdId || "Not synced yet"}
          </Text>

          <View className="mt-3 bg-gray-50 rounded-lg px-3 py-2">
            <Text className="text-xs font-semibold text-gray-600 mb-1">
              Sync Details
            </Text>

            <View className="flex-row justify-between py-0.5">
              <Text className="text-xs text-gray-500">Household</Text>
              <Text
                className={`text-xs font-medium ${householdDetail.className}`}
              >
                {householdDetail.label}
              </Text>
            </View>

            <View className="flex-row justify-between py-0.5">
              <Text className="text-xs text-gray-500">Members</Text>
              <Text
                className={`text-xs font-medium ${memberDetail.className}`}
              >
                {memberDetail.label}
              </Text>
            </View>

            <View className="flex-row justify-between py-0.5">
              <Text className="text-xs text-gray-500">Surveys</Text>
              <Text
                className={`text-xs font-medium ${surveyDetail.className}`}
              >
                {surveyDetail.label}
              </Text>
            </View>
          </View>
        </Pressable>
      );
    }

    const online = item as Household;
    if (!online.householdId) return null;

    const hasServerUpdate = Boolean(online.modifiedDate?.trim());
    const isDownloaded = downloadedServerIds.has(online.householdId);
    const modifiedDateLabel = formatServerModifiedDate(online.modifiedDate);

    return (
      <View
        className={`bg-white mx-4 mt-3 p-4 rounded-xl shadow-sm border ${
          hasServerUpdate ? "border-green-200" : "border-amber-200"
        }`}
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1 pr-3">
            <Text className="text-base font-semibold text-gray-900">
              {online.householdHeadName || "Household head not found"}
            </Text>

            <Text className="text-xs text-gray-500 mt-1">
              Household ID: {online.householdId}
            </Text>
          </View>

          <View
            className={`px-2 py-1 rounded-full ${
              hasServerUpdate ? "bg-green-100" : "bg-amber-100"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                hasServerUpdate ? "text-green-700" : "text-amber-700"
              }`}
            >
              {hasServerUpdate ? "Updated" : "Not updated"}
            </Text>
          </View>
        </View>

        <Text className="text-sm text-gray-700 mt-3">
          {online.municipalityName || "Municipality"} · Ward {online.wardNo}
        </Text>

        <Text className="text-sm text-gray-600 mt-1">
          {online.address || "Address not specified"}
        </Text>

        <Text className="text-sm text-gray-500 mt-1">
          {online.memberCount}{" "}
          {online.memberCount === 1 ? "household member" : "household members"}
        </Text>

        <View
          className={`mt-3 rounded-lg px-3 py-2 ${
            hasServerUpdate ? "bg-green-50" : "bg-amber-50"
          }`}
        >
          <Text
            className={`text-sm font-semibold ${
              hasServerUpdate ? "text-green-700" : "text-amber-700"
            }`}
          >
            {hasServerUpdate
              ? "✓ Household updated on server"
              : "No synced update yet"}
          </Text>

          <Text
            className={`text-xs mt-1 ${
              hasServerUpdate ? "text-green-600" : "text-amber-600"
            }`}
          >
            {hasServerUpdate
              ? `Last updated (BS): ${modifiedDateLabel}`
              : "Only the original household listing is available."}
          </Text>
        </View>

        {isDownloaded ? (
          <View className="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            <Text className="text-blue-700 font-medium">
              ✓ Downloaded on this device
            </Text>
            <Text className="text-xs text-blue-600 mt-1">
              Open it from the Downloaded tab.
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={() => onDownload(online)}
            className="mt-3 bg-blue-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white text-center font-medium">
              Download household
            </Text>
          </Pressable>
        )}
      </View>
    );
  },
);
