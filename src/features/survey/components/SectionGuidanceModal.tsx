import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { SectionGuidance } from "../config/guidance/guidanceTypes";

type Props = {
  visible: boolean;
  onClose: () => void;
  guidance?: SectionGuidance;
};

export default function SectionGuidanceModal({
  visible,
  onClose,
  guidance,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {/* BACKDROP */}
      <View className="flex-1 justify-end bg-black/40">
        {/* SHEET */}
        <View className="max-h-[88%] rounded-t-3xl bg-white">
          {/* HANDLE */}
          <View className="items-center pt-3">
            <View className="h-1.5 w-14 rounded-full bg-gray-300" />
          </View>

          {/* HEADER */}
          <View className="flex-row items-center justify-between border-b border-gray-200 px-5 py-4">
            <Text className="flex-1 pr-4 text-xl font-bold text-gray-900">
              {guidance?.title ?? "Section Guidance"}
            </Text>

            <TouchableOpacity
              onPress={onClose}
              className="rounded-full bg-gray-100 px-4 py-2"
              activeOpacity={0.7}
            >
              <Text className="font-semibold text-blue-600">Close</Text>
            </TouchableOpacity>
          </View>

          {/* CONTENT */}
          <ScrollView
            className="px-5"
            contentContainerStyle={{
              paddingTop: 20,
              paddingBottom: 40,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* GROUPED GUIDANCE */}
            {guidance?.groups?.map((group, groupIndex) => (
              <View key={groupIndex} className="mb-8">
                {/* GROUP TITLE */}
                <Text className="mb-4 text-lg font-bold text-gray-900">
                  {group.title}
                </Text>

                {/* GROUP ITEMS */}
                {group.items.map((item, index) => (
                  <View
                    key={`${groupIndex}-${index}`}
                    className="mb-5 rounded-2xl border border-gray-100 bg-gray-50 p-4"
                  >
                    {/* CATEGORY */}
                    {item.category && (
                      <View className="mb-3 self-start rounded-full bg-blue-100 px-3 py-1">
                        <Text className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                          {item.category.replace("_", " ")}
                        </Text>
                      </View>
                    )}

                    {/* ENGLISH */}
                    <Text className="text-[15px] font-medium leading-6 text-gray-900">
                      • {item.en}
                    </Text>

                    {/* NEPALI */}
                    <Text className="mt-3 text-[15px] leading-6 text-gray-700">
                      {item.np}
                    </Text>
                  </View>
                ))}
              </View>
            ))}

            {/* FLAT GUIDANCE (BACKWARD COMPATIBLE) */}
            {guidance?.items?.map((item, index) => (
              <View
                key={index}
                className="mb-5 rounded-2xl border border-gray-100 bg-gray-50 p-4"
              >
                {/* CATEGORY */}
                {item.category && (
                  <View className="mb-3 self-start rounded-full bg-blue-100 px-3 py-1">
                    <Text className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                      {item.category.replace("_", " ")}
                    </Text>
                  </View>
                )}

                {/* ENGLISH */}
                <Text className="text-[15px] font-medium leading-6 text-gray-900">
                  • {item.en}
                </Text>

                {/* NEPALI */}
                <Text className="mt-3 text-[15px] leading-6 text-gray-700">
                  {item.np}
                </Text>
              </View>
            ))}

            {/* EMPTY STATE */}
            {(!guidance ||
              ((!guidance.items || guidance.items.length === 0) &&
                (!guidance.groups || guidance.groups.length === 0))) && (
              <View className="items-center py-10">
                <Text className="text-base text-gray-500">
                  No guidance available.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
