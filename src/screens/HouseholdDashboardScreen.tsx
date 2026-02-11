import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { HouseholdLocal } from "../models/household.model";
import { HouseholdLocalRepository } from "../repositories/HouseholdLocalRepository";
import { CreateHouseholdUseCase } from "../usecases/household/CreateHouseholdUseCase";
import { useAuth } from "../auth/context/useAuth";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/src/navigation/types";
import { SummaryBar } from "../components/SummaryBar";
import { SyncBadge } from "../components/SyncBadge";
import { syncHouseholdUseCase } from "../di/container";

interface Props {
  householdRepo: HouseholdLocalRepository;
  createHouseholdUseCase: CreateHouseholdUseCase;
}

export const HouseholdDashboardScreen: React.FC<Props> = ({
  householdRepo,
  createHouseholdUseCase,
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { chwProfile, loading: authLoading } = useAuth();

  const [households, setHouseholds] = useState<HouseholdLocal[]>([]);
  const [loading, setLoading] = useState(true);

  //   Load households only when chwProfile is available
  const loadHouseholds = useCallback(async () => {
    if (!chwProfile) return;

    try {
      setLoading(true);
      const data = await householdRepo.listAllForCHW(chwProfile.userName);
      setHouseholds(data);
    } catch (error) {
      console.error("Failed to load households", error);
      setHouseholds([]);
    } finally {
      setLoading(false);
    }
  }, [chwProfile, householdRepo]);

  /**
   * Load when:
   * - CHW profile becomes available
   * - Screen regains focus
   */
  useEffect(() => {
    if (!chwProfile) return;
    loadHouseholds();

    const unsubscribe = navigation.addListener("focus", loadHouseholds);

    return unsubscribe;
  }, [chwProfile, loadHouseholds, navigation]);
  /**
   * Add new household
   */
  const handleAddNew = async () => {
    if (!chwProfile) return;

    const { localId } = await createHouseholdUseCase.execute({
      chwUsername: chwProfile.userName,
      idofCHW: chwProfile.idofCHW,
      provinceCode: chwProfile.provinceCode,
      districtCode: chwProfile.districtCode,
      vdcnpCode: chwProfile.vdcnpCode,
      wardNo: chwProfile.wardNo,
    });
    navigation.navigate("HouseholdForm", { localId });
  };

  /**
   * Edit existing household
   */

  const handleEdit = async (household: HouseholdLocal) => {
    if (!chwProfile) return;

    const { localId } = await createHouseholdUseCase.execute({
      chwUsername: chwProfile.userName,
      idofCHW: chwProfile.idofCHW,
      provinceCode: household.provinceCode,
      districtCode: household.districtCode,
      vdcnpCode: household.vdcnpCode,
      wardNo: household.wardNo,
      existingHouseholdId: household.householdId,
    });
    navigation.navigate("HouseholdForm", { localId });
  };

  // HandleSync manual
  const handleManualSync = async () => {
    if (!chwProfile) return;

    try {
      await syncHouseholdUseCase.execute(chwProfile.userName);
    } catch (e) {
      console.warn("[Manual Sync] failed", e);
    }
  };

  //   Global loading State
  if (authLoading || !chwProfile) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Preparing your Workspace ...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Loading households…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <SummaryBar households={households} />

      {/* Manual Sync button  */}
      <View className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <Pressable
          onPress={handleManualSync}
          className="self-end px-3 py-1 rounded bg-blue-600"
        >
          <Text className="text-white text-sm font-medium">Sync Now</Text>
        </Pressable>
      </View>

      <FlatList
        data={households}
        keyExtractor={(item) => item.localId}
        contentContainerStyle={
          households.length === 0 ? { flex: 1 } : undefined
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500 text-center">
              No households found.
              {"\n"}You can add a new one.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleEdit(item)}
            className="bg-white px-4 py-3 border-b border-gray-200"
          >
            <View className="flex-row justify-between items-center">
              <Text className="font-semibold">Ward {item.wardNo}</Text>
              <SyncBadge status={item.syncStatus} />
            </View>

            <Text className="text-gray-700 mt-1">{item.address}</Text>

            <Text className="text-gray-500 text-sm mt-1">
              Members: {item.noofHHMembers}
            </Text>
          </Pressable>
        )}
      />

      <Pressable
        onPress={handleAddNew}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 items-center justify-center"
      >
        <Text className="text-white text-3xl">+</Text>
      </Pressable>
    </View>
  );
};
