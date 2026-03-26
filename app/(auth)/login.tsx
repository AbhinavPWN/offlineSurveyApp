import { useState, useRef } from "react";
import {
  Button,
  Text,
  TextInput,
  View,
  Alert,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
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

  const passwordRef = useRef<TextInput>(null);

  async function handleLogin() {
    if (!username || !password) {
      Alert.alert("All fields are required.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginApi(username, password, officeCode);

      if (!response.success || !response.data) {
        Alert.alert(
          "Login Failed",
          response.message || "Invalid username or password",
        );
        return;
      }

      const offlinePin = "1234";
      const pinHash = await hashPin(offlinePin);

      const session: AuthSession = {
        userName: username,
        officeCode,
        accessToken: response.data.access_token,
        tokenExpireAt: Date.now() + response.data.expires_in * 1000,
        offlinePinHash: pinHash,
        lastOnlineLoginAt: Date.now(),
      };

      await login(session);

      router.replace("./pin-setup");
    } catch (e) {
      console.error("Login error:", e);

      Alert.alert(
        "Network Error",
        "Please check your internet connection and try again.",
      );
    } finally {
      setLoading(false);
    }
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
            paddingTop: 40,
          }}
        >
          <Stack.Screen options={{ title: "Health Survey Login" }} />

          {/* Logo */}
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Image
              source={require("../../assets/images/logo.jpeg")}
              style={{
                width: 140,
                height: 140,
                borderRadius: 50,
              }}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              textAlign: "center",
              marginBottom: 6,
            }}
          >
            Health Survey Login
          </Text>

          <Text
            style={{
              fontSize: 14,
              textAlign: "center",
              color: "#6b7280",
              marginBottom: 24,
            }}
          >
            Please login to continue.
          </Text>

          {/* Username */}
          <Text style={{ marginBottom: 6 }}>Username</Text>
          <TextInput
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            style={{
              borderWidth: 1,
              borderColor: "#d1d5db",
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
            }}
          />

          {/* Password */}
          <Text style={{ marginBottom: 6 }}>Password</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#d1d5db",
              borderRadius: 8,
              paddingHorizontal: 10,
              marginBottom: 20,
            }}
          >
            <TextInput
              ref={passwordRef}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              style={{
                flex: 1,
                paddingVertical: 12,
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

          {/* Button */}
          <Button
            title={loading ? "Logging in..." : "Login"}
            onPress={handleLogin}
            disabled={loading}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
