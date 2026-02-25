import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";

import {
  householdMemberLocalRepository,
  householdLocalRepository,
} from "@/src/di/container";

import type { HouseholdMemberLocal } from "@/src/models/householdMember.model";
import type { HouseholdLocal } from "@/src/models/household.model";

export default function MembersListScreen() {
  const router = useRouter();
  const { householdId } = useLocalSearchParams();

  const householdLocalId = typeof householdId === "string" ? householdId : null;

  const [members, setMembers] = useState<HouseholdMemberLocal[]>([]);
  const [household, setHousehold] = useState<HouseholdLocal | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!householdLocalId) return;

    const hh = await householdLocalRepository.getByLocalId(householdLocalId);

    const list =
      await householdMemberLocalRepository.listByHousehold(householdLocalId);

    setHousehold(hh);
    setMembers(list);
    setLoading(false);
  }, [householdLocalId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleAddMember = async () => {
    if (!householdLocalId) return;

    if (household?.syncStatus === "PENDING") {
      Alert.alert(
        "Locked",
        "Cannot modify members while household is pending sync.",
      );
      return;
    }

    const draft =
      await householdMemberLocalRepository.createDraftMember(householdLocalId);

    router.push(`/households/${householdLocalId}/members/${draft.localId}`);
  };

  const handleDelete = (member: HouseholdMemberLocal) => {
    Alert.alert(
      "Delete Member",
      "Are you sure you want to remove this member?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await householdMemberLocalRepository.softDelete(member.localId);
            loadData();
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (!householdLocalId) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Invalid household</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Text className="text-xl font-bold mb-4">Household Members</Text>

      <FlatList
        data={members}
        keyExtractor={(item) => item.localId}
        ListEmptyComponent={
          <Text className="text-gray-500">No members added yet.</Text>
        }
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-xl mb-3 shadow-sm">
            <Pressable
              onPress={() =>
                router.push(
                  `/households/${householdLocalId}/members/${item.localId}`,
                )
              }
            >
              <Text className="font-semibold text-lg">
                {item.firstName ?? "Unnamed Member"}
              </Text>

              {item.headHousehold === "Y" && (
                <Text className="text-green-600 text-sm">
                  Head of Household
                </Text>
              )}

              <Text className="text-sm text-gray-500">
                Status: {item.syncStatus}
              </Text>
            </Pressable>

            {household?.syncStatus !== "PENDING" && (
              <Pressable onPress={() => handleDelete(item)} className="mt-2">
                <Text className="text-red-600 text-sm">Delete</Text>
              </Pressable>
            )}
          </View>
        )}
      />

      {household?.syncStatus !== "PENDING" && (
        <Pressable
          onPress={handleAddMember}
          className="bg-blue-600 p-4 rounded-xl mt-4"
        >
          <Text className="text-white text-center font-semibold">
            + Add Member
          </Text>
        </Pressable>
      )}
    </View>
  );
}
