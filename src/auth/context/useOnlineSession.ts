import { useEffect, useState } from "react";
import { Alert, AppState } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "./useAuth";
import { isTokenValid } from "../service/token";

export function useOnlineSession() {
  const { session, state } = useAuth();
  const router = useRouter();
  const [valid, setValid] = useState(() => !!session && isTokenValid(session));
  useEffect(() => {
    const check = () => setValid(!!session && isTokenValid(session));
    check();
    const timer = setTimeout(
      check,
      Math.max(0, (session?.tokenExpireAt ?? Date.now()) - Date.now()),
    );
    const listener = AppState.addEventListener("change", (value) => {
      if (value === "active") check();
    });
    return () => {
      clearTimeout(timer);
      listener.remove();
    };
  }, [session]);
  const requireLogin = () => {
    if (session && isTokenValid(session) && state !== "SESSION_EXPIRED")
      return true;
    setValid(false);
    Alert.alert(
      "Sign in required",
      "Your online session has expired. Saved answers remain on this phone. Sign in to load households or sync surveys.",
      [
        { text: "Later", style: "cancel" },
        { text: "Sign in", onPress: () => router.push("/login") },
      ],
    );
    return false;
  };
  return { valid: valid && state !== "SESSION_EXPIRED", requireLogin };
}
