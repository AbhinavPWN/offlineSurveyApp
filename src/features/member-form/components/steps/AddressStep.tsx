/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { View, Text, TextInput } from "react-native";
import { MemberFormState } from "../../models/MemberFormState";
import { FormDropdown } from "../FormDropdown";
import { addressTypeOptions } from "../../master/addressmasterData";
import {
  getMunicipalitiesByDistrict,
  getProvinces,
  getDistrictsByProvince,
} from "@/src/repositories/addressRepository";

interface Props {
  form: MemberFormState;
  updateField: <K extends keyof MemberFormState>(
    key: K,
    value: MemberFormState[K],
  ) => void;
  errors?: Record<string, string>;
}

export const AddressStep = React.memo(function AddressStep({
  form,
  updateField,
  errors,
}: Props) {
  if (__DEV__) console.log("AddressStep render");

  const [provinceOptions, setProvinceOptions] = useState<any[]>([]);
  const [districtOptions, setDistrictOptions] = useState<any[]>([]);
  const [municipalityOptions, setMunicipalityOptions] = useState<any[]>([]);

  // Load provinces once
  useEffect(() => {
    let mounted = true;

    async function loadProvinces() {
      try {
        const provinces = await getProvinces();
        if (!mounted) return;

        setProvinceOptions(
          provinces.map((p) => ({
            value: p.id,
            labelEn: p.name_en,
            labelNp: p.name_np,
          })),
        );
      } catch (error) {
        console.log("Province load error:", error);
      }
    }

    loadProvinces();
    console.log("Province effect triggered:", form.address1Province);
    return () => {
      mounted = false;
    };
  }, []);

  // Load districts when province changes
  // Load districts when province changes
  useEffect(() => {
    let mounted = true;

    async function loadDistricts() {
      const province = form.address1Province;

      // 🛡 Guard: empty or null province
      if (!province || province === "") {
        if (mounted) {
          setDistrictOptions([]);
        }
        return;
      }

      try {
        const districts = await getDistrictsByProvince(province);

        if (!mounted) return;

        const mappedDistricts = districts.map((d) => ({
          value: d.id,
          labelEn: d.name_en,
          labelNp: d.name_np,
        }));

        setDistrictOptions(mappedDistricts);

        // 🛡 Safety: if currently selected district does not belong to new province
        const currentDistrict = form.address1DistrictCode ?? "";

        const districtStillValid = mappedDistricts.some(
          (d) => d.value === currentDistrict,
        );

        if (!districtStillValid) {
          updateField("address1DistrictCode", "");
          updateField("address1Line2", "");
        }
      } catch (error) {
        console.log("District load error:", error);
      }
    }

    loadDistricts();

    return () => {
      mounted = false;
    };
  }, [form.address1Province]);

  // Load municipalities when district changes
  useEffect(() => {
    let mounted = true;

    async function loadMunicipalities() {
      if (!form.address1DistrictCode || form.address1DistrictCode === "") {
        setMunicipalityOptions([]);
        return;
      }

      try {
        const municipalities = await getMunicipalitiesByDistrict(
          form.address1DistrictCode,
        );

        if (!mounted) return;

        setMunicipalityOptions(
          municipalities.map((m) => ({
            value: m.id,
            labelEn: m.name_en,
            labelNp: m.name_np,
          })),
        );
      } catch (error) {
        console.log("Municipality load error:", error);
      }
    }

    loadMunicipalities();

    return () => {
      mounted = false;
    };
  }, [form.address1DistrictCode]);

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

      {/* Province */}
      <FormDropdown
        label="Province *"
        value={form.address1Province ?? ""}
        options={provinceOptions}
        onChange={(val) => {
          updateField("address1Province", val);
          updateField("address1DistrictCode", "");
          updateField("address1Line2", "");
        }}
      />
      {errors?.address1Province && (
        <Text className="text-red-500 text-xs">{errors.address1Province}</Text>
      )}

      {/* District */}
      <FormDropdown
        label="District *"
        value={form.address1DistrictCode ?? ""}
        options={districtOptions}
        showNepali={false}
        onChange={(val) => {
          updateField("address1DistrictCode", val);
          updateField("address1Line2", "");
        }}
      />
      {errors?.address1DistrictCode && (
        <Text className="text-red-500 text-xs">
          {errors.address1DistrictCode}
        </Text>
      )}

      {/* Municipality */}
      <FormDropdown
        label="Municipality / Rural Municipality *"
        value={form.address1Line2 ?? ""}
        options={municipalityOptions}
        showNepali={false}
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
          value={form.address1Line3 ?? ""}
          onChangeText={(text) =>
            updateField("address1Line3", text.replace(/\D/g, "").slice(0, 2))
          }
          placeholder="Enter ward number"
        />
      </View>
      {errors?.address1Line3 && (
        <Text className="text-red-500 text-xs">{errors.address1Line3}</Text>
      )}

      {/* Tole */}
      <View>
        <Text className="mb-1 font-medium">Tole / Street *</Text>
        <TextInput
          className="border rounded-lg px-3 py-2"
          value={form.address ?? ""}
          onChangeText={(text) => updateField("address", text)}
          placeholder="Enter tole or street"
        />
      </View>
      {errors?.address && (
        <Text className="text-red-500 text-xs">{errors.address}</Text>
      )}
    </View>
  );
});
