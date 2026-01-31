import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useAuth } from "@/src/auth/context/useAuth";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "expo-router";

export default function UnlockScreen() {
  const router = useRouter();
  const { unlockWithPin } = useAuth();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const inputRef = useRef<TextInput>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleUnlock() {
    if (pin.length !== 4) return;

    setLoading(true);
    setError(null);

    const success = await unlockWithPin(pin);
    setLoading(false);

    if (!success) {
      setError("Incorrect PIN");
      setPin("");
      return;

      // // Refocusing after alert is shown.
      // setTimeout(() => {
      //   inputRef.current?.focus();
      // }, 100);
    }

    // after correct pin moving to app
    router.replace("/");
  }

  return (
    <View style={{ padding: 24, alignItems: "center" }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>Enter Offline PIN</Text>

      {/* PIN boxes */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              width: 48,
              height: 56,
              borderWidth: 1,
              borderRadius: 6,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 24 }}>{pin[i] ? "●" : ""}</Text>
          </View>
        ))}
      </View>

      {/* Hidden input */}
      <TextInput
        ref={inputRef}
        value={pin}
        onChangeText={(text) => {
          if (/^\d*$/.test(text)) {
            setPin(text.slice(0, 4));
          }
        }}
        keyboardType="number-pad"
        autoFocus
        maxLength={4}
        style={{ position: "absolute", opacity: 0 }}
      />

      <TouchableOpacity
        onPress={handleUnlock}
        disabled={pin.length !== 4 || loading}
        style={{
          backgroundColor: pin.length === 4 ? "#2563eb" : "#9ca3af",
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 6,
        }}
      >
        <Text style={{ color: "white", fontSize: 16 }}>
          {loading ? "Checking..." : "Unlock"}
        </Text>
      </TouchableOpacity>

      {/* Displaying inline error */}
      {error && (
        <Text
          style={{
            color: "#dc2626", // red but not aggressive
            marginTop: 12,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          {error}
        </Text>
      )}

      {/* For login button if only user wants */}
      <Pressable
        onPress={async () => {
          await logout();
          router.replace("/login");
        }}
        hitSlop={10}
      >
        <Text
          style={{
            marginTop: 20,
            fontSize: 12,
            color: "#6b7280", // neutral gray
            textAlign: "center",
            textDecorationLine: "underline",
          }}
        >
          Forgot your PIN? Connect to internet to login again.
        </Text>
      </Pressable>
    </View>
  );
}
