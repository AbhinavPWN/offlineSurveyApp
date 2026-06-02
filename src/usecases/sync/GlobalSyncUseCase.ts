import { SyncHouseholdUseCase } from "../household/SyncHouseholdUseCase";
import { SyncMembersUseCase } from "../members/SyncMemberUseCase";
import { syncPendingSurveys } from "./surveySyncService";
import { SyncContextGuard } from "./SyncContextGuard";
import { AppLogger } from "@/src/utils/AppLogger";

import {
  SyncStep,
  SyncStepStatus,
  SyncEntitySummary,
  createEmptySyncSummary,
  getSafeSyncReason,
  getStepStatus,
} from "./SyncSummary";

export type SyncStepResult = {
  step: SyncStep;
  status: SyncStepStatus;
  message?: string;
  summary: SyncEntitySummary;
};

export type GlobalSyncResult = {
  steps: SyncStepResult[];
};

function createFailedStepSummary(params: {
  id: string;
  label: string;
  reason: string;
}): SyncEntitySummary {
  return {
    total: 1,
    success: 0,
    failed: 1,
    skipped: 0,
    items: [
      {
        id: params.id,
        label: params.label,
        status: "FAILED",
        reason: params.reason,
      },
    ],
  };
}

/**
 * Temporary compatibility helper.
 *
 * Right now some old sync functions may still return void.
 * After we update SyncHouseholdUseCase, SyncMemberUseCase,
 * and syncPendingSurveys, they will return real summaries.
 */
function normalizeSummary(
  summary: SyncEntitySummary | void | undefined,
): SyncEntitySummary {
  if (!summary) {
    return createEmptySyncSummary();
  }

  return summary;
}

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

        const offlineReason = "No internet connection.";

        return {
          steps: [
            {
              step: "HOUSEHOLD",
              status: "FAILED",
              message: offlineReason,
              summary: createFailedStepSummary({
                id: "HOUSEHOLD_OFFLINE",
                label: "Households",
                reason: offlineReason,
              }),
            },
            {
              step: "MEMBER",
              status: "FAILED",
              message: offlineReason,
              summary: createFailedStepSummary({
                id: "MEMBER_OFFLINE",
                label: "Members",
                reason: offlineReason,
              }),
            },
            {
              step: "SURVEY",
              status: "FAILED",
              message: offlineReason,
              summary: createFailedStepSummary({
                id: "SURVEY_OFFLINE",
                label: "Surveys",
                reason: offlineReason,
              }),
            },
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

      const householdSummary = normalizeSummary(
        await this.syncHouseholdUseCase.execute(chwUsername),
      );

      const householdStatus = getStepStatus(householdSummary);

      await AppLogger.log("SYNC", "[HOUSEHOLD][END]", {
        status: householdStatus,
        summary: householdSummary,
      });

      results.push({
        step: "HOUSEHOLD",
        status: householdStatus,
        summary: householdSummary,
      });
    } catch (error: any) {
      const reason = getSafeSyncReason(error);

      await AppLogger.log("ERROR", "[HOUSEHOLD][FAIL]", {
        message: error?.message,
        reason,
      });

      const summary = createFailedStepSummary({
        id: "HOUSEHOLD_SYNC",
        label: "Households",
        reason,
      });

      results.push({
        step: "HOUSEHOLD",
        status: "FAILED",
        message: reason,
        summary,
      });
    }

    // -----------------------------
    // 3. Member Sync
    // -----------------------------
    try {
      await AppLogger.log("SYNC", "[MEMBER][START]");

      const memberSummary = normalizeSummary(
        await this.syncMembersUseCase.execute(chwUsername),
      );

      const memberStatus = getStepStatus(memberSummary);

      await AppLogger.log("SYNC", "[MEMBER][END]", {
        status: memberStatus,
        summary: memberSummary,
      });

      results.push({
        step: "MEMBER",
        status: memberStatus,
        summary: memberSummary,
      });
    } catch (error: any) {
      const reason = getSafeSyncReason(error);

      await AppLogger.log("ERROR", "[MEMBER][FAIL]", {
        message: error?.message,
        reason,
      });

      const summary = createFailedStepSummary({
        id: "MEMBER_SYNC",
        label: "Members",
        reason,
      });

      results.push({
        step: "MEMBER",
        status: "FAILED",
        message: reason,
        summary,
      });
    }

    // -----------------------------
    // 4. Survey Sync
    // -----------------------------
    try {
      await AppLogger.log("SYNC", "[SURVEY][START]");

      const surveySummary = normalizeSummary(
        await syncPendingSurveys(chwUsername),
      );

      const surveyStatus = getStepStatus(surveySummary);

      await AppLogger.log("SYNC", "[SURVEY][END]", {
        status: surveyStatus,
        summary: surveySummary,
      });

      results.push({
        step: "SURVEY",
        status: surveyStatus,
        summary: surveySummary,
      });
    } catch (error: any) {
      const reason = getSafeSyncReason(error);

      await AppLogger.log("ERROR", "[SURVEY][FAIL]", {
        message: error?.message,
        reason,
      });

      const summary = createFailedStepSummary({
        id: "SURVEY_SYNC",
        label: "Surveys",
        reason,
      });

      results.push({
        step: "SURVEY",
        status: "FAILED",
        message: reason,
        summary,
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
