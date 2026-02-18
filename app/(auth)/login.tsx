import { useState } from "react";
import {
  Button,
  Text,
  TextInput,
  View,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "@/src/auth/context/useAuth";
import { AuthSession } from "@/src/auth/model/AuthSession";
import { hashPin } from "@/src/auth/service/pin";
import { loginApi } from "@/src/auth/api/authApi";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [officeCode, setOfficeCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    console.log("LOGIN ATTEMPT", { username, password, officeCode });
    // Client-side validation
    if (!username || !password || !officeCode) {
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
    <View style={{ padding: 24 }}>
      <Text
        style={{
          color: "black",
          fontSize: 20,
          fontWeight: "600",
          marginBottom: 16,
        }}
      >
        Login
      </Text>

      <TextInput
        placeholder="Username"
        placeholderTextColor="#888"
        value={username}
        onChangeText={setUsername}
        style={{
          borderWidth: 1,
          padding: 8,
          marginTop: 12,
          borderColor: "#ccc",
          color: "#000",
        }}
      />

      {/* Password Input */}
      <View
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          marginTop: 12,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 8,
        }}
      >
        <TextInput
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={{
            flex: 1,
            paddingVertical: 8,
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

      <TextInput
        placeholder="Office Code"
        placeholderTextColor="#888"
        value={officeCode}
        onChangeText={setOfficeCode}
        keyboardType="number-pad"
        style={{
          borderWidth: 1,
          padding: 8,
          marginTop: 12,
          marginBottom: 12,
          borderColor: "#ccc",
          color: "#000",
        }}
      />

      <Button
        title={loading ? "Logging in..." : "Login"}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
}
