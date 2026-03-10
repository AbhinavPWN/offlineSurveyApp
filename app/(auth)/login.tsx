import { useState } from "react";
import {
  Button,
  Text,
  TextInput,
  View,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import { useAuth } from "@/src/auth/context/useAuth";
import { AuthSession } from "@/src/auth/model/AuthSession";
import { hashPin } from "@/src/auth/service/pin";
import { loginApi } from "@/src/auth/api/authApi";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const officeCode = "00";
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    console.log("LOGIN ATTEMPT", { username, password, officeCode });
    // Client-side validation
    if (!username || !password) {
      Alert.alert("All fields are required.");
      return;
    }
    try {
      setLoading(true);
      // call backend
      const response = await loginApi(username, password, officeCode);
      console.log("LOGIN API RESPONSE:", response);

      if (!response.success || !response.data) {
        Alert.alert(
          "Login Failed",
          response.message || "Invalid username or password",
        );
        return;
      }

      // For testing and debugging
      console.log("LOGIN SUCCESS");
      console.log("ACCESS TOKEN:", response.data.access_token);
      console.log("EXPIRES IN:", response.data.expires_in);

      // Handle pin - future READY
      const offlinePin = "1234"; //Temporary until api or backend sends;const offlinePin = response.data.offline_pin;

      const pinHash = await hashPin(offlinePin);

      // 4️⃣ Build AuthSession
      const session: AuthSession = {
        userName: username,
        officeCode,
        accessToken: response.data.access_token,
        tokenExpireAt: Date.now() + response.data.expires_in * 1000,
        offlinePinHash: pinHash,
        lastOnlineLoginAt: Date.now(),
      };

      await login(session);

      console.log("SESSION STORED:", session);

      router.replace("./pin-setup");
    } catch (e) {
      console.error("Login error", e);
      Alert.alert(
        "Network Error.",
        "Please check your internet connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: "Health Survey Login" }} />

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingVertical: 24,
          backgroundColor: "#fff",
        }}
      >
        <View style={{ width: "100%", maxWidth: 380, alignSelf: "center" }}>
          <View style={{ alignItems: "center", marginBottom: 14 }}>
            <Image
              source={require("../../assets/images/logo.jpeg")}
              style={{
                width: 208,
                height: 208,
                borderRadius: 54,
                marginBottom: 12,
              }}
              resizeMode="contain"
            />
          </View>

          <Text
            style={{
              color: "black",
              fontSize: 24,
              fontWeight: "700",
              marginBottom: 6,
              textAlign: "center",
            }}
          >
            Health Survey Login
          </Text>

          <Text
            style={{
              color: "#6b7280",
              fontSize: 14,
              textAlign: "center",
              marginBottom: 22,
            }}
          >
            Please login to continue.
          </Text>

          <Text style={{ fontSize: 14, color: "#111827", marginBottom: 8 }}>
            Username
          </Text>
          <TextInput
            placeholder="Enter your username"
            placeholderTextColor="#9ca3af"
            value={username}
            onChangeText={setUsername}
            style={{
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 12,
              borderColor: "#d1d5db",
              color: "#000",
              marginBottom: 14,
            }}
          />

          <Text style={{ fontSize: 14, color: "#111827", marginBottom: 8 }}>
            Password
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: "#d1d5db",
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 10,
              marginBottom: 20,
            }}
          >
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={{
                flex: 1,
                paddingVertical: 12,
                color: "#000",
              }}
            />

            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#6b7280"
              />
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 4 }}>
            <Button
              title={loading ? "Logging in..." : "Login"}
              onPress={handleLogin}
              disabled={loading}
            />
          </View>
        </View>
      </View>
    </>
  );
}
