import { Stack, Redirect, useSegments } from "expo-router";
import { useAuth } from "../context/useAuth";

export default function AuthGate() {
  const { state, loading } = useAuth();
  const segments = useSegments();

  const inAuthGroup = segments[0] === "(auth)";
  console.log("AuthGate:", { loading, state });

  if (loading) {
    return null; // splash later
  }

  // 🔐 LOGGED OUT → only redirect if NOT already in auth screens
  if (state === "LOGGED_OUT" && !inAuthGroup) {
    return <Redirect href="/login" />;
  }

  // 🔐 LOCKED → only redirect if NOT already on unlock
  if (state === "LOCKED" && segments[1] !== "unlock") {
    return <Redirect href="/unlock" />;
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { flex: 1 },
      }}
    />
  );
}
