import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  useLocalSearchParams,
  useRouter,
  useFocusEffect,
  Stack,
} from "expo-router";

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
  const [creatingMember, setCreatingMember] = useState(false);

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
    if (!householdLocalId || creatingMember) return;

    // Lock only if household is pending AND members already exist
    if (household?.syncStatus === "PENDING" && members.length > 0) {
      Alert.alert(
        "Household Locked",
        "Members cannot be modified while this household is waiting for sync.",
      );
      return;
    }

    try {
      setCreatingMember(true);

      const draft =
        await householdMemberLocalRepository.createDraftMember(
          householdLocalId,
        );

      router.push(`/households/${householdLocalId}/members/${draft.localId}`);
    } finally {
      setCreatingMember(false);
    }
  };

  const handleDelete = (member: HouseholdMemberLocal) => {
    if (member.headHousehold === "Y") {
      Alert.alert(
        "Cannot Delete Head",
        "Assign another head of household before deleting this member.",
      );
      return;
    }
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
      <>
        <Stack.Screen options={{ title: "Household Members" }} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator />
        </View>
      </>
    );
  }

  if (!householdLocalId) {
    return (
      <>
        <Stack.Screen options={{ title: "Household Members" }} />
        <View className="flex-1 justify-center items-center">
          <Text>Invalid household</Text>
        </View>
      </>
    );
  }

  const totalMembers = members.length;
  const syncedMembers = members.filter((m) => m.syncStatus === "SYNCED").length;

  return (
    <>
      <Stack.Screen options={{ title: "Household Members" }} />

      <View className="flex-1 bg-gray-50 p-4">
        <Text className="text-xl font-bold">Household Members</Text>

        <View className="mt-2 mb-4">
          {totalMembers === 0 ? (
            <Text className="text-gray-400 text-sm">No Members Added</Text>
          ) : (
            <>
              <Text className="text-gray-600 text-sm">
                {totalMembers} Members
              </Text>

              <Text
                className={`text-xs mt-0.5 ${
                  syncedMembers === totalMembers
                    ? "text-green-600"
                    : syncedMembers === 0
                      ? "text-red-600"
                      : "text-yellow-600"
                }`}
              >
                {syncedMembers} / {totalMembers} Members Synced
              </Text>
            </>
          )}
        </View>

        <FlatList
          data={members}
          keyExtractor={(item) => item.localId}
          ListEmptyComponent={
            <Text className="text-gray-500">No members added yet.</Text>
          }
          renderItem={({ item }) => (
            <View className="bg-white p-4 rounded-xl mb-3 shadow-sm">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
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

                    <View
                      className={`px-2 py-1 rounded-full self-start mt-1 ${
                        item.syncStatus === "SYNCED"
                          ? "bg-green-100"
                          : item.syncStatus === "PENDING"
                            ? "bg-yellow-100"
                            : item.syncStatus === "FAILED"
                              ? "bg-red-100"
                              : "bg-gray-100"
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          item.syncStatus === "SYNCED"
                            ? "text-green-700"
                            : item.syncStatus === "PENDING"
                              ? "text-yellow-700"
                              : item.syncStatus === "FAILED"
                                ? "text-red-700"
                                : "text-gray-600"
                        }`}
                      >
                        {item.syncStatus}
                      </Text>
                    </View>
                  </Pressable>
                </View>

                {household?.syncStatus !== "SYNCED" && (
                  <Pressable
                    onPress={() =>
                      Alert.alert("Member Options", "", [
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => handleDelete(item),
                        },
                        {
                          text: "Cancel",
                          style: "cancel",
                        },
                      ])
                    }
                    className="px-2 py-1"
                  >
                    <Text style={{ fontSize: 18 }}>⋮</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}
        />

        {household?.syncStatus !== "SYNCED" && (
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
    </>
  );
}
