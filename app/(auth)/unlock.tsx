import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useAuth } from "@/src/auth/context/useAuth";
import { useState, useRef, useEffect } from "react";
import { useRouter, Stack } from "expo-router";

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

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
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
    <>
      <Stack.Screen options={{ title: "Enter PIN" }} />

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingVertical: 32,
          backgroundColor: "#fff",
        }}
      >
        <View style={{ width: "100%", maxWidth: 360, alignItems: "center" }}>
          <Text style={{ fontSize: 22, fontWeight: "600", marginBottom: 8 }}>
            Enter Offline PIN
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#6b7280",
              textAlign: "center",
              marginBottom: 22,
            }}
          >
            Use your 4-digit PIN to continue.
          </Text>

          {/* PIN boxes */}
          <Pressable
            onPress={() => {
              inputRef.current?.blur();

              setTimeout(() => {
                inputRef.current?.focus();
              }, 50);
            }}
            style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}
          >
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={{
                  width: 48,
                  height: 56,
                  borderWidth: 1,
                  borderRadius: 8,
                  borderColor: "#d1d5db",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 24 }}>{pin[i] ? "●" : ""}</Text>
              </View>
            ))}
          </Pressable>

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
            maxLength={4}
            autoFocus
            style={{
              position: "absolute",
              left: -1000,
              width: 1,
              height: 1,
            }}
          />

          <TouchableOpacity
            onPress={handleUnlock}
            disabled={pin.length !== 4 || loading}
            style={{
              width: "100%",
              backgroundColor: pin.length === 4 ? "#2563eb" : "#9ca3af",
              paddingVertical: 14,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
              {loading ? "Checking..." : "Unlock"}
            </Text>
          </TouchableOpacity>

          {/* Displaying inline error */}
          {error && (
            <Text
              style={{
                color: "#dc2626",
                marginTop: 12,
                marginBottom: 12,
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
            style={{ marginTop: 16 }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "#6b7280",
                textAlign: "center",
                textDecorationLine: "underline",
              }}
            >
              Forgot PIN?{"\n"}
              Please connect to the internet and login again.
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}
