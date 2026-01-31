import { View, Text, TextInput, Pressable } from "react-native";
// import { householdRepository } from "@/src/repositories";
import { useState } from "react";
import { router } from "expo-router";
import { StartClientSurveyUseCase } from "@/src/usecases/StartClientSurveyUseCase";

export default function StartClientSurveyScreen() {
  // What user types - to store householdCode
  const [code, setCode] = useState("");
  // Validation message
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // For validation
  async function handleContinue() {
    const trimmedCode = code.trim();

    // UI level validation - Empty Check
    if (trimmedCode.length === 0) {
      setError("Client code is required");
      return;
    }

    // Length Check
    if (trimmedCode.length < 3) {
      setError("Client code is too short ");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const MOCK_USER_ID = "local-user";

      const useCase = new StartClientSurveyUseCase();

      const result = await useCase.execute({
        clientCode: trimmedCode,
        createdByUserId: MOCK_USER_ID,
      });

      // Navigate directly to the survey instance
      router.replace(`/(app)/households/${result.householdId}`);
    } catch (error: any) {
      console.error("Failed to start client survey", error);
      setError(error.message ?? "Failed to start survey");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20 }}>Start Client Survey</Text>

      <Text style={{ marginBottom: 10 }}>Enter Client Code</Text>

      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="e.g HH-123456"
        autoCapitalize="characters"
        editable={!loading}
        style={{
          borderWidth: 2,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 10,
        }}
      />

      {error && <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text>}

      <Pressable
        onPress={handleContinue}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#9ca3af" : "#2563eb",
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>
          {loading ? "Please wait..." : "Continue"}
        </Text>
      </Pressable>
    </View>
  );
}
