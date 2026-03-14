// The brain in REACT
import React, { createContext, useEffect, useState } from "react";
import { AuthContextValue } from "./AuthContext";
import { AuthService } from "../service/AuthService";
import { verifyPin } from "../service/pinVerifier";
import { AuthSession } from "../model/AuthSession";
import { AuthState } from "../model/AuthState";
import { CHWProfile } from "../model/CHWProfile";
import { AppLogger } from "@/src/utils/AppLogger";

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

const authService = new AuthService();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [chwProfile, setChwProfile] = useState<CHWProfile | null>(null);
  const [state, setState] = useState<AuthState>("LOGGED_OUT");
  const [loading, setLoading] = useState(true);

  // Restore session on app start
  useEffect(() => {
    async function restore() {
      await AppLogger.log("AUTH", "SESSION_RESTORE_ATTEMPT");

      try {
        const result = await authService.restoreSession();

        if (result.session?.userName) {
          const normalizedUserName = result.session.userName
            .trim()
            .toLowerCase();

          const normalizedSession: AuthSession = {
            ...result.session,
            userName: normalizedUserName,
          };

          if (!normalizedSession.idofCHW) {
            normalizedSession.idofCHW = normalizedUserName;

            await AppLogger.log("AUTH", "SESSION_RESTORE_FIXED_CHW_ID", {
              userName: normalizedUserName,
              idofCHW: normalizedSession.idofCHW,
            });
          }

          setSession(normalizedSession);
          setState(result.state);

          AppLogger.setGlobalMeta({
            userName: normalizedUserName,
            idofCHW: normalizedSession.idofCHW,
          });

          setChwProfile({
            userName: normalizedUserName,
            idofCHW: normalizedSession.idofCHW,
            officeCode: normalizedSession.officeCode,
            provinceCode: "",
            districtCode: "",
            vdcnpCode: "",
            wardNo: "",
          });

          await AppLogger.log("AUTH", "SESSION_RESTORE_SUCCESS", {
            userName: normalizedUserName,
            idofCHW: normalizedSession.idofCHW,
            state: result.state,
          });
        } else {
          setSession(null);
          setChwProfile(null);
          setState(result.state);

          await AppLogger.log("AUTH", "SESSION_RESTORE_NO_SESSION");
        }
      } catch (error: any) {
        await AppLogger.log("ERROR", "SESSION_RESTORE_FAILED", {
          message: error?.message,
        });
      } finally {
        setLoading(false);
      }
    }

    restore();
  }, []);

  // Login implementation
  async function login(newSession: AuthSession) {
    await AppLogger.log("AUTH", "LOGIN_ATTEMPT", {
      userName: newSession.userName,
      officeCode: newSession.officeCode,
    });

    try {
      const result = await authService.login(newSession);

      if (!result.session?.userName) {
        throw new Error("LOGIN_INVALID_SESSION");
      }

      if (!result.session?.accessToken) {
        throw new Error("LOGIN_TOKEN_MISSING");
      }

      const normalizedUserName = result.session.userName.trim().toLowerCase();

      // CHW identity = login username
      const chwId = normalizedUserName;

      await AppLogger.log("AUTH", "CHW_ID_RESOLVED", {
        userName: normalizedUserName,
        idofCHW: chwId,
        employeeId: undefined,
      });

      // const normalizedSession: AuthSession = {
      //   ...result.session,
      //   userName: normalizedUserName,
      //   idofCHW: chwId,
      // };
      const normalizedSession: AuthSession = {
        ...result.session,
        userName: normalizedUserName,
        idofCHW: normalizedUserName, // CHW identity
        employeeId: result.session.employeeId ?? undefined, // optional
      };

      await authService.login(normalizedSession);

      setSession(normalizedSession);
      setState(result.state);

      setChwProfile({
        userName: normalizedUserName,
        idofCHW: chwId,
        officeCode: normalizedSession.officeCode,
        provinceCode: "",
        districtCode: "",
        vdcnpCode: "",
        wardNo: "",
      });

      // Set global logger metadata
      AppLogger.setGlobalMeta({
        userName: normalizedUserName,
        idofCHW: chwId,
      });

      await AppLogger.log("AUTH", "LOGIN_SUCCESS", {
        userName: normalizedUserName,
        idofCHW: chwId,
      });
    } catch (error: any) {
      await AppLogger.log("ERROR", "LOGIN_FAILED", {
        userName: newSession.userName,
        message: error?.message,
      });

      throw error;
    }
  }

  async function unlockWithPin(pin: string): Promise<boolean> {
    if (!session) {
      await AppLogger.log("ERROR", "PIN_UNLOCK_NO_SESSION");
      return false;
    }

    const result = await verifyPin(pin, session.offlinePinHash);

    if (result === "OK") {
      setState("UNLOCKED");

      await AppLogger.log("AUTH", "PIN_UNLOCK_SUCCESS", {
        userName: session.userName,
      });

      return true;
    }

    await AppLogger.log("WARN", "PIN_UNLOCK_FAILED", {
      userName: session.userName,
    });

    return false;
  }

  async function logout() {
    await AppLogger.log("AUTH", "LOGOUT_INITIATED", {
      userName: session?.userName,
    });

    await authService.logout();

    setSession(null);
    setChwProfile(null);
    setState("LOGGED_OUT");

    AppLogger.setGlobalMeta({});

    await AppLogger.log("AUTH", "LOGOUT_COMPLETED");
  }

  async function expireSession() {
    await AppLogger.log("AUTH", "SESSION_EXPIRED_TRIGGERED", {
      userName: session?.userName,
    });

    setState("SESSION_EXPIRED");
  }

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
        expireSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
