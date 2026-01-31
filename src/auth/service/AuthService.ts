// AUTH SERVICE (BRAIN / ORCHESTRATES)

import { AuthSession } from "../model/AuthSession";
import { AuthState } from "../model/AuthState";
import {
  loadAuthSession,
  saveAuthSession,
  clearAuthSession,
} from "../storage/authStorage";
import { isTokenValid } from "./token";

export class AuthService {
  async restoreSession(): Promise<{
    session: AuthSession | null;
    state: AuthState;
  }> {
    const session = await loadAuthSession();

    if (!session) {
      return { session: null, state: "LOGGED_OUT" };
    }

    if (isTokenValid(session)) {
      return { session, state: "UNLOCKED" };
    }
    return { session, state: "LOCKED" };
  }

  async login(session: AuthSession): Promise<{
    session: AuthSession;
    state: AuthState;
  }> {
    await saveAuthSession(session);
    return { session, state: "UNLOCKED" };
  }

  async logout() {
    await clearAuthSession();
  }
}
