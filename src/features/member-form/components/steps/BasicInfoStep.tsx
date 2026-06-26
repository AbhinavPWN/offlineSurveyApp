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

interface Props {
  form: MemberFormState;
  updateField: <K extends keyof MemberFormState>(
    key: K,
    value: MemberFormState[K],
  ) => void;
  errors?: Record<string, string>;

  // changed from fieldRefs → registerField
  registerField: (fieldName: string) => (node: View | null) => void;
}

export const BasicInfoStep = React.memo(function BasicInfoStep({
  form,
  updateField,
  errors,
  registerField,
}: Props) {
  if (__DEV__) console.log("BasicInfoStep render");

  const clientAgeNumber =
    form.clientAge !== null &&
    form.clientAge !== undefined &&
    form.clientAge !== ""
      ? Number(form.clientAge)
      : null;

  // For validating mobile no showing or not .
  const hasValidClientAge =
    clientAgeNumber !== null &&
    Number.isInteger(clientAgeNumber) &&
    clientAgeNumber >= 0 &&
    clientAgeNumber <= 120;

  const isMobileEnabled =
    hasValidClientAge && clientAgeNumber !== null && clientAgeNumber > 16;

  const shouldClearMobile =
    hasValidClientAge && clientAgeNumber !== null && clientAgeNumber <= 16;

  const shouldSkipOccupation =
    clientAgeNumber !== null &&
    Number.isFinite(clientAgeNumber) &&
    clientAgeNumber < 16;

  React.useEffect(() => {
    if (shouldSkipOccupation && form.occupationCode) {
      updateField("occupationCode", null);
    }
  }, [shouldSkipOccupation, form.occupationCode, updateField]);

  return (
    <View className="space-y-4">
      {/* Enroll Date */}
      <View ref={registerField("enrollDate")} collapsable={false}>
        <BSDateInput
          label="Enroll Date (B.S.)"
          adValue={form.enrollDate}
          onChangeAD={(adIso) => updateField("enrollDate", adIso)}
        />
      </View>

      {errors?.enrollDate && (
        <Text className="text-red-500 text-xs mt-1">{errors.enrollDate}</Text>
      )}

      {/* Full Name */}
      <View ref={registerField("fName")} collapsable={false}>
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
      <View ref={registerField("gender")} collapsable={false}>
        <FormDropdown
          label="Gender ( लिङ्ग ) *"
          value={form.gender}
          options={genderOptions}
          onChange={(val) => updateField("gender", val)}
        />
      </View>

      {errors?.gender && (
        <Text className="text-red-500 text-xs mt-1">{errors.gender}</Text>
      )}

      {/* Date of Birth */}
      <View ref={registerField("dob")} collapsable={false}>
        <BSDateInput
          label="Date of Birth (B.S.) / जन्म मिति (वि.सं.)"
          adValue={form.dob}
          onChangeAD={(adIso) => {
            updateField("dob", adIso);
          }}
        />
      </View>

      {errors?.dob && (
        <Text className="text-red-500 text-xs mt-1">{errors.dob}</Text>
      )}

      {/* Client Age */}
      <View ref={registerField("clientAge")} collapsable={false}>
        <Text className="mb-1 font-medium">Client Age (पूरा भएको उमेर)</Text>

        <TextInput
          className="border rounded-lg px-3 py-2"
          keyboardType="number-pad"
          value={form.clientAge ?? ""}
          onChangeText={(text) => {
            const cleanAge = text.replace(/\D/g, "").slice(0, 3);

            updateField("clientAge", cleanAge);

            const ageNumber = cleanAge ? Number(cleanAge) : null;

            if (
              ageNumber !== null &&
              Number.isInteger(ageNumber) &&
              ageNumber >= 0 &&
              ageNumber <= 120
            ) {
              // Preserve the existing occupation rule.
              if (ageNumber < 16) {
                updateField("occupationCode", null);
              }

              // New mobile-number rule.
              if (ageNumber <= 16) {
                updateField("mobileNo", "");
              }
            }
          }}
          placeholder="Enter age"
        />
      </View>

      {errors?.clientAge && (
        <Text className="text-red-500 text-xs mt-1">{errors.clientAge}</Text>
      )}

      {/* Mobile Number */}
      <View ref={registerField("mobileNo")} collapsable={false}>
        <Text className="mb-1 font-medium">
          Mobile Number / मोबाइल नम्बर
          {isMobileEnabled ? " *" : ""}
        </Text>

        <TextInput
          className={`border rounded-lg px-3 py-2 ${
            isMobileEnabled
              ? "bg-white"
              : "bg-gray-100 text-gray-500 border-gray-300"
          }`}
          keyboardType="phone-pad"
          value={form.mobileNo}
          editable={isMobileEnabled}
          onChangeText={(text) =>
            updateField("mobileNo", text.replace(/\D/g, "").slice(0, 10))
          }
          placeholder={
            isMobileEnabled ? "98XXXXXXXX" : "Available only for age above 16"
          }
        />

        {!isMobileEnabled && (
          <Text className="text-gray-500 text-xs mt-1">
            {shouldClearMobile
              ? "Mobile number is not required for members aged 16 or below."
              : "Enter a valid client age above 16 to enable mobile number."}
          </Text>
        )}
      </View>

      {isMobileEnabled && errors?.mobileNo && (
        <Text className="text-red-500 text-xs mt-1">{errors.mobileNo}</Text>
      )}

      {/* {errors?.mobileNo && (
        <Text className="text-red-500 text-xs mt-1">{errors.mobileNo}</Text>
      )} */}

      {/* Marital Status */}
      <View ref={registerField("maritalStatus")} collapsable={false}>
        <FormDropdown
          label="Marital Status (वैवाहिक स्थिति) *"
          value={form.maritalStatus}
          options={maritalStatusOptions}
          onChange={(val) => updateField("maritalStatus", val)}
        />
      </View>

      {errors?.maritalStatus && (
        <Text className="text-red-500 text-xs mt-1">
          {errors.maritalStatus}
        </Text>
      )}

      {/* Relation to household */}
      <View ref={registerField("relationtoHH")} collapsable={false}>
        <FormDropdown
          label="Relationship to Household Head (घरमुलीसँगको नाता) *"
          value={form.relationtoHH}
          options={relationToHHOptions}
          onChange={(val) => {
            updateField("relationtoHH", val);

            updateField("headHousehold", val === "HHH");
          }}
        />
      </View>

      {errors?.relationtoHH && (
        <Text className="text-red-500 text-xs mt-1">{errors.relationtoHH}</Text>
      )}
    </View>
  );
});
