import { useEffect, useRef } from "react";
import { useAuth } from "../auth/context/useAuth";
import { SyncHouseholdUseCase } from "../usecases/household/SyncHouseholdUseCase";

/**
 * AppBootstrap
 *
 * Responsibilities:
 * - Trigger household sync ONCE when app becomes usable
 * - Do nothing else
 *
 * This component renders nothing.
 */
interface Props {
  syncHouseholdUseCase: SyncHouseholdUseCase;
}

export function AppBootstrap({ syncHouseholdUseCase }: Props) {
  const { state, chwProfile, session } = useAuth();

  // prevent multiple sync per app session
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (hasSyncedRef.current) return;

    if (state !== "UNLOCKED") return;
    if (!chwProfile) return;
    if (!session?.accessToken) return;
    if (!session.tokenExpireAt) return;

    const now = Date.now();

    // Token expired -> do not sync
    if (session.tokenExpireAt <= now) {
      console.warn("[Sync] Token expired , skipping sync");
      return;
    }

    hasSyncedRef.current = true;

    // Fire and forget (sync handles offline internally)
    syncHouseholdUseCase.execute(chwProfile.userName);
  }, [state, chwProfile, session, syncHouseholdUseCase]);

  return null;
}
