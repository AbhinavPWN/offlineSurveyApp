import React from "react";
import { View, Text, TextInput } from "react-native";
import { MemberFormState } from "../../models/MemberFormState";
import { FormDropdown } from "../FormDropdown";
import {
  genderOptions,
  maritalStatusOptions,
  relationToHHOptions,
} from "../../master/memberMasterData";
import { BSDateInput } from "../BSDateInput";
import { calculateAgeFromISO } from "@/src/utils/dateUtils";

interface Props {
  form: MemberFormState;
  updateField: <K extends keyof MemberFormState>(
    key: K,
    value: MemberFormState[K],
  ) => void;
  errors?: Record<string, string>;
}

export const BasicInfoStep = React.memo(function BasicInfoStep({
  form,
  updateField,
  errors,
}: Props) {
  if (__DEV__) console.log("BasicInfoStep render");

  return (
    <View className="space-y-4">
      {/* Enroll Date */}
      <BSDateInput
        label="Enroll Date (B.S.)"
        adValue={form.enrollDate}
        onChangeAD={(adIso) => updateField("enrollDate", adIso)}
      />
      {errors?.enrollDate && (
        <Text className="text-red-500 text-xs mt-1">{errors.enrollDate}</Text>
      )}

      {/* Full Name */}
      <View>
        <Text className="mb-1 font-medium">Full Name / पूरा नाम *</Text>
        <TextInput
          className="border rounded-lg px-3 py-2"
          value={form.fName}
          onChangeText={(text) => updateField("fName", text)}
          placeholder="Enter full name"
        />
      </View>
      {errors?.fName && (
        <Text className="text-red-500 text-xs mt-1">{errors.fName}</Text>
      )}

      {/* Gender */}
      <FormDropdown
        label="Gender ( लिङ्ग ) *"
        value={form.gender}
        options={genderOptions}
        onChange={(val) => updateField("gender", val)}
      />
      {errors?.gender && (
        <Text className="text-red-500 text-xs mt-1">{errors.gender}</Text>
      )}

      {/* Mobile Number */}
      <View>
        <Text className="mb-1 font-medium">Mobile Number / मोबाइल नम्बर *</Text>
        <TextInput
          className="border rounded-lg px-3 py-2"
          keyboardType="phone-pad"
          value={form.mobileNo}
          onChangeText={(text) =>
            updateField("mobileNo", text.replace(/\D/g, "").slice(0, 10))
          }
          placeholder="98XXXXXXXX"
        />
      </View>
      {errors?.mobileNo && (
        <Text className="text-red-500 text-xs mt-1">{errors.mobileNo}</Text>
      )}

      {/* Marital status  */}
      <FormDropdown
        label="Marital Status (वैवाहिक स्थिति) *"
        value={form.maritalStatus}
        options={maritalStatusOptions}
        onChange={(val) => updateField("maritalStatus", val)}
      />
      {errors?.maritalStatus && (
        <Text className="text-red-500 text-xs mt-1">
          {errors.maritalStatus}
        </Text>
      )}

      {/* Relation to household */}
      <FormDropdown
        label="Relationship to Household Head (घरमुलीसँगको नाता) *"
        value={form.relationtoHH}
        options={relationToHHOptions}
        onChange={(val) => {
          updateField("relationtoHH", val);
          updateField("headHousehold", val === "HHH");
        }}
      />
      {errors?.relationtoHH && (
        <Text className="text-red-500 text-xs mt-1">{errors.relationtoHH}</Text>
      )}

      {/* Date of Birth  */}
      <BSDateInput
        label="Date of Birth (B.S.) / जन्म मिति (वि.सं.) *"
        adValue={form.dob}
        onChangeAD={(adIso) => {
          const age = adIso ? calculateAgeFromISO(adIso) : null;

          updateField("dob", adIso);
          updateField("minorYn", age !== null ? age < 18 : false);
        }}
      />
      {errors?.dob && (
        <Text className="text-red-500 text-xs mt-1">{errors.dob}</Text>
      )}
    </View>
  );
});
