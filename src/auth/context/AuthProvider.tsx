// The brain in REACT
import React, { createContext, useEffect, useState } from "react";
import { AuthContextValue } from "./AuthContext";
import { AuthService } from "../service/AuthService";
import { verifyPin } from "../service/pinVerifier";
import { AuthSession } from "../model/AuthSession";
import { AuthState } from "../model/AuthState";
import { CHWProfile } from "../model/CHWProfile";

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

const authService = new AuthService();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [chwProfile, setChwProfile] = useState<CHWProfile | null>(null);
  const [state, setState] = useState<AuthState>("LOGGED_OUT");
  const [loading, setLoading] = useState(true);

  //   REstoring session on App Start
  useEffect(() => {
    async function restore() {
      const result = await authService.restoreSession();
      setSession(result.session);
      setState(result.state);
      // IMPORTANT:
      // We do NOT derive CHWProfile here yet.
      // It will be fetched later via API.
      setChwProfile(null);
      setLoading(false);
    }

    restore();
  }, []);

  //   implementing Login. called after a successful API login
  async function login(newSession: AuthSession) {
    const result = await authService.login(newSession);
    setSession(result.session);
    setState(result.state);
    // CHWProfile will be loaded later
    setChwProfile(null);
  }

  async function unlockWithPin(pin: string): Promise<boolean> {
    if (!session) return false;

    const result = await verifyPin(pin, session.offlinePinHash);

    if (result === "OK") {
      setState("UNLOCKED");
      return true;
    }
    return false;
  }

  async function logout() {
    await authService.logout();
    setSession(null);
    setState("LOGGED_OUT");
  }

  // const chwUsername = session?.username ?? null;
  // const idofCHW = session?.idofCHW ?? null;

  // const area = session
  //   ? {
  //       provinceCode: session.provinceCode,
  //       districtCode: session.districtCode,
  //       vdcnpCode: session.vdcnpCode,
  //       wardNo: session.wardNo,
  //     }
  //   : null;

  return (
    <AuthContext.Provider
      value={{
        session,
        state,
        loading,
        login,
        unlockWithPin,
        logout,
        chwProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
