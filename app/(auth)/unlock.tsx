import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useAuth } from "@/src/auth/context/useAuth";
import { useState, useRef, useEffect } from "react";
import { useRouter, Stack } from "expo-router";

export default function UnlockScreen() {
  const router = useRouter();
  const { unlockWithPin, logout } = useAuth();

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          // router.replace("/login");
        },
      },
    ]);
  };

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
    }

    router.replace("/");
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 24,
            paddingTop: 80, // push content from top
          }}
        >
          <Stack.Screen options={{ title: "Enter PIN" }} />

          <View style={{ width: "100%", alignItems: "center" }}>
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
              onPress={() => inputRef.current?.focus()}
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

            {/* Unlock Button */}
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
              <Text style={{ color: "white", fontSize: 16 }}>
                {loading ? "Checking..." : "Unlock"}
              </Text>
            </TouchableOpacity>

            {/* Error */}
            {error && (
              <Text
                style={{
                  color: "#dc2626",
                  marginTop: 12,
                  fontSize: 13,
                }}
              >
                {error}
              </Text>
            )}

            {/* Logout */}
            <View style={{ marginTop: 30 }}>
              <Text
                style={{
                  textAlign: "center",
                  color: "#6b7280",
                  marginBottom: 10,
                }}
              >
                Forgot PIN? Logout and login again.
              </Text>

              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#ef4444",
                  alignSelf: "center",
                }}
              >
                <Text style={{ color: "#ef4444", fontWeight: "600" }}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
