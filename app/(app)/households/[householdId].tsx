import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PROVINCES } from "@/src/constants/provinces";
import { Picker } from "@react-native-picker/picker";
import { HOUSING_TYPES } from "@/src/constants/housingTypes";
import * as Location from "expo-location";
import { SubmitHouseholdUseCase } from "@/src/usecases/SubmitHouseholdUseCase";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  householdRepository,
  householdInfoRepository,
} from "@/src/repositories";
import type { Household } from "@/src/repositories/HouseholdRepository";
import type { HouseholdInfo } from "@/src/repositories/HouseholdInfoRepository";

// Helper function for progress bar - use form state instead of Db state
function getSectionProgressFromForm(params: {
  provinceCode: string;
  districtId: string;
  wardNo: string;
  address: string;
  membersCount: string;
  typeOfHousing: string;
  cleanWater: string;
  sanitation: string;
  gpsCoordinates: string;
}) {
  return {
    location: Boolean(
      params.provinceCode &&
      params.districtId &&
      params.wardNo &&
      params.address,
    ),

    members:
      params.membersCount.trim() !== "" &&
      !isNaN(Number(params.membersCount)) &&
      Number(params.membersCount) > 0,

    housing: Boolean(
      params.typeOfHousing && params.cleanWater && params.sanitation,
    ),

    gps: Boolean(params.gpsCoordinates),
  };
}

// for DatePicker
function formatDateYYYYMMDD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function HouseholdDetailScreen() {
  const router = useRouter();
  // const { householdId } = useLocalSearchParams<{ householdId: string }>();
  const params = useLocalSearchParams();
  const householdId =
    typeof params.householdId === "string" ? params.householdId : null;

  const [loading, setLoading] = useState(true);
  const [household, setHousehold] = useState<Household | null>(null);
  const [householdInfo, setHouseholdInfo] = useState<HouseholdInfo | null>(
    null,
  );
  // Adding hydration guard so that it doesn't autosave while running but when only after user interaction
  const [isHydrated, setIsHydrated] = useState(false);

  //   Adding FORM states
  const [dateOfListing, setDateOfListing] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [chwName, setChwName] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [vdcCode, setVdcCode] = useState("");
  const [wardNo, setWardNo] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [address, setAddress] = useState("");
  const [membersCount, setMembersCount] = useState("");
  const [typeOfHousing, setTypeOfHousing] = useState("");
  const [cleanWater, setCleanWater] = useState("");
  const [sanitation, setSanitation] = useState("");
  const [gpsCoordinates, setGpsCoordinates] = useState("");
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // To prevent double Tap submitting.
  const [submitting, setSubmitting] = useState(false);

  // const displayDate = dateOfListing ?? "";
  const isReadOnly = household?.status !== "DRAFT";

  // For Gps coordinate
  async function handleCaptureGPS() {
    try {
      setGpsError(null);
      setGpsLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setGpsError("Location permission denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const lat = location.coords.latitude.toFixed(6);
      const lng = location.coords.longitude.toFixed(6);

      const formatted = `${lat},${lng}`;
      setGpsCoordinates(formatted);
    } catch (error) {
      console.error("GPS capture failed", error);
      setGpsError("Failed to capture GPS location");
    } finally {
      setGpsLoading(false);
    }
  }

  //   Loading household by ID
  useEffect(() => {
    async function loadData() {
      if (!householdId) {
        setLoading(false);
        return;
      }

      try {
        const householdResult =
          await householdRepository.getHouseholdById(householdId);
        setHousehold(householdResult);

        if (householdResult) {
          const info = await householdInfoRepository.getByHouseholdId(
            householdResult.id,
          );
          setHouseholdInfo(info);
        }
      } catch (error) {
        console.error("Failed to load household", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [householdId]);

  // Auto-fill CHW name once when households load.
  useEffect(() => {
    if (!household) return;
    if (chwName) return; // already set, do not overwrite

    // TEMP: replace later with auth user
    const MOCK_CHW_NAME = "Mock Chw Name";

    setChwName(MOCK_CHW_NAME);

    householdInfoRepository.upsertDraft(household.id, {
      nameOfChw: MOCK_CHW_NAME,
      createdBy: household.createdByUserId,
    });
  }, [chwName, household]);

  // Auto-fill Date of Listing with today's date (once)
  useEffect(() => {
    if (!household) return;
    if (dateOfListing) return; // already set, do not overwrite

    const today = new Date();
    const formatted = formatDateYYYYMMDD(today);

    setDateOfListing(formatted);

    householdInfoRepository.upsertDraft(household.id, {
      dateOfListing: formatted,
    });
  }, [dateOfListing, household]);

  //   Initializing form state from DB.
  useEffect(() => {
    if (!householdInfo) {
      setIsHydrated(true);
      return;
    }

    setProvinceCode(
      typeof householdInfo.province === "string" ? householdInfo.province : "",
    );
    setAddress(householdInfo.address ?? "");
    setMembersCount(householdInfo.noOfHouseholdMembers?.toString() ?? "");
    setTypeOfHousing(householdInfo.typeOfHousing ?? "");
    setCleanWater(
      householdInfo.accessToCleanWater === "Y" ||
        householdInfo.accessToCleanWater === "N"
        ? householdInfo.accessToCleanWater
        : "",
    );
    setSanitation(
      householdInfo.accessToSanitation === "Y" ||
        householdInfo.accessToSanitation === "N"
        ? householdInfo.accessToSanitation
        : "",
    );

    setDateOfListing(householdInfo.dateOfListing ?? "");
    setChwName(householdInfo.nameOfChw ?? "");
    setDistrictId(householdInfo.districtId ?? "");
    setVdcCode(householdInfo.vdcnpCode ?? "");
    setWardNo(householdInfo.wardNo ?? "");
    setGpsCoordinates(householdInfo.gpsCoordinates ?? "");

    setIsHydrated(true);
  }, [householdInfo]);

  //   Adding auto-save effect
  useEffect(() => {
    if (!household) return;
    if (household.status !== "DRAFT") return;
    if (!isHydrated) return;

    const members =
      membersCount.trim() !== "" && !isNaN(Number(membersCount))
        ? Number(membersCount)
        : undefined;

    const safeProvince = PROVINCES.some((p) => p.value === provinceCode)
      ? provinceCode
      : undefined;

    const safeWard =
      wardNo.trim() !== "" && !isNaN(Number(wardNo)) ? wardNo : undefined;

    const timeout = setTimeout(() => {
      householdInfoRepository.upsertDraft(household.id, {
        province: safeProvince,
        address: address || undefined,

        dateOfListing: dateOfListing || undefined,
        nameOfChw: chwName || undefined,

        districtId: districtId || undefined,
        vdcnpCode: vdcCode || undefined,
        wardNo: safeWard,

        gpsCoordinates: gpsCoordinates || undefined,

        noOfHouseholdMembers: members,
        typeOfHousing: typeOfHousing || undefined,
        accessToCleanWater: cleanWater || undefined,
        accessToSanitation: sanitation || undefined,
      });
    }, 500);

    return () => clearTimeout(timeout);
  }, [
    household,
    provinceCode,
    address,
    membersCount,
    typeOfHousing,
    cleanWater,
    sanitation,
    isHydrated,
    wardNo,
    dateOfListing,
    chwName,
    districtId,
    vdcCode,
    gpsCoordinates,
  ]);

  if (loading) {
    return (
      <View>
        <Text style={{ marginBottom: 8 }}> Loading household...</Text>
      </View>
    );
  }

  if (!household) {
    return (
      <View>
        <Text>Household not found</Text>
      </View>
    );
  }

  // For submit
  async function handleSubmit() {
    if (!household) return;
    if (submitting) return;

    try {
      setSubmitting(true);

      const useCase = new SubmitHouseholdUseCase();
      await useCase.execute(household.id);

      alert("Household submitted successfully");
      router.replace("/(app)/households");
    } catch (error: any) {
      console.error("Submit failed", error);
      alert(error.message ?? "Failed to submit household");
    } finally {
      setSubmitting(false);
    }
  }

  const sectionProgress = getSectionProgressFromForm({
    provinceCode,
    districtId,
    wardNo,
    address,
    membersCount,
    typeOfHousing,
    cleanWater,
    sanitation,
    gpsCoordinates,
  });

  // For Date
  function handleDateChange(event: any, selectedDate?: Date) {
    setShowDatePicker(false);

    if (!selectedDate || !household) return;

    const formatted = formatDateYYYYMMDD(selectedDate);

    setDateOfListing(formatted);

    householdInfoRepository.upsertDraft(household.id, {
      dateOfListing: formatted,
    });
  }

  const canSubmit = Object.values(sectionProgress).every(Boolean);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress Block */}
        {/* Section Progress Indicator */}
        <View
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            backgroundColor: "white",
            paddingBottom: 8,
          }}
        >
          <View
            style={{
              backgroundColor: "#f8fafc",
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: "#e5e7eb",
            }}
          >
            <Text style={{ fontWeight: "600", marginBottom: 8 }}>
              Form Progress
            </Text>

            <Text>
              {sectionProgress.location ? "✅" : "❌"} Location & Address
            </Text>

            <Text>
              {sectionProgress.members ? "✅" : "❌"} Household Members
            </Text>

            <Text>
              {sectionProgress.housing ? "✅" : "❌"} Housing & Facilities
            </Text>

            <Text>{sectionProgress.gps ? "✅" : "❌"} GPS Location</Text>
          </View>
        </View>

        {/* Household Starts */}
        <Text style={{ fontSize: 20, marginBottom: 10 }}>
          Household Basic Info
        </Text>

        <Text> Household Code: </Text>
        <Text style={{ marginBottom: 16 }}>{household.householdCode}</Text>

        {/* Date of listing */}
        <Text>Date of Listing</Text>

        <Pressable
          onPress={() => setShowDatePicker(true)}
          disabled={isReadOnly}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 12,
            marginBottom: 16,
            backgroundColor: isReadOnly ? "#f3f4f6" : "white",
            borderRadius: 6,
          }}
        >
          <Text style={{ color: dateOfListing ? "#111827" : "#6b7280" }}>
            {dateOfListing ?? "Today (Tap to change)"}
          </Text>
        </Pressable>

        {showDatePicker && Platform.OS === "android" && (
          <DateTimePicker
            value={dateOfListing ? new Date(dateOfListing) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* Chw Name */}
        <Text>Name of CHW</Text>
        <TextInput
          value={chwName}
          // onChangeText={setChwName}
          editable={false}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
            marginBottom: 16,
          }}
        />
        {/* Province */}
        <Text> Province </Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            marginBottom: 16,
          }}
        >
          <Picker
            selectedValue={provinceCode}
            onValueChange={(value) => setProvinceCode(value)}
            enabled={!isReadOnly}
            style={{
              color: "#000",
            }}
          >
            <Picker.Item label="Select Province" value="" />
            {PROVINCES.map((p) => (
              <Picker.Item key={p.value} label={p.label} value={p.value} />
            ))}
          </Picker>
        </View>

        {/* District,VDC,WARD */}
        <Text>District Code</Text>
        <TextInput
          value={districtId}
          onChangeText={setDistrictId}
          editable={!isReadOnly}
          style={{ borderWidth: 1, padding: 10, marginBottom: 16 }}
        />

        <Text>VDC / Municipality Code</Text>
        <TextInput
          value={vdcCode}
          onChangeText={setVdcCode}
          editable={!isReadOnly}
          style={{ borderWidth: 1, padding: 10, marginBottom: 16 }}
        />

        <Text>Ward No</Text>
        <TextInput
          value={wardNo}
          onChangeText={setWardNo}
          keyboardType="numeric"
          editable={!isReadOnly}
          style={{ borderWidth: 1, padding: 10, marginBottom: 16 }}
        />

        <Text>Address</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Enter address"
          editable={!isReadOnly}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
          }}
        />

        {/* GPS Coordinate */}
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            marginVertical: 12,
          }}
        >
          GPS Location
        </Text>

        {gpsCoordinates ? (
          <Text style={{ marginBottom: 8 }}>📍 {gpsCoordinates}</Text>
        ) : (
          <Text style={{ marginBottom: 8, color: "#6b7280" }}>
            GPS not captured yet
          </Text>
        )}

        {gpsError && (
          <Text style={{ color: "red", marginBottom: 8 }}>{gpsError}</Text>
        )}

        <Pressable
          onPress={handleCaptureGPS}
          disabled={gpsLoading || isReadOnly}
          style={{
            backgroundColor: gpsLoading ? "#9ca3af" : "#2563eb",
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>
            {gpsLoading ? "Capturing GPS..." : "Capture GPS"}
          </Text>
        </Pressable>

        {/* Household members */}
        <Text style={{ marginTop: 8 }}>No. of Household Members</Text>
        <TextInput
          value={membersCount}
          onChangeText={setMembersCount}
          keyboardType="numeric"
          editable={!isReadOnly}
          placeholder="e.g. 3"
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
            marginBottom: 16,
          }}
        />

        {/* Types of Housing */}
        <Text>Type of Housing</Text>
        <View style={{ borderWidth: 1, borderColor: "#ccc", marginBottom: 16 }}>
          <Picker
            selectedValue={typeOfHousing}
            onValueChange={setTypeOfHousing}
            enabled={!isReadOnly}
            style={{
              color: "#000",
            }}
          >
            <Picker.Item label="Select housing type" value="" />
            {HOUSING_TYPES.map((h) => (
              <Picker.Item key={h.value} label={h.label} value={h.value} />
            ))}
          </Picker>
        </View>

        {/* Clean Water */}
        <Text>Access to Clean Water</Text>
        <View style={{ borderWidth: 1, borderColor: "#ccc", marginBottom: 16 }}>
          <Picker
            selectedValue={cleanWater}
            onValueChange={setCleanWater}
            enabled={!isReadOnly}
            style={{
              color: "#000",
            }}
          >
            <Picker.Item label="Select option" value="" />
            <Picker.Item label="Yes" value="Y" />
            <Picker.Item label="No" value="N" />
          </Picker>
        </View>

        {/* Access to sanitation */}
        <Text>Access to Sanitation</Text>
        <View style={{ borderWidth: 1, borderColor: "#ccc", marginBottom: 16 }}>
          <Picker
            selectedValue={sanitation}
            onValueChange={setSanitation}
            enabled={!isReadOnly}
            style={{
              color: "#000",
            }}
          >
            <Picker.Item label="Select option" value="" />
            <Picker.Item label="Yes" value="Y" />
            <Picker.Item label="No" value="N" />
          </Picker>
        </View>

        {/* Compact progress indicator near submit */}
        <View
          style={{
            marginTop: 16,
            marginBottom: 8,
            paddingVertical: 8,
            borderTopWidth: 1,
            borderColor: "#e5e7eb",
          }}
        >
          <Text
            style={{
              textAlign: "center",
              color: canSubmit ? "#16a34a" : "#b45309",
              fontSize: 14,
            }}
          >
            Progress: {Object.values(sectionProgress).filter(Boolean).length}
            /4 sections complete
          </Text>
        </View>

        {/* Submit Button */}
        {!isReadOnly && (
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit || submitting}
            style={{
              backgroundColor: submitting ? "#9ca3af" : "#16a34a",
              paddingVertical: 14,
              borderRadius: 8,
              marginTop: 24,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
              {submitting ? "Submitting..." : "Submit Household"}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
