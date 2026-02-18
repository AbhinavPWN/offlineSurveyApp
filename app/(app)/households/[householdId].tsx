import React, { useEffect, useState, useRef } from "react";
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
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { HOUSING_TYPES } from "@/src/constants/housingTypes";
import { LUMBINI_DISTRICTS } from "@/src/constants/lumbiniLocations";

import { householdLocalRepository } from "@/src/di/container";
import type { HouseholdLocal } from "@/src/models/household.model";
import { useAuth } from "@/src/auth/context/useAuth";

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
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

  // ---------------- LOAD ----------------
  useEffect(() => {
    async function load() {
      if (!localId) return;

      const result = await householdLocalRepository.getByLocalId(localId);
      setHousehold(result);

      if (result) {
        setDateOfListing(result.dateoflistingAD ?? "");
        setProvinceCode("5");
        setDistrictCode(result.districtCode ?? "");
        setVdcnpCode(result.vdcnpCode ?? "");
        setWardNo(result.wardNo ?? "");
        setAddress(result.address ?? "");
        setMembersCount(result.noofHHMembers?.toString() ?? "");
        setTypeOfHousing(result.typeofHousing ?? "");
        setCleanWater(result.accesstoCleanWater ?? "");
        setSanitation(result.accesstoSanitation ?? "");
        setGpsCoordinates(result.gpsCoordinates ?? "");
      }

      if (chwProfile) {
        setChwName(chwProfile.userName);
      }

      setLoading(false);
    }

    load();
  }, [chwProfile, localId]);

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
            : 0,
        typeofHousing: typeOfHousing as any,
        accesstoCleanWater: cleanWater as any,
        accesstoSanitation: sanitation as any,
        gpsCoordinates,
      });

      // 2️⃣ Only promote SYNCED → PENDING once
      if (household.syncStatus === "SYNCED" && household.syncAction === null) {
        await householdLocalRepository.markPending(household.localId, "UPDATE");
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
    const selectedDistrict = LUMBINI_DISTRICTS.find(
      (d) => String(d.code) === String(districtCode),
    );

    if (!districtCode || !selectedDistrict) {
      newErrors.district = "Valid district required";
    }

    // Municipality
    const validMunicipality = selectedDistrict?.municipalities.find(
      (m) => String(m.code) === String(vdcnpCode),
    );

    if (!vdcnpCode || !validMunicipality) {
      newErrors.vdc = "Valid municipality required";
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

  // ---------------- SUBMIT ----------------
  async function handleSubmit() {
    if (!household) return;

    if (!validate()) {
      Alert.alert("Incomplete Form", "Please fix the highlighted fields.");
      return;
    }

    const action = household.householdId ? "UPDATE" : "INSERT";

    await householdLocalRepository.updateDraft(household.localId, {
      dateoflistingAD: dateOfListing,
      provinceCode,
      districtCode,
      vdcnpCode,
      wardNo,
      address,
      noofHHMembers: Number(membersCount),
      typeofHousing: typeOfHousing as "P" | "S" | "T",
      accesstoCleanWater: cleanWater as "Y" | "N",
      accesstoSanitation: sanitation as "Y" | "N",
      gpsCoordinates,
    });

    await householdLocalRepository.markPending(household.localId, action);

    Alert.alert("Saved", "Marked for sync.");
    router.back();
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

  const selectedDistrict = LUMBINI_DISTRICTS.find(
    (d) => String(d.code) === String(districtCode),
  );
  // console.log("districtCode:", districtCode);
  // console.log("selectedDistrict:", selectedDistrict);

  // ---------------- UI ----------------
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
          Household Information
        </Text>

        {/* ---------------- BASIC INFO CARD ---------------- */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
          <Text className="text-lg font-semibold mb-4 text-gray-800">
            Basic Information
          </Text>

          <Text className="text-gray-700 mb-1">Date of Listing</Text>
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

          <Text className="text-gray-700 mt-4 mb-1">CHW Name</Text>
          <TextInput
            value={chwName}
            editable={true}
            className="border p-3 rounded bg-gray-100"
          />
        </View>

        {/* ---------------- LOCATION CARD ---------------- */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
          <Text className="text-lg font-semibold mb-4 text-gray-800">
            Location Details
          </Text>

          {/* Province */}
          <Text className="text-gray-700 mb-1">Province</Text>
          <View className="border rounded mb-3 bg-white">
            <Picker
              selectedValue={provinceCode}
              enabled={true}
              onValueChange={setProvinceCode}
              style={{ height: 50, color: "#000" }}
            >
              <Picker.Item label="Lumbini Pradesh" value="5" />
            </Picker>
          </View>

          {errors.province && (
            <Text className="text-red-500 text-sm mt-1 mb-2">
              {errors.province}
            </Text>
          )}

          {/* District */}
          <Text className="text-gray-700 mb-1">District</Text>
          <View className="border rounded mb-3 bg-white">
            <Picker
              selectedValue={districtCode}
              enabled={true}
              onValueChange={(value) => {
                setDistrictCode(value);
                setVdcnpCode("");
              }}
              style={{ height: 50, color: "#000" }}
            >
              <Picker.Item label="Select District" value="" />
              {LUMBINI_DISTRICTS.map((d) => (
                <Picker.Item key={d.code} label={d.name} value={d.code} />
              ))}
            </Picker>
          </View>
          {errors.district && (
            <Text className="text-red-500 text-sm mt-1 mb-2">
              {errors.district}
            </Text>
          )}

          {/* Municipality */}
          <Text className="text-gray-700 mb-1">Municipality / VDC</Text>
          <View className="border rounded mb-3 bg-white">
            <Picker
              selectedValue={vdcnpCode}
              enabled={true && districtCode !== ""}
              onValueChange={(value) => setVdcnpCode(String(value))}
              style={{ height: 50, color: "#000" }}
            >
              <Picker.Item label="Select Municipality" value="" />
              {selectedDistrict &&
                selectedDistrict.municipalities.map((m) => (
                  <Picker.Item key={m.code} label={m.name} value={m.code} />
                ))}
            </Picker>
          </View>
          {errors.vdc && (
            <Text className="text-red-500 text-sm mt-1 mb-2">{errors.vdc}</Text>
          )}

          {/* Ward */}
          <Text className="text-gray-700 mb-1">Ward No</Text>
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
          <Text className="text-gray-700 mb-1">Address</Text>
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
            Household Details
          </Text>

          <Text className="text-gray-700 mb-1">No. of Household Members</Text>
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

          <Text className="text-gray-700 mb-1">Housing Type</Text>
          <View className="border rounded mb-3 bg-white">
            <Picker
              selectedValue={typeOfHousing}
              enabled={true}
              onValueChange={setTypeOfHousing}
              style={{ height: 50, color: "#000" }}
            >
              <Picker.Item label="Select type" value="" />
              {HOUSING_TYPES.map((h) => (
                <Picker.Item key={h.value} label={h.label} value={h.value} />
              ))}
            </Picker>
          </View>
          {errors.housing && (
            <Text className="text-red-500 text-sm mt-1 mb-2">
              {errors.housing}
            </Text>
          )}

          <Text className="text-gray-700 mb-1">Access to Clean Water</Text>
          <View className="border rounded mb-3 bg-white">
            <Picker
              selectedValue={cleanWater}
              enabled={true}
              onValueChange={setCleanWater}
              style={{ height: 50, color: "#000" }}
            >
              <Picker.Item label="Select option" value="" />
              <Picker.Item label="Yes" value="Y" />
              <Picker.Item label="No" value="N" />
            </Picker>
          </View>
          {errors.water && (
            <Text className="text-red-500 text-sm mt-1 mb-2">
              {errors.water}
            </Text>
          )}

          <Text className="text-gray-700 mb-1">Access to Sanitation</Text>
          <View className="border rounded bg-white">
            <Picker
              selectedValue={sanitation}
              enabled={true}
              onValueChange={setSanitation}
              style={{ height: 50, color: "#000" }}
            >
              <Picker.Item label="Select option" value="" />
              <Picker.Item label="Yes" value="Y" />
              <Picker.Item label="No" value="N" />
            </Picker>
          </View>
          {errors.sanitation && (
            <Text className="text-red-500 text-sm mt-1 mb-2">
              {errors.sanitation}
            </Text>
          )}
        </View>

        {/* ---------------- GPS CARD ---------------- */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <Text className="text-lg font-semibold mb-4 text-gray-800">
            GPS Verification
          </Text>

          <Pressable
            onPress={handleCaptureGPS}
            // disabled={true}
            className={`p-4 rounded-xl ${
              isReadOnly ? "bg-gray-400" : "bg-blue-600"
            }`}
          >
            <Text className="text-white text-center">Capture GPS</Text>
          </Pressable>

          {gpsCoordinates ? (
            <View className="bg-green-100 border border-green-300 p-3 rounded-lg mt-3">
              <Text className="text-green-700 font-medium">
                GPS Captured Successfully
              </Text>
              <Text className="text-green-800 text-sm mt-1">
                {gpsCoordinates}
              </Text>
            </View>
          ) : (
            <View className="bg-gray-100 border border-gray-300 p-3 rounded-lg mt-3">
              <Text className="text-gray-600">GPS not captured yet</Text>
            </View>
          )}
        </View>
        {errors.gps && (
          <Text className="text-red-500 text-sm mt-1 mb-2">{errors.gps}</Text>
        )}

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          // disabled={isReadOnly}
          className={`p-4 rounded-xl ${
            isReadOnly ? "bg-gray-400" : "bg-green-600"
          }`}
        >
          <Text className="text-white text-center font-semibold">
            Save & Mark for Sync
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
