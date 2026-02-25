import React, { useEffect } from "react";
import { View, Text, TextInput } from "react-native";
import { MemberFormState } from "../../models/MemberFormState";
import { FormDropdown } from "../FormDropdown";
import { districtOptions } from "../../master/memberMasterData";
import { BSDateInput } from "../BSDateInput";

interface Props {
  form: MemberFormState;
  updateField: <K extends keyof MemberFormState>(
    key: K,
    value: MemberFormState[K],
  ) => void;
  errors?: Record<string, string>;
}

export function IdentityStep({ form, updateField, errors }: Props) {
  const isMinor = form.minorYn;

  // Auto-set document type
  useEffect(() => {
    if (!form.idDocumentType) {
      updateField("idDocumentType", "CITIZENSHIP");
    }
  }, [form.idDocumentType, updateField]);

  return (
    <View className="space-y-4">
      {/* Status Card */}
      <View className="border border-gray-200 rounded-lg p-3 bg-gray-50 mb-2">
        <Text className="font-semibold">
          {isMinor ? "Minor (<18)" : "Adult (18+)"}
        </Text>
        <Text className="text-xs text-gray-600 mt-1">
          {isMinor
            ? "Citizenship details are optional."
            : "Citizenship details are required."}
        </Text>
      </View>

      {/* Citizenship Number */}
      <View>
        <Text className="mb-1 font-medium">
          Citizenship Number {isMinor ? "" : "*"}
        </Text>
        <TextInput
          className="border rounded-lg px-3 py-2"
          value={form.idDocumentNo}
          onChangeText={(text) => updateField("idDocumentNo", text.trim())}
          placeholder="Enter citizenship number"
        />
      </View>
      {errors?.idDocumentNo && (
        <Text className="text-red-500 text-xs mt-1">{errors.idDocumentNo}</Text>
      )}

      {/* Issue District */}
      <FormDropdown
        label={`Issued District ${isMinor ? "" : "*"}`}
        value={form.idIssueDistrictCode}
        options={districtOptions}
        onChange={(val) => updateField("idIssueDistrictCode", val)}
      />
      {errors?.idIssueDistrictCode && (
        <Text className="text-red-500 text-xs mt-1">
          {errors.idIssueDistrictCode}
        </Text>
      )}

      {/* Issue Date */}
      <BSDateInput
        label={`Issued Date (B.S.) ${isMinor ? "" : "*"}`}
        adValue={form.memIdIssueDate}
        onChangeAD={(adIso) => updateField("memIdIssueDate", adIso)}
      />
      {errors?.memIdIssueDate && (
        <Text className="text-red-500 text-xs mt-1">
          {errors.memIdIssueDate}
        </Text>
      )}
    </View>
  );
}
