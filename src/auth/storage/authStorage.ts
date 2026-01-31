// Secure Storage Wrapper
import * as SecureStore from "expo-secure-store";
import { AuthSession } from "../model/AuthSession";

const AUTH_SESSION_KEY = "auth-session";

export async function saveAuthSession(session: AuthSession) {
  await SecureStore.setItemAsync(AUTH_SESSION_KEY, JSON.stringify(session));
}

export async function loadAuthSession(): Promise<AuthSession | null> {
  const raw = await SecureStore.getItemAsync(AUTH_SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export async function clearAuthSession() {
  await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
}
