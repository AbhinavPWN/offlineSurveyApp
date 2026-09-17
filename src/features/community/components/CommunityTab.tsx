import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
import { CommunityVisitForm } from "./CommunityVisitForm";
import { useCommunityVisits } from "../hooks/useCommunityVisits";
import type { CommunityVisit } from "../models/CommunityVisit";

interface CommunityTabProps {
  empId: string;
  supervisorId?: string;
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

const UNCERTAIN_PREFIX = "Upload outcome unconfirmed: ";
const AUTH_PREFIX = "Sign-in required: ";
const REJECTED_PREFIX = "Server rejected submission: ";
const INVALID_PREFIX = "Submission was not sent: ";

function friendlyVisitOperationError(value: string): string {
  if (
    value.includes("server may have saved") ||
    value.includes("Check the web application")
  ) {
    return "One visit needs checking. Open its card below and follow the next step.";
  }
  if (value.startsWith(AUTH_PREFIX)) {
    return "Your login expired before the visit was submitted. Sign in again, then tap Retry.";
  }
  if (value.startsWith(REJECTED_PREFIX)) {
    return value.slice(REJECTED_PREFIX.length);
  }
  if (value.startsWith(INVALID_PREFIX)) {
    return value.slice(INVALID_PREFIX.length);
  }
  return value;
}

export const CommunityTab = React.memo(function CommunityTab({
  empId,
  supervisorId = "",
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

  const {
    visits,
    editor,
    loadingVisits,
    openingDraft,
    savingDraft,
    processingVisitId,
    notice: visitNotice,
    error: visitError,
    refreshVisits,
    openNewVisit,
    openDraft,
    closeEditor,
    saveDraft,
    submitVisit,
    uploadVisit,
    retryVisitAfterNotFoundReview,
  } = useCommunityVisits({ chwUsername: empId, supervisorId });
  const [showVisits, setShowVisits] = React.useState(false);
  const closingPrompt = React.useRef(false);
  const hasVisitIdentity =
    Boolean(empId.trim()) &&
    /^\d+$/.test(supervisorId) &&
    !/^0+$/.test(supervisorId);
  const visitActionsDisabled =
    !hasVisitIdentity ||
    openingDraft ||
    savingDraft ||
    processingVisitId !== null;
  const friendlyVisitError = visitError
    ? friendlyVisitOperationError(visitError)
    : null;

  const requestCloseEditor = React.useCallback(() => {
    if (savingDraft || closingPrompt.current) return;
    closingPrompt.current = true;
    const dismiss = () => {
      closingPrompt.current = false;
    };
    Alert.alert(
      "Discard unsaved changes?",
      "Changes since your last save will be lost.",
      [
        { text: "Keep editing", style: "cancel", onPress: dismiss },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            dismiss();
            closeEditor();
          },
        },
      ],
      { cancelable: true, onDismiss: dismiss },
    );
  }, [closeEditor, savingDraft]);

  React.useEffect(() => {
    if (editor) setShowVisits(false);
  }, [editor]);

  const closeVisitList = () => {
    closeEditor();
    setShowVisits(false);
  };

  const refreshCommunity = React.useCallback(async () => {
    await Promise.all([refreshLocalMembers(), refreshVisits()]);
  }, [refreshLocalMembers, refreshVisits]);

  const renderVisit = (visit: CommunityVisit) => {
    const editable = visit.syncStatus === "DRAFT" && visit.serverId === null;
    const processing = processingVisitId === visit.localId;
    const retryableFailure =
      visit.lastSyncError?.startsWith(AUTH_PREFIX) ||
      visit.lastSyncError?.startsWith(REJECTED_PREFIX) ||
      visit.lastSyncError?.startsWith(INVALID_PREFIX);
    const needsServerCheck = Boolean(
      visit.lastSyncError?.startsWith(UNCERTAIN_PREFIX) ||
      (visit.lastSyncError &&
        !retryableFailure &&
        visit.syncStatus !== "DRAFT" &&
        visit.syncStatus !== "SYNCED"),
    );
    const canUpload =
      !editable && visit.syncStatus !== "SYNCED" && !needsServerCheck;
    const authRequired = visit.lastSyncError?.startsWith(AUTH_PREFIX) ?? false;
    const status = needsServerCheck
      ? {
          label: "Needs checking",
          badge: "bg-amber-100 text-amber-900",
          detail:
            "The connection ended before the app received a clear result. First check the web application for this visit.",
        }
      : visit.syncStatus === "DRAFT"
        ? {
            label: "Saved on this phone",
            badge: "bg-gray-100 text-gray-800",
            detail: "You can continue editing, then submit when it is ready.",
          }
        : visit.syncStatus === "PENDING"
          ? {
              label: isOnline ? "Ready to submit" : "Waiting for internet",
              badge: "bg-amber-100 text-amber-900",
              detail: isOnline
                ? "This visit is saved on the phone and ready to upload."
                : "This visit is safe on the phone. Connect to the internet to upload it.",
            }
          : visit.syncStatus === "PARTIAL"
            ? {
                label: "Attendance incomplete",
                badge: "bg-amber-100 text-amber-900",
                detail:
                  "The main visit is saved on the server. Some attendance still needs to upload.",
              }
            : visit.syncStatus === "SYNCED"
              ? {
                  label: "Submitted",
                  badge: "bg-green-100 text-green-800",
                  detail:
                    "The visit and all attendance are saved on the server.",
                }
              : authRequired
                ? {
                    label: "Sign in and retry",
                    badge: "bg-red-100 text-red-800",
                    detail:
                      "Your login expired before the server accepted this visit. Sign in again, then retry.",
                  }
                : {
                    label: "Could not submit",
                    badge: "bg-red-100 text-red-800",
                    detail:
                      "The visit is still saved on this phone. Correct the problem below, then retry.",
                  };
    const serverMessage = visit.lastSyncError?.startsWith(REJECTED_PREFIX)
      ? visit.lastSyncError.slice(REJECTED_PREFIX.length)
      : visit.lastSyncError?.startsWith(INVALID_PREFIX)
        ? visit.lastSyncError.slice(INVALID_PREFIX.length)
        : null;
    return (
      <View
        key={visit.localId}
        className="mb-3 rounded-xl border border-gray-200 bg-white p-4"
      >
        <View className="flex-row items-start justify-between">
          <Text className="mr-2 flex-1 text-base font-semibold text-gray-900">
            {visit.communityName || "Untitled visit"}
          </Text>
          <Text
            className={`rounded px-2 py-1 text-xs font-medium ${status.badge}`}
          >
            {status.label}
          </Text>
        </View>
        <Text className="mt-2 text-sm text-gray-600">
          {visit.visitDateBs ? `${visit.visitDateBs} (BS)` : "Date not entered"}{" "}
          · {visit.noOfPresent} present
        </Text>
        {visit.address ? (
          <Text className="mt-1 text-sm text-gray-600">{visit.address}</Text>
        ) : null}
        <View
          className={`mt-3 rounded-lg px-3 py-2 ${needsServerCheck ? "bg-amber-50" : visit.syncStatus === "SYNCED" ? "bg-green-50" : "bg-gray-50"}`}
        >
          <Text
            className={`text-sm ${needsServerCheck ? "text-amber-900" : visit.syncStatus === "SYNCED" ? "text-green-800" : "text-gray-700"}`}
          >
            {status.detail}
          </Text>
          {serverMessage ? (
            <Text className="mt-1 text-sm font-medium text-red-700">
              Server message: {serverMessage}
            </Text>
          ) : null}
        </View>
        {editable && (
          <View className="mt-3 flex-row">
            <Pressable
              onPress={() => void openDraft(visit.localId)}
              disabled={visitActionsDisabled}
              accessibilityRole="button"
              accessibilityLabel={`Continue draft ${visit.communityName || "Untitled visit"}`}
              accessibilityState={{ disabled: visitActionsDisabled }}
              className="mr-2 min-h-12 flex-1 items-center justify-center rounded-lg bg-blue-50 px-3"
            >
              <Text
                className={`font-semibold ${visitActionsDisabled ? "text-gray-400" : "text-blue-700"}`}
              >
                Continue Draft
              </Text>
            </Pressable>
            <Pressable
              onPress={() =>
                Alert.alert(
                  isOnline
                    ? "Submit Community visit?"
                    : "Queue Community visit?",
                  isOnline
                    ? "This will create the visit and attendance records on the server."
                    : "This will lock the draft and save it as Pending until you upload it online.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: isOnline ? "Submit" : "Queue",
                      onPress: () =>
                        void submitVisit(visit.localId, visit.updatedAt),
                    },
                  ],
                )
              }
              disabled={visitActionsDisabled}
              accessibilityRole="button"
              accessibilityLabel={`Submit ${visit.communityName || "Untitled visit"}`}
              accessibilityState={{ disabled: visitActionsDisabled }}
              className={`min-h-12 flex-1 flex-row items-center justify-center rounded-lg px-3 ${visitActionsDisabled ? "bg-gray-300" : "bg-blue-600"}`}
            >
              {processing && (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
              )}
              <Text
                className={`font-semibold ${visitActionsDisabled && !processing ? "text-gray-600" : "text-white"}`}
              >
                {processing ? "Submitting…" : isOnline ? "Submit" : "Queue"}
              </Text>
            </Pressable>
          </View>
        )}
        {canUpload && (
          <Pressable
            onPress={() => void uploadVisit(visit.localId)}
            disabled={visitActionsDisabled || !isOnline}
            accessibilityRole="button"
            accessibilityLabel={`Upload ${visit.communityName || "Untitled visit"}`}
            accessibilityState={{
              disabled: visitActionsDisabled || !isOnline,
            }}
            className={`mt-3 min-h-12 flex-row items-center justify-center rounded-lg px-3 ${visitActionsDisabled || !isOnline ? "bg-gray-300" : "bg-blue-600"}`}
          >
            {processing && (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
            )}
            <Text
              className={`font-semibold ${visitActionsDisabled || !isOnline ? "text-gray-600" : "text-white"}`}
            >
              {processing
                ? "Uploading…"
                : visit.syncStatus === "PARTIAL"
                  ? "Retry Attendance"
                  : visit.syncStatus === "FAILED"
                    ? "Retry Upload"
                    : "Upload Now"}
            </Text>
          </Pressable>
        )}
        {needsServerCheck && (
          <Pressable
            onPress={() =>
              Alert.alert(
                "Did you check the web application?",
                "Continue only if this visit, or its missing attendance, is not shown there. Retrying a record that was already saved can create a duplicate.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Checked — not saved",
                    onPress: () =>
                      void retryVisitAfterNotFoundReview(visit.localId),
                  },
                ],
              )
            }
            disabled={visitActionsDisabled || !isOnline}
            accessibilityRole="button"
            accessibilityLabel={`Confirm ${visit.communityName || "Untitled visit"} was not saved and retry`}
            accessibilityState={{
              disabled: visitActionsDisabled || !isOnline,
            }}
            className={`mt-3 min-h-12 flex-row items-center justify-center rounded-lg px-3 ${visitActionsDisabled || !isOnline ? "bg-gray-300" : "bg-amber-600"}`}
          >
            {processing && (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
            )}
            <Text
              className={`font-semibold ${visitActionsDisabled || !isOnline ? "text-gray-600" : "text-white"}`}
            >
              {processing
                ? "Retrying…"
                : isOnline
                  ? "I checked — not saved"
                  : "Connect to retry"}
            </Text>
          </Pressable>
        )}
      </View>
    );
  };

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
      <Modal
        visible={editor !== null || showVisits}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={editor ? requestCloseEditor : closeVisitList}
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          {editor ? (
            <>
              <View className="border-b border-gray-200 bg-white px-4 py-2">
                <Text className="text-sm text-gray-600">
                  {hasSelectedFilters
                    ? `Available members: Category ${categoryNo}, ${communityMemberCategoryOptions.find((option) => option.value === memberCategory)?.labelEn ?? ""}.`
                    : "Select download filters before opening a visit to add members. You can save visit details now."}
                </Text>
              </View>
              <CommunityVisitForm
                key={editor.key}
                members={members}
                initialValues={editor.initialValues}
                onSaveDraft={saveDraft}
                onCancel={requestCloseEditor}
                saving={savingDraft}
                loadingMembers={loadingLocalMembers || downloading}
              />
            </>
          ) : (
            <>
              <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
                <Text className="text-xl font-semibold text-gray-900">
                  Local Community Visits
                </Text>
                <Pressable
                  onPress={closeVisitList}
                  accessibilityRole="button"
                  className="min-h-12 justify-center px-3"
                >
                  <Text className="font-semibold text-blue-700">Close</Text>
                </Pressable>
              </View>
              {openingDraft && (
                <ActivityIndicator
                  accessibilityLabel="Opening draft"
                  color="#2563EB"
                  style={{ marginTop: 12 }}
                />
              )}
              {friendlyVisitError && (
                <View
                  accessibilityRole="alert"
                  className="mx-4 mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-3"
                >
                  <Text className="font-semibold text-red-800">
                    Action needed
                  </Text>
                  <Text className="mt-1 text-sm text-red-700">
                    {friendlyVisitError}
                  </Text>
                </View>
              )}
              {visitNotice && (
                <View
                  accessibilityLiveRegion="polite"
                  className="mx-4 mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-3"
                >
                  <Text className="font-semibold text-green-800">
                    Saved successfully
                  </Text>
                  <Text className="mt-1 text-sm text-green-700">
                    {visitNotice}
                  </Text>
                </View>
              )}
              <FlatList
                data={visits}
                keyExtractor={(visit) => visit.localId}
                renderItem={({ item }) => renderVisit(item)}
                contentContainerStyle={{ padding: 16 }}
                refreshing={loadingVisits}
                onRefresh={refreshVisits}
                ListEmptyComponent={
                  <Text className="py-6 text-center text-gray-600">
                    No locally saved visits yet.
                  </Text>
                }
              />
            </>
          )}
        </SafeAreaView>
      </Modal>
      <FlatList
        data={filteredMembers}
        keyExtractor={(member) => member.clientNo}
        renderItem={renderMember}
        ListHeaderComponent={
          <View>
            <View className="mx-4 mt-4 rounded-xl border border-gray-200 bg-white p-4">
              <Text className="text-lg font-semibold text-gray-900">
                Community Visits
              </Text>
              <Text className="mt-1 text-sm text-gray-600">
                Save visits as drafts on this device, including while offline.
              </Text>
              <Pressable
                onPress={openNewVisit}
                disabled={visitActionsDisabled}
                accessibilityRole="button"
                accessibilityState={{ disabled: visitActionsDisabled }}
                className={`mt-4 min-h-12 items-center justify-center rounded-xl px-4 py-3 ${visitActionsDisabled ? "bg-gray-300" : "bg-blue-600"}`}
              >
                <Text
                  className={`font-semibold ${visitActionsDisabled ? "text-gray-600" : "text-white"}`}
                >
                  New Community Visit
                </Text>
              </Pressable>
              {!hasVisitIdentity && (
                <Text className="mt-3 text-sm text-red-700">
                  Your numeric CHW ID is unavailable. Please log in again before
                  creating or editing a visit.
                </Text>
              )}
              <Text className="mt-3 text-xs text-gray-600">
                To add attendees, select the member filters below before opening
                the form.
              </Text>
              {friendlyVisitError && (
                <View
                  accessibilityRole="alert"
                  className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-3"
                >
                  <Text className="font-semibold text-red-800">
                    Action needed
                  </Text>
                  <Text className="mt-1 text-sm text-red-700">
                    {friendlyVisitError}
                  </Text>
                </View>
              )}
              {visitNotice && (
                <View
                  accessibilityLiveRegion="polite"
                  className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-3"
                >
                  <Text className="font-semibold text-green-800">
                    Saved successfully
                  </Text>
                  <Text className="mt-1 text-sm text-green-700">
                    {visitNotice}
                  </Text>
                </View>
              )}
              {(loadingVisits || openingDraft) && (
                <ActivityIndicator
                  accessibilityLabel={
                    openingDraft ? "Opening draft" : "Loading local visits"
                  }
                  color="#2563EB"
                  style={{ marginTop: 12 }}
                />
              )}
              <Text className="mb-3 mt-5 font-semibold text-gray-800">
                Local visits ({visits.length})
              </Text>
              {visits.slice(0, 3).map(renderVisit)}
              {!loadingVisits && visits.length === 0 && (
                <Text className="text-sm text-gray-500">
                  No saved visits yet. Tap New Community Visit to begin.
                </Text>
              )}
              {visits.length > 3 && (
                <Pressable
                  onPress={() => setShowVisits(true)}
                  accessibilityRole="button"
                  className="min-h-12 items-center justify-center rounded-lg bg-gray-100"
                >
                  <Text className="font-medium text-blue-700">
                    View all {visits.length} visits
                  </Text>
                </Pressable>
              )}
            </View>
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
        refreshing={(loadingLocalMembers && !downloading) || loadingVisits}
        onRefresh={refreshCommunity}
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
