import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function PinSetupScreen() {
  const router = useRouter();

  // Temporary Pin
  const offlinePin = "1234"; //Later: const offlinePin = response.data.offline_pin;

  function handleConfirm() {
    router.replace("/");
  }

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>Offline Access PIN</Text>

      <Text style={{ marginBottom: 12 }}>
        This PIN is required to open the app when you are offline. Please
        remember it.
      </Text>

      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24 }}>
        {offlinePin}
      </Text>

      <Button title="I Understand" onPress={handleConfirm} />
    </View>
  );
}
