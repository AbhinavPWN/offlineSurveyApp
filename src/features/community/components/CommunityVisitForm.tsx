import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  convertADToBSISO,
  convertBSToADISO,
} from "../../../utils/nepaliDateUtils";
import type { CommunityMember } from "../models/CommunityMember";
import type { CommunityVisitSessionTopics } from "../models/CommunityVisit";

export type CommunityVisitFormMember = Pick<
  CommunityMember,
  | "clientNo"
  | "memberName"
  | "gender"
  | "districtId"
  | "vdcnpCode"
  | "wardNo"
  | "address"
>;

export interface CommunityVisitFormValues extends CommunityVisitSessionTopics {
  visitDateBs: string;
  visitDateAd: string;
  communityName: string;
  address: string;
  communityCategory: string;
  noOfPresent: number;
  noOfFemales: number;
  noOfMales: number;
  noOfPwd: number;
  selectedMembers: CommunityVisitFormMember[];
}

interface CommunityVisitFormProps {
  /** Already downloaded members for the exact logged-in account. */
  members: CommunityMember[];
  /** Seed once. Parent must use a new React key when opening a different draft/account. */
  initialValues?: CommunityVisitFormValues;
  onSaveDraft: (values: CommunityVisitFormValues) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
  loadingMembers?: boolean;
}

const TOPICS: { key: keyof CommunityVisitSessionTopics; label: string }[] = [
  { key: "sessionTopicNut", label: "Nutrition / पोषण" },
  { key: "sessionTopicHealthly", label: "Healthy Lifestyle / स्वस्थ जीवनशैली" },
  { key: "sessionTopicDrug", label: "Drug Abuse / लागूऔषधको दुरुपयोग" },
  { key: "sessionTopicChild", label: "Child Marriage / बालविवाह" },
  { key: "sessionTopicHeat", label: "Heat Stress / गर्मीको तनाव" },
  { key: "sessionTopicMalaria", label: "Malaria / औलो" },
  { key: "sessionTopicDiarrhoea", label: "Diarrhoea / पखाला" },
  { key: "sessionTopicGbv", label: "Gender-based Violence / लैङ्गिक हिंसा" },
];

const EMPTY_TOPICS: CommunityVisitSessionTopics = {
  sessionTopicNut: "N",
  sessionTopicHealthly: "N",
  sessionTopicDrug: "N",
  sessionTopicChild: "N",
  sessionTopicHeat: "N",
  sessionTopicMalaria: "N",
  sessionTopicDiarrhoea: "N",
  sessionTopicGbv: "N",
};

function digits(value: string): string {
  return value.replace(/[०-९]/g, (digit) =>
    String("०१२३४५६७८९".indexOf(digit)),
  );
}

function formatBsInput(value: string): string {
  const raw = digits(value).replace(/\D/g, "").slice(0, 8);
  if (raw.length <= 4) return raw;
  if (raw.length <= 6) return `${raw.slice(0, 4)}-${raw.slice(4)}`;
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6)}`;
}

function validAdDate(bs: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(bs)) return null;
  const ad = convertBSToADISO(bs);
  return ad && convertADToBSISO(ad) === bs ? ad : null;
}

function snapshot(member: CommunityVisitFormMember): CommunityVisitFormMember {
  return {
    clientNo: member.clientNo,
    memberName: member.memberName,
    gender: member.gender,
    districtId: member.districtId,
    vdcnpCode: member.vdcnpCode,
    wardNo: member.wardNo,
    address: member.address,
  };
}

function Field({
  label,
  inputRef,
  ...props
}: React.ComponentProps<typeof TextInput> & {
  label: string;
  inputRef?: React.Ref<TextInput>;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 font-medium text-gray-800">{label}</Text>
      <TextInput
        ref={inputRef}
        className="rounded-xl border border-gray-300 bg-white px-3 py-3 text-base text-gray-900"
        placeholderTextColor="#6B7280"
        accessibilityLabel={label}
        {...props}
      />
    </View>
  );
}

/** UI only. Identity resolution, persistence and submission live outside this form. */
export function CommunityVisitForm({
  members,
  initialValues,
  onSaveDraft,
  onCancel,
  saving = false,
  loadingMembers = false,
}: CommunityVisitFormProps) {
  const [visitDateBs, setVisitDateBs] = React.useState(
    initialValues?.visitDateBs ?? "",
  );
  const [communityName, setCommunityName] = React.useState(
    initialValues?.communityName ?? "",
  );
  const [address, setAddress] = React.useState(initialValues?.address ?? "");
  const [communityCategory, setCommunityCategory] = React.useState(
    initialValues?.communityCategory ?? "",
  );
  const [pwdText, setPwdText] = React.useState(
    initialValues ? String(initialValues.noOfPwd) : "",
  );
  const [topics, setTopics] = React.useState<CommunityVisitSessionTopics>(
    () => {
      const values = { ...EMPTY_TOPICS };
      for (const { key } of TOPICS) values[key] = initialValues?.[key] ?? "N";
      return values;
    },
  );
  const [selected, setSelected] = React.useState<
    Map<string, CommunityVisitFormMember>
  >(
    () =>
      new Map(
        (initialValues?.selectedMembers ?? []).map((member) => [
          member.clientNo,
          snapshot(member),
        ]),
      ),
  );
  const [query, setQuery] = React.useState("");
  const [selectedOnly, setSelectedOnly] = React.useState(false);
  const [savingHere, setSavingHere] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const savingRef = React.useRef(false);
  const rootRef = React.useRef<View>(null);
  const viewportRef = React.useRef<View>(null);
  const listRef = React.useRef<FlatList<CommunityVisitFormMember>>(null);
  const inputs = React.useRef<Record<string, TextInput | null>>({});
  const focusedField = React.useRef<string | null>(null);
  const scrollOffset = React.useRef(0);
  const scrollFrame = React.useRef<number | null>(null);
  const [keyboardOffset, setKeyboardOffset] = React.useState(0);
  const [keyboardVisible, setKeyboardVisible] = React.useState(false);

  const revealFocusedField = React.useCallback(() => {
    if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = requestAnimationFrame(() => {
      scrollFrame.current = null;
      const key = focusedField.current;
      const input = key ? inputs.current[key] : null;
      if (!input) return;
      viewportRef.current?.measureInWindow((_x, top, _width, height) => {
        input.measureInWindow((_inputX, inputTop, _inputWidth, inputHeight) => {
          if (focusedField.current !== key || height <= 0) return;
          const bottomOverflow = inputTop + inputHeight - (top + height - 16);
          const topOverflow = top + 16 - inputTop;
          const delta =
            bottomOverflow > 0
              ? bottomOverflow
              : topOverflow > 0
                ? -topOverflow
                : 0;
          if (delta !== 0) {
            listRef.current?.scrollToOffset({
              offset: Math.max(0, scrollOffset.current + delta),
              animated: true,
            });
          }
        });
      });
    });
  }, []);

  React.useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
      revealFocusedField();
    });
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false),
    );
    const change = Keyboard.addListener(
      "keyboardDidChangeFrame",
      revealFocusedField,
    );
    return () => {
      show.remove();
      hide.remove();
      change.remove();
      if (scrollFrame.current !== null)
        cancelAnimationFrame(scrollFrame.current);
    };
  }, [revealFocusedField]);

  const focusProps = (key: string) => ({
    inputRef: (input: TextInput | null) => {
      inputs.current[key] = input;
    },
    onFocus: () => {
      focusedField.current = key;
      revealFocusedField();
    },
    onBlur: () => {
      if (focusedField.current === key) focusedField.current = null;
    },
  });

  const busy = saving || savingHere;
  const visitDateAd = validAdDate(visitDateBs);
  const selectedMembers = Array.from(selected.values());
  const noOfFemales = selectedMembers.filter(
    (member) => member.gender.trim().toUpperCase() === "F",
  ).length;
  const noOfMales = selectedMembers.filter(
    (member) => member.gender.trim().toUpperCase() === "M",
  ).length;
  const otherOrUnknown = selected.size - noOfFemales - noOfMales;

  const filtered = React.useMemo(() => {
    const available = new Map<string, CommunityVisitFormMember>();
    for (const member of members) {
      if (member.clientNo.trim()) available.set(member.clientNo, member);
    }
    // Selected snapshots survive download/filter changes, including removed profiles.
    for (const [clientNo, member] of selected) available.set(clientNo, member);
    const search = query.normalize("NFC").trim().toLowerCase();
    return Array.from(available.values())
      .filter((member) => {
        if (selectedOnly && !selected.has(member.clientNo)) return false;
        return (
          !search ||
          [member.memberName, member.clientNo, member.address].some((value) =>
            value.normalize("NFC").toLowerCase().includes(search),
          )
        );
      })
      .sort(
        (a, b) =>
          a.memberName.localeCompare(b.memberName) ||
          a.clientNo.localeCompare(b.clientNo),
      );
  }, [members, selected, query, selectedOnly]);

  function toggleMember(member: CommunityVisitFormMember) {
    if (busy || savingRef.current) return;
    setSelected((previous) => {
      const next = new Map(previous);
      if (next.has(member.clientNo)) next.delete(member.clientNo);
      else next.set(member.clientNo, snapshot(member));
      return next;
    });
  }

  async function saveDraft() {
    if (busy || savingRef.current) return;
    setError(null);
    if (visitDateBs && !visitDateAd) {
      setError("Complete the BS date or clear it before saving a draft.");
      return;
    }
    if (!/^\d+$/.test(pwdText) || !Number.isSafeInteger(Number(pwdText))) {
      setError(
        "Enter the number of PWD as a whole number, including 0 if none attended.",
      );
      return;
    }
    savingRef.current = true;
    Keyboard.dismiss();
    setSavingHere(true);
    try {
      await onSaveDraft({
        visitDateBs,
        visitDateAd: visitDateAd ?? "",
        communityName,
        address,
        communityCategory,
        noOfPresent: selected.size,
        noOfFemales,
        noOfMales,
        noOfPwd: Number(pwdText),
        ...topics,
        selectedMembers: selectedMembers.map(snapshot),
      });
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save the draft. Your entries are still here.",
      );
    } finally {
      savingRef.current = false;
      setSavingHere(false);
    }
  }

  return (
    <View
      ref={rootRef}
      className="flex-1"
      onLayout={() => {
        // The form is below the modal's safe area and member-filter description.
        rootRef.current?.measureInWindow((_x, y) => setKeyboardOffset(y));
      }}
    >
      <KeyboardAvoidingView
        className="flex-1 bg-gray-50"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={keyboardOffset}
      >
        <View
          ref={viewportRef}
          className="flex-1"
          onLayout={revealFocusedField}
        >
          <FlatList
            ref={listRef}
            style={{ flex: 1 }}
            data={filtered}
            keyExtractor={(member) => member.clientNo}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets={false}
            removeClippedSubviews={false}
            onScroll={(event) => {
              scrollOffset.current = event.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingBottom: 24 }}
            ListHeaderComponent={
              <View className="p-4">
                <Text className="text-2xl font-bold text-gray-900">
                  Community Visit
                </Text>
                <Text className="mb-5 mt-1 text-sm text-gray-600">
                  Enter visit details and select the members who attended.
                </Text>
                <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
                  <Text className="mb-4 text-lg font-semibold text-gray-900">
                    Visit details
                  </Text>
                  <Field
                    {...focusProps("date")}
                    label="Visit date (BS) / भ्रमण मिति"
                    value={visitDateBs}
                    onChangeText={(value) =>
                      setVisitDateBs(formatBsInput(value))
                    }
                    editable={!busy}
                    keyboardType="number-pad"
                    placeholder="YYYY-MM-DD (BS)"
                    maxLength={10}
                  />
                  {visitDateBs.length > 0 && (
                    <Text
                      className={`mb-4 text-sm ${visitDateAd ? "text-gray-600" : "text-red-700"}`}
                    >
                      {visitDateAd
                        ? `AD: ${visitDateAd}`
                        : "Enter a complete, valid BS date."}
                    </Text>
                  )}
                  <Field
                    {...focusProps("name")}
                    label="Community name / समुदायको नाम"
                    value={communityName}
                    onChangeText={setCommunityName}
                    editable={!busy}
                    placeholder="Community name"
                  />
                  <Field
                    {...focusProps("address")}
                    label="Address / ठेगाना"
                    value={address}
                    onChangeText={setAddress}
                    editable={!busy}
                    placeholder="Visit location"
                    multiline
                    style={{
                      minHeight: 72,
                      maxHeight: 120,
                      textAlignVertical: "top",
                    }}
                    onContentSizeChange={revealFocusedField}
                  />
                  <Field
                    {...focusProps("category")}
                    label="Community category / सामुदायिक श्रेणी"
                    value={communityCategory}
                    onChangeText={setCommunityCategory}
                    editable={!busy}
                    placeholder="Community category"
                  />
                </View>
                <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
                  <Text className="mb-3 text-lg font-semibold text-gray-900">
                    Session topics / सत्रका विषयहरू
                  </Text>
                  {TOPICS.map(({ key, label }) => (
                    <Pressable
                      key={key}
                      accessibilityRole="checkbox"
                      accessibilityLabel={label}
                      accessibilityState={{
                        checked: topics[key] === "Y",
                        disabled: busy,
                      }}
                      disabled={busy}
                      onPress={() =>
                        setTopics((previous) => ({
                          ...previous,
                          [key]: previous[key] === "Y" ? "N" : "Y",
                        }))
                      }
                      className="min-h-12 flex-row items-center border-b border-gray-100 py-3"
                    >
                      <View
                        className={`mr-3 h-6 w-6 items-center justify-center rounded border ${topics[key] === "Y" ? "border-blue-600 bg-blue-600" : "border-gray-400 bg-white"}`}
                      >
                        {topics[key] === "Y" && (
                          <Text className="font-bold text-white">✓</Text>
                        )}
                      </View>
                      <Text className="flex-1 text-base text-gray-800">
                        {label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
                  <Text className="mb-3 text-lg font-semibold text-gray-900">
                    Attendance
                  </Text>
                  <Text
                    className="mb-2 text-base text-gray-800"
                    accessibilityLiveRegion="polite"
                  >
                    Present: {selected.size} · Female: {noOfFemales} · Male:{" "}
                    {noOfMales}
                  </Text>
                  {otherOrUnknown > 0 && (
                    <Text className="mb-3 text-sm text-gray-600">
                      Other or unspecified gender: {otherOrUnknown}
                    </Text>
                  )}
                  <Text className="mb-4 text-sm text-gray-600">
                    Counts reflect selected members.
                  </Text>
                  <Field
                    {...focusProps("pwd")}
                    label="No. of PWD / अपाङ्गता भएका व्यक्तिहरूको संख्या"
                    value={pwdText}
                    onChangeText={(value) => setPwdText(digits(value))}
                    keyboardType="number-pad"
                    editable={!busy}
                    placeholder="Enter a count, including 0"
                  />
                </View>
                <Text className="mb-2 text-lg font-semibold text-gray-900">
                  Select attendees
                </Text>
                <Field
                  {...focusProps("search")}
                  label="Search downloaded members"
                  value={query}
                  onChangeText={setQuery}
                  editable={!busy}
                  placeholder="Name, client number or address"
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                <Pressable
                  onPress={() => setSelectedOnly((previous) => !previous)}
                  disabled={busy}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selectedOnly, disabled: busy }}
                  accessibilityLabel="Show selected attendees only"
                  className="mb-2 min-h-12 justify-center rounded-lg bg-blue-50 px-3"
                >
                  <Text className="font-medium text-blue-800">
                    {selectedOnly ? "✓ " : ""}Show selected only (
                    {selected.size})
                  </Text>
                </Pressable>
                {loadingMembers && (
                  <ActivityIndicator
                    accessibilityLabel="Loading downloaded members"
                    color="#2563EB"
                  />
                )}
              </View>
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => toggleMember(item)}
                disabled={busy}
                accessibilityRole="checkbox"
                accessibilityLabel={`Select ${item.memberName}, ${item.clientNo}`}
                accessibilityState={{
                  checked: selected.has(item.clientNo),
                  disabled: busy,
                }}
                className={`mx-4 mb-3 rounded-xl border p-4 ${selected.has(item.clientNo) ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}`}
              >
                <Text className="text-base font-semibold text-gray-900">
                  {selected.has(item.clientNo) ? "✓ " : ""}
                  {item.memberName || "Unnamed member"}
                </Text>
                <Text className="mt-1 text-sm text-gray-600">
                  Client: {item.clientNo}
                </Text>
                <Text className="mt-1 text-sm text-gray-600">
                  {item.address || "Address not available"}
                </Text>
              </Pressable>
            )}
            ListEmptyComponent={
              !loadingMembers ? (
                <Text className="px-6 py-6 text-center text-gray-600">
                  {query || selectedOnly
                    ? "No members match this view."
                    : "No downloaded members available. You can still save visit details as a draft."}
                </Text>
              ) : null
            }
          />
        </View>
        <View
          className="border-t border-gray-200 bg-white px-4 pt-3"
          style={{ paddingBottom: keyboardVisible ? 8 : 24 }}
        >
          {keyboardVisible && (
            <Pressable
              onPress={() => Keyboard.dismiss()}
              accessibilityRole="button"
              accessibilityLabel="Hide keyboard"
              className="mb-2 min-h-11 items-end justify-center"
            >
              <Text className="font-semibold text-blue-700">Hide keyboard</Text>
            </Pressable>
          )}
          {error && (
            <Text
              accessibilityRole="alert"
              accessibilityLiveRegion="assertive"
              className="mb-3 text-sm text-red-700"
            >
              {error}
            </Text>
          )}
          <View className="flex-row">
            <Pressable
              onPress={onCancel}
              disabled={busy}
              accessibilityRole="button"
              accessibilityState={{ disabled: busy }}
              className="mr-3 min-h-12 flex-1 items-center justify-center rounded-xl border border-gray-300"
            >
              <Text className="font-semibold text-gray-700">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => void saveDraft()}
              disabled={busy}
              accessibilityRole="button"
              accessibilityState={{ disabled: busy }}
              className={`min-h-12 flex-1 flex-row items-center justify-center rounded-xl ${busy ? "bg-gray-400" : "bg-blue-600"}`}
            >
              {busy && (
                <ActivityIndicator color="white" style={{ marginRight: 8 }} />
              )}
              <Text className="font-semibold text-white">
                {busy ? "Saving…" : "Save Draft"}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
