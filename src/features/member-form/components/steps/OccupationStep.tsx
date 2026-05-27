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

      {/* Occupation */}
      <View ref={registerField("occupationCode")} collapsable={false}>
        <FormDropdown
          label="Occupation (पेशा) *"
          value={form.occupationCode}
          options={occupationOptions}
          onChange={(val) => updateField("occupationCode", val)}
        />
      </View>

      {errors?.occupationCode && (
        <Text className="text-red-500 text-xs">{errors.occupationCode}</Text>
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
