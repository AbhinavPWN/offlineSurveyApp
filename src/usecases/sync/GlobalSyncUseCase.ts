import { SyncHouseholdUseCase } from "../household/SyncHouseholdUseCase";
import { SyncMembersUseCase } from "../members/SyncMemberUseCase";
import { SyncContextGuard } from "./SyncContextGuard";
import { AppLogger } from "@/src/utils/AppLogger";

export class GlobalSyncUseCase {
  constructor(
    private readonly syncGuard: SyncContextGuard,
    private readonly syncHouseholdUseCase: SyncHouseholdUseCase,
    private readonly syncMembersUseCase: SyncMembersUseCase,
  ) {}

  async execute(chwUsername: string): Promise<void> {
    try {
      await this.syncGuard.ensureValidContext(chwUsername);
    } catch (error: any) {
      if (error?.message === "OFFLINE") {
        await AppLogger.log("SYNC", "Global sync skipped - offline");
        return;
      }

      if (error?.message === "SESSION_EXPIRED") {
        await AppLogger.log("AUTH", "Global sync aborted - token expired");
        throw error;
      }

      throw error;
    }

    await AppLogger.log("SYNC", "Global sync started", {
      chwUsername,
      timestamp: Date.now(),
    });

    try {
      // 1. Sync households first
      await this.syncHouseholdUseCase.execute(chwUsername);

      // 2. Then sync members
      await this.syncMembersUseCase.execute(chwUsername);

      await AppLogger.log("SYNC", "Global sync completed successfully");
    } catch (error: any) {
      await AppLogger.log("ERROR", "Global sync failed", {
        message: error?.message,
      });

      throw error;
    }
  }
}
