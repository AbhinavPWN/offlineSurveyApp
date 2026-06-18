import React from "react";
import { View, Text } from "react-native";
import { MemberFormState } from "../../models/MemberFormState";
import { FormDropdown } from "../FormDropdown";
import {
  religionOptions,
  occupationOptions,
  educationOptions,
} from "../../master/occupationMasterData";
import { casteOptions } from "../../master/casteMasterData";

interface Props {
  form: MemberFormState;
  updateField: <K extends keyof MemberFormState>(
    key: K,
    value: MemberFormState[K],
  ) => void;
  errors?: Record<string, string>;

  registerField: (fieldName: string) => (node: View | null) => void;
}

export function OccupationStep({
  form,
  updateField,
  errors,
  registerField,
}: Props) {
  if (__DEV__) console.log("OccupationStep render");

  const clientAgeNumber =
    form.clientAge !== null &&
    form.clientAge !== undefined &&
    form.clientAge !== ""
      ? Number(form.clientAge)
      : null;

  const shouldSkipOccupation =
    clientAgeNumber !== null &&
    Number.isFinite(clientAgeNumber) &&
    clientAgeNumber < 16;

  return (
    <View className="space-y-4">
      {/* Caste */}
      <View ref={registerField("casteCode")} collapsable={false}>
        <FormDropdown
          label="Caste (जात) *"
          value={form.casteCode}
          options={casteOptions}
          onChange={(val) => updateField("casteCode", val)}
        />
      </View>

      {errors?.casteCode && (
        <Text className="text-red-500 text-xs">{errors.casteCode}</Text>
      )}

      {/* Religion */}
      <View ref={registerField("religionCode")} collapsable={false}>
        <FormDropdown
          label="Religion (धर्म) *"
          value={form.religionCode}
          options={religionOptions}
          onChange={(val) => updateField("religionCode", val)}
        />
      </View>

      {errors?.religionCode && (
        <Text className="text-red-500 text-xs">{errors.religionCode}</Text>
      )}

      {/* Occupation - skipped for age less than 16 */}
      {shouldSkipOccupation ? (
        <View ref={registerField("occupationCode")} collapsable={false}>
          <View className="border border-green-300 bg-green-50 rounded-lg px-3 py-3">
            <Text className="text-green-700 font-medium">
              Occupation skipped.
            </Text>

            <Text className="text-green-600 text-xs mt-1 ">
              Client age is less than 16, so occupation is not required.
            </Text>
          </View>
        </View>
      ) : (
        <>
          <View ref={registerField("occupationCode")} collapsable={false}>
            <FormDropdown
              label="Occupation (पेशा) *"
              value={form.occupationCode}
              options={occupationOptions}
              onChange={(val) => updateField("occupationCode", val)}
            />
          </View>

          {errors?.occupationCode && (
            <Text className="text-red-500 text-xs">
              {errors.occupationCode}
            </Text>
          )}
        </>
      )}

      {/* Education */}
      <View ref={registerField("educationCode")} collapsable={false}>
        <FormDropdown
          label="Education (शिक्षा) *"
          value={form.educationCode}
          options={educationOptions}
          onChange={(val) => updateField("educationCode", val)}
        />
      </View>

      {errors?.educationCode && (
        <Text className="text-red-500 text-xs">{errors.educationCode}</Text>
      )}
    </View>
  );
}
