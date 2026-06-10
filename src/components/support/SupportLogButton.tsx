import { useState } from "react";
import { Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import SupportPasswordModal from "./SupportPasswordModal";

const SUPPORT_PASSWORD = "9999";

interface Props {
  className?: string;
  textClassName?: string;
}

export default function SupportLogButton({ className, textClassName }: Props) {
  const router = useRouter();
  const [showSupportModal, setShowSupportModal] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setShowSupportModal(true)}
        className={
          className ?? "bg-gray-800 px-4 py-2 rounded-lg active:bg-gray-900"
        }
      >
        <Text className={textClassName ?? "text-white font-semibold"}>
          Logs
        </Text>
      </Pressable>

      <SupportPasswordModal
        visible={showSupportModal}
        password={SUPPORT_PASSWORD}
        onClose={() => setShowSupportModal(false)}
        onSuccess={() => {
          setShowSupportModal(false);
          router.push("/support/logs");
        }}
      />
    </>
  );
}
