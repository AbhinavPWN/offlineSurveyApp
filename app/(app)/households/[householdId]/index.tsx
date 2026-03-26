import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
  Animated,
  Modal,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { HOUSING_TYPES } from "@/src/constants/housingTypes";
// import { LUMBINI_DISTRICTS } from "@/src/constants/lumbiniLocations";
import { LABELS } from "@/src/constants/labels";

import {
  householdLocalRepository,
  // householdInfoRepository,
  householdMemberLocalRepository,
} from "@/src/di/container";
import type { HouseholdLocal } from "@/src/models/household.model";
import { useAuth } from "@/src/auth/context/useAuth";
import { ValidateHouseholdMembersForSubmitUseCase } from "@/src/usecases/household/ValidateHouseholdMembersForSubmitUseCase";
import { SubmitHouseholdUseCase } from "@/src/usecases/household/SubmitHouseholdUseCase";
import {
  getMunicipalitiesByDistrict,
  getAllowedDistricts,
} from "@/src/repositories/addressRepository";

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

type SelectOption = {
  label: string;
  value: string;
};

function SimpleSelect({
  value,
  options,
  onChange,
  placeholder = "Select option",
  disabled = false,
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? placeholder;

  return (
    <>
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
        className={`border rounded p-3 mb-3 ${disabled ? "bg-gray-100" : "bg-white"}`}
      >
        <Text className={value ? "text-black" : "text-gray-500"}>
          {selectedLabel}
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center px-4">
          <View className="bg-white rounded-xl max-h-[70%] overflow-hidden">
            <View className="px-4 py-3 border-b border-gray-200 flex-row justify-between items-center">
              <Text className="font-semibold">Select Option</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Text className="text-blue-600">Close</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => `${item.value}-${item.label}`}
              renderItem={({ item }) => {
                const isSelected = item.value === value;

                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    className={`px-4 py-3 border-b border-gray-100 ${isSelected ? "bg-blue-50" : "bg-white"}`}
                  >
                    <Text
                      className={isSelected ? "text-blue-700" : "text-black"}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

function normalizeServerDate(date?: string | null): string {
  if (!date) return "";

  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  // Convert DD-MMM-YYYY → YYYY-MM-DD
  const match = date.match(/^(\d{1,2})-([A-Z]{3})-(\d{4})$/i);
  if (!match) return "";

  const day = match[1].padStart(2, "0");
  const monthStr = match[2].toUpperCase();
  const year = match[3];

  const monthMap: Record<string, string> = {
    JAN: "01",
    FEB: "02",
    MAR: "03",
    APR: "04",
    MAY: "05",
    JUN: "06",
    JUL: "07",
    AUG: "08",
    SEP: "09",
    OCT: "10",
    NOV: "11",
    DEC: "12",
  };

  const month = monthMap[monthStr];
  if (!month) return "";

  return `${year}-${month}-${day}`;
}

export default function HouseholdDetailScreen() {
  const router = useRouter();
  const { chwProfile } = useAuth();
  const params = useLocalSearchParams();

  const localId =
    typeof params.householdId === "string" ? params.householdId : null;

  const [loading, setLoading] = useState(true);
  const [household, setHousehold] = useState<HouseholdLocal | null>(null);
  // const isReadOnly = household?.syncStatus === "SYNCED";
  // const isReadOnly = household?.syncStatus === "PENDING";
  const isReadOnly = false;

  const progressAnim = useRef(new Animated.Value(0)).current;

  // ---------------- FORM STATE ----------------
  const [dateOfListing, setDateOfListing] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [chwName, setChwName] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [vdcnpCode, setVdcnpCode] = useState("");
  const [wardNo, setWardNo] = useState("");
  const [address, setAddress] = useState("");
  const [membersCount, setMembersCount] = useState("");
  const [typeOfHousing, setTypeOfHousing] = useState("");
  const [cleanWater, setCleanWater] = useState<"Y" | "N" | "">("");
  const [sanitation, setSanitation] = useState<"Y" | "N" | "">("");
  const [gpsCoordinates, setGpsCoordinates] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialSnapshot, setInitialSnapshot] =
    useState<Partial<HouseholdLocal> | null>(null);

  // local dropdown state
  const [districtOptions, setDistrictOptions] = useState<any[]>([]);
  const [municipalityOptions, setMunicipalityOptions] = useState<any[]>([]);
  // State for member
  const [memberSummary, setMemberSummary] = useState({
    total: 0,
    headCount: 0,
    pendingCount: 0,
    failedCount: 0,
  });

  // Load districts
  useEffect(() => {
    async function loadDistricts() {
      const districts = await getAllowedDistricts();
      setDistrictOptions(districts);
    }

    loadDistricts();
  }, []);

  // Load municipalities
  useEffect(() => {
    async function loadMunicipalities() {
      if (!districtCode) {
        setMunicipalityOptions([]);
        return;
      }

      const municipalities = await getMunicipalitiesByDistrict(districtCode);
      setMunicipalityOptions(municipalities);
    }

    loadMunicipalities();
  }, [districtCode]);

  // ---------------- LOAD ----------------
  useEffect(() => {
    async function load() {
      if (!localId) return;

      const result = await householdLocalRepository.getByLocalId(localId);

      if (!result) {
        setLoading(false);
        return;
      }

      setHousehold(result);

      setInitialSnapshot({
        dateoflistingAD: result.dateoflistingAD,
        provinceCode: result.provinceCode,
        districtCode: result.districtCode,
        vdcnpCode: result.vdcnpCode,
        wardNo: result.wardNo,
        address: result.address,
        noofHHMembers: result.noofHHMembers,
        typeofHousing: result.typeofHousing,
        accesstoCleanWater: result.accesstoCleanWater,
        accesstoSanitation: result.accesstoSanitation,
        gpsCoordinates:
          result.gpsCoordinates && result.gpsCoordinates !== "0"
            ? result.gpsCoordinates
            : "",
      });

      // now set form state
      setDateOfListing(normalizeServerDate(result.dateoflistingAD));
      setProvinceCode("5");
      setDistrictCode(result.districtCode ?? "");
      setVdcnpCode(result.vdcnpCode ?? "");
      setWardNo(result.wardNo ?? "");
      setAddress(result.address ?? "");
      setMembersCount(result.noofHHMembers?.toString() ?? "");
      setTypeOfHousing(result.typeofHousing ?? "");
      setCleanWater(result.accesstoCleanWater ?? "");
      setSanitation(result.accesstoSanitation ?? "");
      setGpsCoordinates(
        result.gpsCoordinates && result.gpsCoordinates !== "0"
          ? result.gpsCoordinates
          : "",
      );

      if (chwProfile) {
        setChwName(chwProfile.userName);
      }

      setLoading(false);
    }

    load();
  }, [chwProfile, localId]);

  // Load members
  useEffect(() => {
    async function loadMembers() {
      if (!household) return;

      const members = await householdMemberLocalRepository.listByHousehold(
        household.localId,
      );

      setMemberSummary({
        total: members.length,
        headCount: members.filter((m) => m.headHousehold === "Y").length,
        pendingCount: members.filter((m) => m.syncStatus === "PENDING").length,
        failedCount: members.filter((m) => m.syncStatus === "FAILED").length,
      });
    }

    loadMembers();
  }, [household]);

  // ---------------- AUTO SAVE ----------------
  useEffect(() => {
    if (!household) return;

    const timeout = setTimeout(async () => {
      // 1️⃣ Always update draft fields
      await householdLocalRepository.updateDraft(household.localId, {
        dateoflistingAD: dateOfListing,
        provinceCode,
        districtCode,
        vdcnpCode,
        wardNo,
        address,
        noofHHMembers:
          membersCount.trim() !== "" && !isNaN(Number(membersCount))
            ? Number(membersCount)
            : 1,
        typeofHousing: typeOfHousing as any,
        accesstoCleanWater: cleanWater as any,
        accesstoSanitation: sanitation as any,
        gpsCoordinates,
      });

      function hasChanges(): boolean {
        if (!initialSnapshot) return false;

        const currentState = {
          dateoflistingAD: dateOfListing,
          provinceCode,
          districtCode,
          vdcnpCode,
          wardNo,
          address,
          noofHHMembers: Number(membersCount),
          typeofHousing: typeOfHousing,
          accesstoCleanWater: cleanWater,
          accesstoSanitation: sanitation,
          gpsCoordinates,
        };

        return JSON.stringify(currentState) !== JSON.stringify(initialSnapshot);
      }

      // 2️⃣ Only promote SYNCED → PENDING once
      if (
        household.syncStatus === "SYNCED" &&
        household.syncAction === null &&
        hasChanges()
      ) {
        await householdLocalRepository.markPending(household.localId, "UPDATE");

        const updated = await householdLocalRepository.getByLocalId(
          household.localId,
        );
        if (updated) setHousehold(updated);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [
    dateOfListing,
    provinceCode,
    districtCode,
    vdcnpCode,
    wardNo,
    address,
    membersCount,
    typeOfHousing,
    cleanWater,
    sanitation,
    household,
    gpsCoordinates,
    initialSnapshot,
  ]);

  // ---------------- VALIDATION ----------------
  function validate() {
    const newErrors: Record<string, string> = {};

    // Date
    if (!dateOfListing) {
      newErrors.date = "Date of listing is required";
    } else if (isNaN(Date.parse(dateOfListing))) {
      newErrors.date = "Invalid date format";
    }

    // CHW
    if (!chwProfile?.userName) {
      newErrors.chw = "CHW identity missing. Please re-login.";
    }

    // Province
    if (provinceCode !== "5") {
      newErrors.province = "Province must be Lumbini";
    }

    // District
    // const selectedDistrict = LUMBINI_DISTRICTS.find(
    //   (d) => String(d.code) === String(districtCode),
    // );

    // if (!districtCode || !selectedDistrict) {
    //   newErrors.district = "Valid district required";
    // }
    if (!districtCode) {
      newErrors.district = "District required";
    }

    // Municipality
    if (!vdcnpCode) {
      newErrors.vdc = "Municipality required";
    }

    // Ward
    const wardNumber = Number(wardNo);
    if (!wardNo || isNaN(wardNumber) || wardNumber < 1 || wardNumber > 32) {
      newErrors.ward = "Ward must be between 1 and 32";
    }

    // Address
    if (!address || address.trim().length < 3) {
      newErrors.address = "Address too short";
    }

    // Members
    const members = Number(membersCount);
    if (!membersCount || isNaN(members) || members < 1 || members > 50) {
      newErrors.members = "Members must be between 1 and 50";
    }

    // Housing
    const validHousing = HOUSING_TYPES.some((h) => h.value === typeOfHousing);
    if (!typeOfHousing || !validHousing) {
      newErrors.housing = "Select valid housing type";
    }

    // Water
    if (cleanWater !== "Y" && cleanWater !== "N") {
      newErrors.water = "Select water access";
    }

    // Sanitation
    if (sanitation !== "Y" && sanitation !== "N") {
      newErrors.sanitation = "Select sanitation access";
    }

    // GPS
    const gpsRegex = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;
    if (!gpsCoordinates || !gpsRegex.test(gpsCoordinates)) {
      newErrors.gps = "Valid GPS required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const validateMembersUseCase = useMemo(
    () =>
      new ValidateHouseholdMembersForSubmitUseCase(
        householdMemberLocalRepository,
      ),
    [],
  );

  const submitUseCase = useMemo(
    () =>
      new SubmitHouseholdUseCase(
        householdLocalRepository,
        // householdInfoRepository,
        householdMemberLocalRepository,
      ),
    [],
  );

  function buildValidationMessage(errors: any) {
    const messages: string[] = [];

    if (errors.noMembers) messages.push("• " + errors.noMembers);

    if (errors.headMissing) messages.push("• " + errors.headMissing);

    if (errors.multipleHeads) messages.push("• " + errors.multipleHeads);

    if (errors.failedMembers) messages.push("• " + errors.failedMembers);

    if (errors.draftMembers) messages.push("• " + errors.draftMembers);

    return messages.join("\n");
  }

  // ---------------- SUBMIT ----------------
  async function handleSubmit() {
    if (!household) return;

    // Skip if already synced and no local changes
    if (household.syncStatus === "SYNCED" && household.syncAction === null) {
      Alert.alert("Already Synced", "No changes to submit.");
      return;
    }

    if (!validate()) {
      Alert.alert("Incomplete Form", "Please fix the highlighted fields.");
      return;
    }

    // Validate household members
    const memberValidation = await validateMembersUseCase.execute({
      householdLocalId: household.localId,
    });

    if (!memberValidation.valid) {
      const message = buildValidationMessage(memberValidation.errors);

      Alert.alert("Cannot Submit", message);
      return;
    }

    // Confirm Submission
    Alert.alert(
      "Confirm Submission",
      "Once submitted, this household and its members will be queued for sync. Please ensure all information is correct.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm & Submit",
          onPress: async () => {
            try {
              await submitUseCase.execute({
                localId: household.localId,
              });

              Alert.alert("Success", "Marked for sync.");
              router.back();
            } catch (error: any) {
              Alert.alert(
                "Submission Failed",
                error?.message ?? "Something went wrong.",
              );
            }
          },
        },
      ],
    );
  }

  // ---------------- GPS ----------------
  async function handleCaptureGPS() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const lat = location.coords.latitude.toFixed(6);
    const lng = location.coords.longitude.toFixed(6);
    // const acc = location.coords.accuracy?.toFixed(1);

    const formatted = `${lat},${lng}`;

    setGpsCoordinates(formatted);
  }

  // Progress Calculation
  const completedSections = [
    dateOfListing,
    provinceCode,
    districtCode,
    vdcnpCode,
    wardNo,
    address,
    membersCount,
    typeOfHousing,
    cleanWater,
    sanitation,
    gpsCoordinates,
  ].filter(Boolean).length;

  const totalSections = 11;
  const progress = completedSections / totalSections;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!household) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Household not found</Text>
      </View>
    );
  }

  // ---------------- UI ----------------
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen options={{ title: "Household Details" }} />
      {/* ---------------- STICKY HEADER ---------------- */}
      <View className="bg-white px-4 pt-4 pb-3 shadow-sm">
        {/* Sync Status Banner */}
        <View
          className={`p-3 rounded-lg mb-3 ${
            household.syncStatus === "SYNCED"
              ? "bg-green-100 border border-green-300"
              : household.syncStatus === "PENDING"
                ? "bg-yellow-100 border border-yellow-300"
                : "bg-red-100 border border-red-300"
          }`}
        >
          <Text
            className={`font-semibold ${
              household.syncStatus === "SYNCED"
                ? "text-green-700"
                : household.syncStatus === "PENDING"
                  ? "text-yellow-700"
                  : "text-red-700"
            }`}
          >
            {household.syncStatus === "SYNCED"
              ? "Synced with server"
              : household.syncStatus === "PENDING"
                ? "Waiting to sync"
                : "Sync failed"}
          </Text>
        </View>

        {/* Progress Bar */}
        <View>
          <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <Animated.View
              style={{
                height: 12,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
                backgroundColor: "#2563eb",
              }}
            />
          </View>

          <Text className="text-sm text-gray-600 mt-2">
            {completedSections}/{totalSections} fields completed
          </Text>
        </View>
      </View>

      {/* ---------------- FORM BODY ---------------- */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* TITLE */}
        <Text className="text-xl font-bold mb-6 text-gray-900">
          {LABELS.householdInformation}
        </Text>

        {/* ---------------- BASIC INFO CARD ---------------- */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
          <Text className="text-lg font-semibold mb-4 text-gray-800">
            {LABELS.basicInformation}
          </Text>

          <Text className="text-gray-700 mb-1">{LABELS.dateOfListing}</Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            // disabled={true}
            className={`border p-3 rounded mb-2 ${
              isReadOnly ? "bg-gray-100" : "bg-white"
            }`}
          >
            <Text>{dateOfListing || "Select Date"}</Text>
          </Pressable>

          {errors.date && (
            <Text className="text-red-500 text-sm mt-1 mb-2">
              {errors.date}
            </Text>
          )}

          {showDatePicker && (
            <DateTimePicker
              value={dateOfListing ? new Date(dateOfListing) : new Date()}
              mode="date"
              onChange={(e, date) => {
                setShowDatePicker(false);
                if (date) setDateOfListing(formatDate(date));
              }}
            />
          )}

          <Text className="text-gray-700 mt-4 mb-1">{LABELS.chwName}</Text>
          <TextInput
            value={chwName}
            editable={true}
            className="border p-3 rounded bg-gray-100"
          />
        </View>

        {/* ---------------- LOCATION CARD ---------------- */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
          <Text className="text-lg font-semibold mb-4 text-gray-800">
            {LABELS.locationDetails}
          </Text>

          {/* Province */}
          <Text className="text-gray-700 mb-1">{LABELS.province}</Text>
          {/* <SimpleSelect
            value={provinceCode}
            onChange={setProvinceCode}
            options={[{ label: "Lumbini Pradesh", value: "5" }]}
            placeholder="Select Province"
          /> */}
          <Text className="border p-3 rounded bg-gray-100 mb-2">
            Lumbini (लुम्बिनी)
          </Text>

          {errors.province && (
            <Text className="text-red-500 text-sm mt-1 mb-2">
              {errors.province}
            </Text>
          )}

          {/* District */}
          <Text className="text-gray-700 mb-1">{LABELS.district}</Text>
          <SimpleSelect
            value={districtCode}
            onChange={(value) => {
              setDistrictCode(value);
              setVdcnpCode("");
            }}
            options={[
              { label: "Select District / जिल्ला छान्नुहोस्", value: "" },
              ...districtOptions.map((d) => ({
                label: `${d.name_en} (${d.name_np})`,
                value: String(d.id),
              })),
            ]}
            placeholder="Select District"
          />
          {errors.district && (
            <Text className="text-red-500 text-sm mt-1 mb-2">
              {errors.district}
            </Text>
          )}

          {/* Municipality */}
          <Text className="text-gray-700 mb-1">{LABELS.municipality}</Text>
          <SimpleSelect
            value={vdcnpCode}
            onChange={(value) => setVdcnpCode(String(value))}
            options={[
              { label: "Select Municipality / पालिका छान्नुहोस्", value: "" },
              ...municipalityOptions.map((m) => ({
                label: `${m.name_en} (${m.name_np})`,
                value: String(m.id),
              })),
            ]}
            placeholder="Select Municipality"
            disabled={districtCode === ""}
          />
          {errors.vdc && (
            <Text className="text-red-500 text-sm mt-1 mb-2">{errors.vdc}</Text>
          )}

          {/* Ward */}
          <Text className="text-gray-700 mb-1">{LABELS.wardNo}</Text>
          <TextInput
            value={wardNo}
            onChangeText={setWardNo}
            editable={true}
            keyboardType="numeric"
            className="border p-3 rounded mb-3"
          />
          {errors.ward && (
            <Text className="text-red-500 text-sm mt-1 mb-2">
              {errors.ward}
            </Text>
          )}

          {/* Address */}
          <Text className="text-gray-700 mb-1">{LABELS.address}</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            editable={true}
            className="border p-3 rounded mb-1"
          />
          {errors.address && (
            <Text className="text-red-500 text-sm mt-1 mb-2">
              {errors.address}
            </Text>
          )}
        </View>

        {/* ---------------- HOUSEHOLD CARD ---------------- */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
          <Text className="text-lg font-semibold mb-4 text-gray-800">
            {LABELS.householdDetails}
          </Text>

          <Text className="text-gray-700 mb-1">{LABELS.householdMembers}</Text>
          <TextInput
            value={membersCount}
            onChangeText={setMembersCount}
            editable={true}
            keyboardType="numeric"
            className="border p-3 rounded mb-3"
          />
          {errors.members && (
            <Text className="text-red-500 text-sm mt-1 mb-2">
              {errors.members}
            </Text>
          )}

          <Text className="text-gray-700 mb-1">{LABELS.housingType}</Text>
          <SimpleSelect
            value={typeOfHousing}
            onChange={setTypeOfHousing}
            options={[
              { label: "Select type", value: "" },
              ...HOUSING_TYPES.map((h) => ({
                label: h.label,
                value: h.value,
              })),
            ]}
            placeholder="Select type"
          />
          {errors.housing && (
            <Text className="text-red-500 text-sm mt-1 mb-2">
              {errors.housing}
            </Text>
          )}

          <Text className="text-gray-700 mb-1">{LABELS.cleanWater}</Text>
          <SimpleSelect
            value={cleanWater}
            onChange={(value) => setCleanWater(value as "Y" | "N" | "")}
            options={[
              { label: "Select option", value: "" },
              { label: "Yes", value: "Y" },
              { label: "No", value: "N" },
            ]}
            placeholder="Select option"
          />
          {errors.water && (
            <Text className="text-red-500 text-sm mt-1 mb-2">
              {errors.water}
            </Text>
          )}

          <Text className="text-gray-700 mb-1">{LABELS.sanitation}</Text>
          <SimpleSelect
            value={sanitation}
            onChange={(value) => setSanitation(value as "Y" | "N" | "")}
            options={[
              { label: "Select option", value: "" },
              { label: "Yes", value: "Y" },
              { label: "No", value: "N" },
            ]}
            placeholder="Select option"
          />
          {errors.sanitation && (
            <Text className="text-red-500 text-sm mt-1 mb-2">
              {errors.sanitation}
            </Text>
          )}
        </View>

        {/* ---------------- GPS CARD ---------------- */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <Text className="text-lg font-semibold mb-4 text-gray-800">
            {LABELS.gpsVerification}
          </Text>

          <Pressable
            onPress={handleCaptureGPS}
            // disabled={true}
            className={`p-4 rounded-xl ${
              isReadOnly ? "bg-gray-400" : "bg-blue-600"
            }`}
          >
            <Text className="text-white text-center">{LABELS.captureGPS}</Text>
          </Pressable>

          {gpsCoordinates ? (
            <View className="bg-green-100 border border-green-300 p-3 rounded-lg mt-3">
              <Text className="text-green-700 font-medium">
                {LABELS.gpsCaptured}
              </Text>
              <Text className="text-green-800 text-sm mt-1">
                {gpsCoordinates}
              </Text>
            </View>
          ) : (
            <View className="bg-gray-100 border border-gray-300 p-3 rounded-lg mt-3">
              <Text className="text-gray-600">{LABELS.gpsNotCaptured}</Text>
            </View>
          )}
        </View>
        {errors.gps && (
          <Text className="text-red-500 text-sm mt-1 mb-2">{errors.gps}</Text>
        )}

        {/* ---------------- MEMBERS SUMMARY ---------------- */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <Text className="text-lg font-semibold mb-4 text-gray-800">
            {LABELS.householdMembers}
          </Text>

          <Text>Total Members: {memberSummary.total}</Text>
          <Text>
            Head Selected: {memberSummary.headCount === 1 ? "Yes" : "No"}
          </Text>
          <Text>Pending Members: {memberSummary.pendingCount}</Text>
          <Text>Failed Members: {memberSummary.failedCount}</Text>

          <Pressable
            onPress={() =>
              router.push(`/households/${household.localId}/members`)
            }
            className="mt-4 p-3 bg-blue-600 rounded-xl"
          >
            <Text className="text-white text-center font-semibold">
              {LABELS.addManageMembers}
            </Text>
          </Pressable>
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          disabled={isReadOnly}
          className={`p-4 rounded-xl ${
            isReadOnly ? "bg-gray-400" : "bg-green-600"
          }`}
        >
          <Text className="text-white text-center font-semibold">
            {LABELS.saveAndSync}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
