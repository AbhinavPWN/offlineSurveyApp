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
}

export function OccupationStep({ form, updateField, errors }: Props) {
  return (
    <View className="space-y-4">
      <FormDropdown
        label="Caste (जात) *"
        value={form.casteCode}
        options={casteOptions}
        onChange={(val) => updateField("casteCode", val)}
      />
      {errors?.casteCode && (
        <Text className="text-red-500 text-xs">{errors.casteCode}</Text>
      )}

      <FormDropdown
        label="Religion (धर्म) *"
        value={form.religionCode}
        options={religionOptions}
        onChange={(val) => updateField("religionCode", val)}
      />
      {errors?.religionCode && (
        <Text className="text-red-500 text-xs">{errors.religionCode}</Text>
      )}

      <FormDropdown
        label="Occupation (पेशा) *"
        value={form.occupationCode}
        options={occupationOptions}
        onChange={(val) => updateField("occupationCode", val)}
      />
      {errors?.occupationCode && (
        <Text className="text-red-500 text-xs">{errors.occupationCode}</Text>
      )}

      <FormDropdown
        label="Education (शिक्षा) *"
        value={form.educationCode}
        options={educationOptions}
        onChange={(val) => updateField("educationCode", val)}
      />
      {errors?.educationCode && (
        <Text className="text-red-500 text-xs">{errors.educationCode}</Text>
      )}
    </View>
  );
}
