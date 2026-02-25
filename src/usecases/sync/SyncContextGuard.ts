import { NetworkService } from "@/src/utils/NetworkService";
import { loadAuthSession } from "@/src/auth/storage/authStorage";
import { isTokenValid } from "@/src/auth/service/token";
import { AppLogger } from "@/src/utils/AppLogger";

export class SyncContextGuard {
  constructor(private readonly networkService: NetworkService) {}

  async ensureValidContext(chwUsername: string): Promise<void> {
    const isOnline = await this.networkService.isOnline();

    if (!isOnline) {
      await AppLogger.log("INFO", "Sync skipped - offline", {
        chwUsername,
      });
      throw new Error("OFFLINE");
    }

    const session = await loadAuthSession();

    if (!session || !isTokenValid(session)) {
      await AppLogger.log("WARN", "Sync aborted - token expired", {
        chwUsername,
      });
      throw new Error("SESSION_EXPIRED");
    }
  }
}
