// src/usecases/household/SyncHouseholdUseCase.ts

import { HouseholdLocalRepository } from "@/src/repositories/HouseholdLocalRepository";
import {
  HouseholdApiService,
  InsertHouseholdPayload,
  UpdateHouseholdPayload,
} from "@/src/services/HouseholdApiService";
import { HouseholdLocal } from "@/src/models/household.model";
import { AppLogger } from "@/src/utils/AppLogger";
import { loadAuthSession } from "@/src/auth/storage/authStorage";

import {
  SyncEntitySummary,
  createEmptySyncSummary,
  getSafeSyncReason,
} from "@/src/usecases/sync/SyncSummary";

function getHouseholdLabel(household: HouseholdLocal): string {
  if (household.address) {
    return household.address;
  }

  if (household.householdId) {
    return household.householdId;
  }

  return "Household";
}

function resolveHouseholdUserId(
  session: Awaited<ReturnType<typeof loadAuthSession>>,
): string {
  const userId = String(session?.employeeId ?? "").trim();

  if (/^\d+$/.test(userId)) {
    return userId;
  }

  return "";
}

export class SyncHouseholdUseCase {
  constructor(
    private readonly householdRepo: HouseholdLocalRepository,
    private readonly householdApi: HouseholdApiService,
  ) {}

  /**
   * Entry point for syncing households.
   * Safe to call multiple times.
   */
  async execute(chwUsername: string): Promise<SyncEntitySummary> {
    await AppLogger.log("SYNC", "[HOUSEHOLD][START]", { chwUsername });

    const pendingHouseholds = await this.householdRepo.listBySyncStatus(
      chwUsername,
      "PENDING",
    );

    const summary = createEmptySyncSummary();
    summary.total = pendingHouseholds.length;

    if (__DEV__) {
      console.log("[SYNC][HOUSEHOLD][PENDING]", {
        count: pendingHouseholds.length,
        pendingHouseholds,
      });
    }

    await AppLogger.log("SYNC", "[HOUSEHOLD][PENDING_FOUND]", {
      count: pendingHouseholds.length,
      chwUsername,
    });

    for (const household of pendingHouseholds) {
      const label = getHouseholdLabel(household);

      await AppLogger.log("SYNC", "[HOUSEHOLD][PROCESSING]", {
        localId: household.localId,
        householdId: household.householdId,
        action: household.syncAction,
        address: household.address,
      });

      try {
        if (household.syncAction === "INSERT") {
          await this.syncInsert(household);
        } else if (household.syncAction === "UPDATE") {
          await this.syncUpdate(household);
        } else {
          throw new Error(`Invalid syncAction: ${household.syncAction}`);
        }

        await AppLogger.log("SYNC", "[HOUSEHOLD][SUCCESS]", {
          localId: household.localId,
          householdId: household.householdId,
          action: household.syncAction,
        });

        summary.success += 1;
        summary.items.push({
          id: household.localId,
          label,
          status: "SUCCESS",
        });
      } catch (error: any) {
        // If session expired → stop whole sync
        if (error?.message === "SESSION_EXPIRED") {
          throw error;
        }

        const reason = getSafeSyncReason(error);

        await AppLogger.log("ERROR", "[HOUSEHOLD][FAIL]", {
          localId: household.localId,
          householdId: household.householdId,
          action: household.syncAction,
          message: error?.message,
          status: error?.response?.status,
          reason,
        });

        await this.householdRepo.markFailed(household.localId);

        summary.failed += 1;
        summary.items.push({
          id: household.localId,
          label,
          status: "FAILED",
          reason,
        });
      }
    }

    await AppLogger.log("SYNC", "[HOUSEHOLD][END]", {
      total: summary.total,
      success: summary.success,
      failed: summary.failed,
      skipped: summary.skipped,
    });

    return summary;
  }

  // Insert flow - household must not exist and server generates householdId
  private async syncInsert(household: HouseholdLocal): Promise<void> {
    if (!household.idofCHW) {
      await AppLogger.log("ERROR", "[HOUSEHOLD][INSERT_ABORT_NO_CHW_ID]", {
        localId: household.localId,
      });

      throw new Error("INVALID_STATE_NO_CHW_ID");
    }

    const session = await loadAuthSession();

    const apiUserId = resolveHouseholdUserId(session);

    if (!apiUserId) {
      await AppLogger.log("ERROR", "[HOUSEHOLD][INSERT_ABORT_NO_USER_ID]", {
        localId: household.localId,
        sessionUserName: session?.userName,
        sessionIdofCHW: session?.idofCHW,
        sessionEmployeeId: session?.employeeId,
      });

      throw new Error(
        "Household userId missing. Please logout, login again, and try sync.",
      );
    }

    const payload: InsertHouseholdPayload = {
      dateofListingAD: household.dateoflistingAD,
      idofCHW: household.idofCHW,
      provinceCode: String(household.provinceCode),
      districtCode: household.districtCode,
      vdcnpCode: household.vdcnpCode,
      wardNo: household.wardNo,
      address: household.address,
      gpsCoordinates: household.gpsCoordinates,
      noofHHMembers: String(household.noofHHMembers),
      typeofHousing: household.typeofHousing,
      accesstoCleanWater: household.accesstoCleanWater,
      accesstoSanitation: household.accesstoSanitation,
      activeFlag: household.activeFlag,
      hhClosedDateAD: "",
      // userId: session?.userName ?? "",
      userId: apiUserId,
      insertUpdate: "I",
    };

    await AppLogger.log("SYNC", "[HOUSEHOLD][INSERT_REQUEST]", {
      localId: household.localId,
      address: household.address,
      wardNo: household.wardNo,
    });

    if (__DEV__) {
      console.log("[SYNC][HOUSEHOLD][INSERT_PAYLOAD]", payload);
    }

    const response = await this.householdApi.insertHousehold(payload);

    await AppLogger.log("SYNC", "[HOUSEHOLD][INSERT_SUCCESS]", {
      localId: household.localId,
      serverHouseholdId: response.outHouseholdId,
    });

    await this.householdRepo.markSynced(
      household.localId,
      response.outHouseholdId,
    );

    await AppLogger.log("SYNC", "[HOUSEHOLD][MARKED_SYNCED]", {
      localId: household.localId,
      serverHouseholdId: response.outHouseholdId,
    });
  }

  // Update flow - household must exist
  private async syncUpdate(household: HouseholdLocal): Promise<void> {
    if (__DEV__) {
      console.log("[SYNC][HOUSEHOLD][ENTER_UPDATE]", {
        localId: household.localId,
        householdId: household.householdId,
      });
    }

    if (!household.idofCHW) {
      await AppLogger.log("ERROR", "[HOUSEHOLD][UPDATE_ABORT_NO_CHW_ID]", {
        localId: household.localId,
        householdId: household.householdId,
      });

      throw new Error("INVALID_STATE_NO_CHW_ID");
    }

    if (!household.householdId) {
      await AppLogger.log(
        "ERROR",
        "[HOUSEHOLD][UPDATE_ABORT_NO_HOUSEHOLD_ID]",
        {
          localId: household.localId,
        },
      );

      throw new Error("Cannot UPDATE household without householdId");
    }

    const session = await loadAuthSession();

    const apiUserId = resolveHouseholdUserId(session);

    if (!apiUserId) {
      await AppLogger.log("ERROR", "[HOUSEHOLD][UPDATE_ABORT_NO_USER_ID]", {
        localId: household.localId,
        householdId: household.householdId,
        sessionUserName: session?.userName,
        sessionIdofCHW: session?.idofCHW,
        sessionEmployeeId: session?.employeeId,
      });

      throw new Error(
        "Household userId missing. Please logout, login again, and try sync.",
      );
    }

    const payload: UpdateHouseholdPayload = {
      householdId: household.householdId,
      dateofListingAD: household.dateoflistingAD,
      idofCHW: household.idofCHW,
      provinceCode: String(household.provinceCode),
      districtCode: household.districtCode,
      vdcnpCode: household.vdcnpCode,
      wardNo: household.wardNo,
      address: household.address,
      gpsCoordinates: household.gpsCoordinates,
      noofHHMembers: String(household.noofHHMembers),
      typeofHousing: household.typeofHousing,
      accesstoCleanWater: household.accesstoCleanWater,
      accesstoSanitation: household.accesstoSanitation,
      activeFlag: household.activeFlag,
      hhClosedDateAD: "",
      // userId: session?.userName ?? "",
      userId: apiUserId,
      insertUpdate: "U",
    };

    await AppLogger.log("SYNC", "[HOUSEHOLD][UPDATE_REQUEST]", {
      localId: household.localId,
      householdId: household.householdId,
      address: household.address,
      wardNo: household.wardNo,
    });

    if (__DEV__) {
      console.log("[SYNC][HOUSEHOLD][UPDATE_PAYLOAD]", payload);
    }

    const response = await this.householdApi.updateHousehold(payload);

    if (__DEV__) {
      console.log("[SYNC][HOUSEHOLD][UPDATE_RESPONSE]", response);
    }

    await this.householdRepo.markSynced(
      household.localId,
      household.householdId,
    );

    await AppLogger.log("SYNC", "[HOUSEHOLD][UPDATE_SUCCESS]", {
      localId: household.localId,
      serverHouseholdId: household.householdId,
    });

    await AppLogger.log("SYNC", "[HOUSEHOLD][MARKED_SYNCED]", {
      localId: household.localId,
      serverHouseholdId: household.householdId,
    });
  }
}
