// The brain in REACT
import React, { createContext, useEffect, useState } from "react";
import { AuthContextValue } from "./AuthContext";
import { AuthService } from "../service/AuthService";
import { verifyPin } from "../service/pinVerifier";
import { AuthSession } from "../model/AuthSession";
import { AuthState } from "../model/AuthState";
import { CHWProfile } from "../model/CHWProfile";
import { householdApiService } from "@/src/di/container";
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

  //   Restoring session on App Start
  useEffect(() => {
    async function restore() {
      await AppLogger.log("AUTH", "SESSION_RESTORE_ATTEMPT");

      try {
        const result = await authService.restoreSession();

        if (result.session) {
          const normalizedUserName = result.session.userName.toLowerCase();

          const normalizedSession = {
            ...result.session,
            userName: normalizedUserName,
          };

          if (!normalizedSession.idofCHW) {
            await AppLogger.log("ERROR", "SESSION_RESTORE_MISSING_CHW_ID", {
              userName: normalizedUserName,
            });

            await authService.logout();
            setSession(null);
            setChwProfile(null);
            setState("LOGGED_OUT");
            setLoading(false);
            return;
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

  //   implementing Login. called after a successful API login
  async function login(newSession: AuthSession) {
    await AppLogger.log("AUTH", "LOGIN_ATTEMPT", {
      userName: newSession.userName,
      officeCode: newSession.officeCode,
    });

    try {
      const result = await authService.login(newSession);

      const normalizedUserName = result.session.userName.toLowerCase();

      let chwId: string;

      try {
        const listing =
          await householdApiService.getHouseholdListing(normalizedUserName);

        if (!listing || listing.length === 0) {
          throw new Error("No households found to resolve CHW ID.");
        }

        chwId = listing[0].chwId;

        await AppLogger.log("AUTH", "CHW_ID_RESOLVED", {
          userName: normalizedUserName,
          idofCHW: chwId,
        });
      } catch (error: any) {
        await AppLogger.log("ERROR", "CHW_ID_RESOLUTION_FAILED", {
          userName: normalizedUserName,
          message: error?.message,
        });
        throw new Error("LOGIN_FAILED_NO_CHW_ID");
      }

      const normalizedSession: AuthSession = {
        ...result.session,
        userName: normalizedUserName,
        idofCHW: chwId,
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

      // Setting GLOBAL meta variable for APPLogger
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
