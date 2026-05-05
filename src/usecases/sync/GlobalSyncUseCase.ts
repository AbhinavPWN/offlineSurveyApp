import { SyncHouseholdUseCase } from "../household/SyncHouseholdUseCase";
import { SyncMembersUseCase } from "../members/SyncMemberUseCase";
import { syncPendingSurveys } from "./surveySyncService";
import { SyncContextGuard } from "./SyncContextGuard";
import { AppLogger } from "@/src/utils/AppLogger";

//  NEW TYPES
export type SyncStep = "HOUSEHOLD" | "MEMBER" | "SURVEY";

export type SyncStepResult = {
  step: SyncStep;
  status: "SUCCESS" | "FAILED";
  message?: string;
};

export type GlobalSyncResult = {
  steps: SyncStepResult[];
};

export class GlobalSyncUseCase {
  constructor(
    private readonly syncGuard: SyncContextGuard,
    private readonly syncHouseholdUseCase: SyncHouseholdUseCase,
    private readonly syncMembersUseCase: SyncMembersUseCase,
  ) {}

  async execute(chwUsername: string): Promise<GlobalSyncResult> {
    const results: SyncStepResult[] = [];

    // -----------------------------
    // 1. Validate Context
    // -----------------------------
    try {
      await this.syncGuard.ensureValidContext(chwUsername);
    } catch (error: any) {
      if (error?.message === "OFFLINE") {
        await AppLogger.log("SYNC", "[GLOBAL][SKIPPED_OFFLINE]", {
          chwUsername,
        });

        return {
          steps: [
            { step: "HOUSEHOLD", status: "FAILED", message: "Offline" },
            { step: "MEMBER", status: "FAILED", message: "Offline" },
            { step: "SURVEY", status: "FAILED", message: "Offline" },
          ],
        };
      }

      if (error?.message === "SESSION_EXPIRED") {
        await AppLogger.log("AUTH", "[GLOBAL][SESSION_EXPIRED]");
        throw error;
      }

      throw error;
    }

    await AppLogger.log("SYNC", "[GLOBAL][START]", {
      chwUsername,
      timestamp: Date.now(),
    });

    // -----------------------------
    // 2. Household Sync
    // -----------------------------
    try {
      await AppLogger.log("SYNC", "[HOUSEHOLD][START]");

      await this.syncHouseholdUseCase.execute(chwUsername);

      await AppLogger.log("SYNC", "[HOUSEHOLD][SUCCESS]");

      results.push({
        step: "HOUSEHOLD",
        status: "SUCCESS",
      });
    } catch (error: any) {
      await AppLogger.log("ERROR", "[HOUSEHOLD][FAIL]", {
        message: error?.message,
      });

      results.push({
        step: "HOUSEHOLD",
        status: "FAILED",
        message: error?.message,
      });
    }

    // -----------------------------
    // 3. Member Sync
    // -----------------------------
    try {
      await AppLogger.log("SYNC", "[MEMBER][START]");

      await this.syncMembersUseCase.execute(chwUsername);

      await AppLogger.log("SYNC", "[MEMBER][SUCCESS]");

      results.push({
        step: "MEMBER",
        status: "SUCCESS",
      });
    } catch (error: any) {
      await AppLogger.log("ERROR", "[MEMBER][FAIL]", {
        message: error?.message,
      });

      results.push({
        step: "MEMBER",
        status: "FAILED",
        message: error?.message,
      });
    }

    // -----------------------------
    // 4. Survey Sync
    // -----------------------------
    try {
      await AppLogger.log("SYNC", "[SURVEY][START]");

      await syncPendingSurveys(chwUsername);

      await AppLogger.log("SYNC", "[SURVEY][SUCCESS]");

      results.push({
        step: "SURVEY",
        status: "SUCCESS",
      });
    } catch (error: any) {
      await AppLogger.log("ERROR", "[SURVEY][FAIL]", {
        message: error?.message,
      });

      results.push({
        step: "SURVEY",
        status: "FAILED",
        message: error?.message,
      });
    }

    // -----------------------------
    // 5. End
    // -----------------------------
    await AppLogger.log("SYNC", "[GLOBAL][END]", {
      results,
    });

    return { steps: results };
  }
}
