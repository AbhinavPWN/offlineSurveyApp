import { Modal, View, Text, TextInput, Pressable } from "react-native";
import { useState } from "react";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  password: string;
}

export default function SupportPasswordModal({
  visible,
  onClose,
  onSuccess,
  password,
}: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (value === password) {
      setValue("");
      setError("");
      onSuccess();
    } else {
      setError("Invalid password");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40 items-center justify-center">
        <View className="w-80 bg-white rounded-xl p-4">
          <Text className="text-lg font-semibold mb-2">Support Access</Text>

          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="Enter support password"
            secureTextEntry
            className="border border-gray-300 rounded-md px-3 py-2 mb-2"
          />

          {error ? (
            <Text className="text-red-600 text-sm mb-2">{error}</Text>
          ) : null}

          <View className="flex-row justify-end gap-3 mt-2">
            <Pressable onPress={onClose}>
              <Text className="text-gray-600">Cancel</Text>
            </Pressable>

            <Pressable onPress={handleSubmit}>
              <Text className="text-blue-600 font-semibold">Unlock</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
