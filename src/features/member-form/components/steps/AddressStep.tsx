import React, { useMemo, useEffect } from "react";
import { View, Text, TextInput } from "react-native";
import { MemberFormState } from "../../models/MemberFormState";
import { FormDropdown } from "../FormDropdown";
import { districtOptions } from "../../master/memberMasterData";
import {
  addressTypeOptions,
  vdcByDistrict,
  provinceByDistrict,
} from "../../master/addressmasterData";

interface Props {
  form: MemberFormState;
  updateField: <K extends keyof MemberFormState>(
    key: K,
    value: MemberFormState[K],
  ) => void;
  errors?: Record<string, string>;
}

export function AddressStep({ form, updateField, errors }: Props) {
  const vdcOptions = useMemo(() => {
    if (!form.address1DistrictCode) return [];
    return vdcByDistrict[form.address1DistrictCode] ?? [];
  }, [form.address1DistrictCode]);

  // Auto-set province internally
  useEffect(() => {
    if (form.address1DistrictCode) {
      const province = provinceByDistrict[form.address1DistrictCode];
      if (province) {
        updateField("address1Province", province);
      }
    }
  }, [form.address1DistrictCode, updateField]);

  return (
    <View className="space-y-4">
      {/* Address Type */}
      <FormDropdown
        label="Address Type *"
        value={form.address1Type}
        options={addressTypeOptions}
        onChange={(val) => updateField("address1Type", val)}
      />
      {errors?.address1Type && (
        <Text className="text-red-500 text-xs">{errors.address1Type}</Text>
      )}

      {/* District */}
      <FormDropdown
        label="District *"
        value={form.address1DistrictCode}
        options={districtOptions}
        onChange={(val) => {
          updateField("address1DistrictCode", val);
          updateField("address1Line2", null);
        }}
      />
      {errors?.address1DistrictCode && (
        <Text className="text-red-500 text-xs">
          {errors.address1DistrictCode}
        </Text>
      )}

      {/* VDC / Municipality */}
      <FormDropdown
        label="Municipality / Rural Municipality *"
        value={form.address1Line2}
        options={vdcOptions}
        onChange={(val) => updateField("address1Line2", val)}
      />
      {errors?.address1Line2 && (
        <Text className="text-red-500 text-xs">{errors.address1Line2}</Text>
      )}

      {/* Ward */}
      <View>
        <Text className="mb-1 font-medium">Ward No. *</Text>
        <TextInput
          className="border rounded-lg px-3 py-2"
          keyboardType="number-pad"
          value={form.address1Line3}
          onChangeText={(text) =>
            updateField("address1Line3", text.replace(/\D/g, "").slice(0, 2))
          }
          placeholder="Enter ward number"
        />
      </View>
      {errors?.address1Line3 && (
        <Text className="text-red-500 text-xs">{errors.address1Line3}</Text>
      )}

      {/* Tole / Street */}
      <View>
        <Text className="mb-1 font-medium">Tole / Street *</Text>
        <TextInput
          className="border rounded-lg px-3 py-2"
          value={form.address}
          onChangeText={(text) => updateField("address", text)}
          placeholder="Enter tole or street"
        />
      </View>
      {errors?.address && (
        <Text className="text-red-500 text-xs">{errors.address}</Text>
      )}
    </View>
  );
}
