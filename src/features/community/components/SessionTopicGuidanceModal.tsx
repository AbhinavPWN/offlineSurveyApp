import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { CommunitySessionTopic } from "../master/communitySessionTopics";

interface SessionTopicGuidanceModalProps {
  visible: boolean;
  topic: CommunitySessionTopic | null;
  selected: boolean;
  onClose: () => void;
  onRemove?: () => void;
}

export function SessionTopicGuidanceModal({
  visible,
  topic,
  selected,
  onClose,
  onRemove,
}: SessionTopicGuidanceModalProps) {
  if (!topic) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="border-b border-gray-200 bg-white px-4 pb-3 pt-2">
          <View className="flex-row items-start justify-between">
            <View className="mr-3 flex-1">
              <Text
                accessibilityRole="header"
                className="text-xl font-bold text-gray-900"
              >
                {topic.label}
              </Text>

              {selected && (
                <View className="mt-2 self-start rounded-full bg-green-100 px-3 py-1">
                  <Text className="text-xs font-semibold text-green-800">
                    ✓ Selected
                  </Text>
                </View>
              )}
            </View>

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close session topic guidance"
              className="min-h-11 min-w-11 items-center justify-center rounded-full bg-gray-100 px-3"
            >
              <Text className="text-lg font-semibold text-gray-700">✕</Text>
            </Pressable>
          </View>
        </View>

        {/* Scrollable guidance */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 32,
          }}
          showsVerticalScrollIndicator
        >
          <View className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <Text className="text-base font-semibold leading-6 text-blue-900">
              {topic.guidanceTitle}
            </Text>

            <Text className="mt-2 text-sm leading-5 text-blue-800">
              तलका सन्देशहरू समुदाय सँग छलफल तथा परामर्श गर्दा प्रयोग गर्नुहोस्।
            </Text>
          </View>

          {topic.guidanceItems.map((item, index) => (
            <View
              key={`${topic.key}-${index}`}
              className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white"
            >
              {/* Guidance item title */}
              <View className="border-b border-gray-100 bg-gray-50 px-4 py-4">
                <Text className="text-base font-bold leading-6 text-gray-900">
                  {item.title}
                </Text>
              </View>

              <View className="px-4 py-4">
                {/* Why */}
                <View className="mb-4">
                  <Text className="mb-1 text-sm font-bold text-blue-800">
                    किन सम्झाउने?
                  </Text>

                  <Text className="text-base leading-7 text-gray-800">
                    {item.why}
                  </Text>
                </View>

                {/* How */}
                {item.how ? (
                  <View className="border-t border-gray-100 pt-4">
                    <Text className="mb-1 text-sm font-bold text-green-800">
                      कसरी सम्झाउने?
                    </Text>

                    <Text className="text-base leading-7 text-gray-800">
                      {item.how}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ))}

          {selected && onRemove ? (
            <View className="mt-2 rounded-2xl border border-red-200 bg-red-50 p-4">
              <Text className="font-semibold text-red-900">
                यो विषय छनोट गरिएको छ।
              </Text>

              <Text className="mt-1 text-sm leading-5 text-red-700">
                यो सत्रमा यो विषय समावेश गरिएको छैन भने मात्र चयन हटाउनुहोस्।
              </Text>

              <Pressable
                onPress={onRemove}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${topic.label} from selected session topics`}
                className="mt-3 min-h-12 items-center justify-center rounded-xl border border-red-300 bg-white px-4"
              >
                <Text className="font-semibold text-red-700">
                  Remove from selected topics
                </Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>

        {/* Fixed bottom action */}
        <View className="border-t border-gray-200 bg-white px-4 pb-5 pt-3">
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close guidance and continue community visit"
            className="min-h-12 items-center justify-center rounded-xl bg-blue-600 px-4"
          >
            <Text className="text-base font-semibold text-white">
              Got it / ठीक छ
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
