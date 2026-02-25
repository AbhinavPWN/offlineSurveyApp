import { useState } from "react";
import { GlobalSyncUseCase } from "@/src/usecases/sync/GlobalSyncUseCase";
import { loadAuthSession } from "@/src/auth/storage/authStorage";

export function useGlobalSync(globalSync: GlobalSyncUseCase) {
  const [isSyncing, setIsSyncing] = useState(false);

  const sync = async () => {
    if (isSyncing) return;

    try {
      setIsSyncing(true);

      const session = await loadAuthSession();
      if (!session?.userName) {
        throw new Error("User not logged in");
      }

      await globalSync.execute(session.userName);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    sync,
    isSyncing,
  };
}
