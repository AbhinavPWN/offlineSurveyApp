import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Dashboard" }} />
      <Stack.Screen name="households/index" options={{ title: "Households" }} />
      <Stack.Screen
        name="households/[householdId]/index"
        options={{ title: "Household Details" }}
      />
      <Stack.Screen
        name="households/[householdId]/members/index"
        options={{ title: "Household Members" }}
      />
      <Stack.Screen
        name="households/[householdId]/members/[memberId]"
        options={{ title: "Member Details" }}
      />
    </Stack>
  );
}
