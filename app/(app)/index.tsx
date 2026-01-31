import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";

export default function AppIndex() {
  const router = useRouter();

  useEffect(() => {
    // Small delay to ensure the screen mounts and paints before redirecting
    const id = setTimeout(() => {
      router.replace("/households");
    }, 0);

    return () => clearTimeout(id);
  }, [router]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
      }}
    >
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 12, fontSize: 16, color: "#555" }}>
        Loading ...
      </Text>
    </View>
  );
}
