import { Stack, Redirect, useSegments, useRouter } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { useState } from "react";
import { useAuth } from "../context/useAuth";
import SupportPasswordModal from "@/src/components/support/SupportPasswordModal";

const SUPPORT_PASSWORD = "9999"; // move to env later if needed

export default function AuthGate() {
  const { state, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const inAuthGroup = segments[0] === "(auth)";

  const [tapCount, setTapCount] = useState(0);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // ⏳ Still determining auth state
  if (loading) {
    return null; // splash later
  }

  // 🔐 LOGGED OUT → redirect to login
  if (state === "LOGGED_OUT" && !inAuthGroup) {
    return <Redirect href="/login" />;
  }

  // SESSION EXPIRED -> Stay in app , do not redirect
  if (state === "SESSION_EXPIRED") {
  }

  // 🔐 LOCKED → redirect to unlock
  if (state === "LOCKED" && segments[1] !== "unlock") {
    return <Redirect href="/unlock" />;
  }

  // 🕵️ Hidden support access (triple tap on version)
  const handleVersionPress = () => {
    setTapCount((prev) => prev + 1);

    // Reset tap count after 1 second
    setTimeout(() => {
      setTapCount(0);
    }, 1000);

    if (tapCount + 1 === 3) {
      setShowSupportModal(true);
    }
  };

  return (
    <>
      <Stack
        screenOptions={{
          contentStyle: { flex: 1 },
        }}
      />

      {/* GLOBAL FOOTER */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          alignItems: "center",
          paddingVertical: 4,
          borderTopWidth: 1,
          borderColor: "#e5e7eb",
          backgroundColor: "white",
        }}
      >
        <Pressable onPress={handleVersionPress}>
          <Text style={{ fontSize: 12, color: "#9ca3af" }}>Version 1.0.0</Text>
        </Pressable>
      </View>

      {/* SUPPORT PASSWORD MODAL */}
      <SupportPasswordModal
        visible={showSupportModal}
        password={SUPPORT_PASSWORD}
        onClose={() => setShowSupportModal(false)}
        onSuccess={() => {
          setShowSupportModal(false);
          router.push("../support/logs");
        }}
      />
    </>
  );
}
