import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { MemberFormState } from "../../models/MemberFormState";
import { householdLocalRepository } from "@/src/di/container";
import {
  getProvinces,
  getAllDistricts,
  getAllMunicipalities,
} from "@/src/repositories/addressRepository";

interface Props {
  form: MemberFormState;
  updateField: <K extends keyof MemberFormState>(
    key: K,
    value: MemberFormState[K],
  ) => void;
  householdLocalId: string;
}

export const AddressStep = React.memo(function AddressStep({
  form,
  updateField,
  householdLocalId,
}: Props) {
  const [household, setHousehold] = useState<any>(null);
  const [labels, setLabels] = useState({
    province: "",
    district: "",
    municipality: "",
  });

  // ✅ Set address type once (NO LOOP)
  useEffect(() => {
    if (form.address1Type !== "P") {
      updateField("address1Type", "P");
    }
  }, [form.address1Type, updateField]);

  // ✅ Load household (ONLY ONCE)
  useEffect(() => {
    let mounted = true;

    async function loadHousehold() {
      if (!householdLocalId) return;

      const hh = await householdLocalRepository.getByLocalId(householdLocalId);

      if (mounted) setHousehold(hh);
    }

    loadHousehold();

    return () => {
      mounted = false;
    };
  }, [householdLocalId]);

  // ✅ Load labels (ONLY when household ready)
  useEffect(() => {
    let mounted = true;

    async function loadLabels() {
      if (!household) return;

      const [provinces, districts, municipalities] = await Promise.all([
        getProvinces(),
        getAllDistricts(),
        getAllMunicipalities(),
      ]);

      if (!mounted) return;

      const p = provinces.find((x) => x.id === household.provinceCode);
      const d = districts.find((x) => x.id === household.districtCode);
      const m = municipalities.find((x) => x.id === household.vdcnpCode);

      setLabels({
        province: p ? `${p.name_en} (${p.name_np})` : household.provinceCode,

        district: d ? `${d.name_np} (${d.name_en})` : household.districtCode,

        municipality: m ? `${m.name_en} (${m.name_np})` : household.vdcnpCode,
      });
    }

    loadLabels();

    return () => {
      mounted = false;
    };
  }, [household]);

  return (
    <View className="px-1">
      {/* Title */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-semibold">Address</Text>
        <Text className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
          From Household
        </Text>
      </View>

      {/* Card */}
      <View className="bg-white border border-gray-200 rounded-2xl p-4">
        {/* Address Type */}
        <View className="mb-3">
          <Text className="text-xs text-gray-500">Address Type</Text>
          <Text className="text-base font-semibold mt-1">
            Permanent (स्थायी)
          </Text>
        </View>

        <View className="h-[1px] bg-gray-200 my-2" />

        {/* Province */}
        <View className="mb-3">
          <Text className="text-xs text-gray-500">Province</Text>
          <Text className="text-base mt-1">{labels.province}</Text>
        </View>

        {/* District */}
        <View className="mb-3">
          <Text className="text-xs text-gray-500">District</Text>
          <Text className="text-base mt-1">{labels.district}</Text>
        </View>

        {/* Municipality */}
        <View className="mb-3">
          <Text className="text-xs text-gray-500">
            Municipality / Rural Municipality
          </Text>
          <Text className="text-base mt-1">{labels.municipality}</Text>
        </View>

        <View className="h-[1px] bg-gray-200 my-2" />

        {/* Ward */}
        <View className="mb-3">
          <Text className="text-xs text-gray-500">Ward No.</Text>
          <Text className="text-base mt-1">{household?.wardNo ?? "-"}</Text>
        </View>

        {/* Address */}
        <View>
          <Text className="text-xs text-gray-500">Tole / Street</Text>
          <Text className="text-base mt-1">{household?.address ?? "-"}</Text>
        </View>
      </View>
    </View>
  );
});
