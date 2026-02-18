import { HouseholdLocalRepository } from "@/src/repositories/HouseholdLocalRepository";
import {
  HouseholdApiService,
  InsertHouseholdPayload,
  UpdateHouseholdPayload,
} from "@/src/services/HouseholdApiService";
import { NetworkService } from "@/src/utils/NetworkService";
import { HouseholdLocal } from "@/src/models/household.model";
import { AppLogger } from "@/src/utils/AppLogger";
import { loadAuthSession } from "@/src/auth/storage/authStorage";
import { isTokenValid } from "@/src/auth/service/token";

// Date Formatter helper function
function formatForApi(dateString: string): string {
  if (!dateString) return "";

  const date = new Date(dateString);

  const day = date.getDate().toString().padStart(2, "0");

  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

export class SyncHouseholdUseCase {
  constructor(
    private readonly householdRepo: HouseholdLocalRepository,
    private readonly householdApi: HouseholdApiService,
    private readonly networkService: NetworkService,
  ) {}

  /**
   * Entry point for syncing households.
   * Safe to call multiple times.
   */

  async execute(chwUsername: string): Promise<void> {
    const isOnline = await this.networkService.isOnline();

    if (!isOnline) {
      // Silent exit : Offline first principle
      console.log("sync skipped - offline");
      await AppLogger.log("INFO", "Sync skipped - Intended User is offline ");
      return;
    }

    // Check before Sync
    const session = await loadAuthSession();

    if (!session || !isTokenValid(session)) {
      await AppLogger.log("WARN", "Sync skipped - token expired");
      console.log("Sync aborted - token expire");
      await AppLogger.log("AUTH", "TOKEN_EXPIRED_DURING_SYNC", {
        chwUsername,
      });
      throw new Error("SESSION_EXPIRED");
    }

    await AppLogger.log("SYNC", "Sync started", { chwUsername });
    await AppLogger.log("SYNC_CONTEXT", "Sync context snapshot", {
      chwUsername,
      timestamp: Date.now(),
    });

    const pendingHouseholds = await this.householdRepo.listBySyncStatus(
      chwUsername,
      "PENDING",
    );
    await AppLogger.log("SYNC", "Pending households found", {
      count: pendingHouseholds.length,
      chwUsername,
    });

    for (const household of pendingHouseholds) {
      await AppLogger.log("SYNC_RECORD_PROCESSING", "Processing record", {
        localId: household.localId,
        action: household.syncAction,
        idofCHW: household.idofCHW,
      });

      try {
        if (household.syncAction === "INSERT") {
          await this.syncInsert(household);
        } else if (household.syncAction === "UPDATE") {
          await this.syncUpdate(household);
        } else {
          // Defensive unknown action
          throw new Error(`Invalid syncAction: ${household.syncAction}`);
        }
        await AppLogger.log("SYNC", "Household synced successfully", {
          localId: household.localId,
          action: household.syncAction,
        });
      } catch (error: any) {
        //  If session expired → stop whole sync
        if (error?.message === "SESSION_EXPIRED") {
          throw error;
        }
        // console.log("SYNC ERROR FULL:", {
        //   message: error?.message,
        //   status: error?.response?.status,
        //   data: error?.response?.data,
        // });

        await AppLogger.log("ERROR", "Household sync failed.", {
          localId: household.localId,
          message: error?.message,
          status: error?.response?.status,
          response: error?.response?.data,
        });

        await this.householdRepo.markFailed(household.localId);
      }
    }
    await AppLogger.log("SYNC", "Sync completed", {
      processed: pendingHouseholds.length,
    });
  }

  // Insert flow - household must not exist and server generates householdId
  private async syncInsert(household: HouseholdLocal): Promise<void> {
    if (!household.idofCHW) {
      await AppLogger.log("ERROR", "Missing idofCHW during syncInsert", {
        localId: household.localId,
      });
      throw new Error("INVALID_STATE_NO_CHW_ID");
    }
    const session = await loadAuthSession();

    const payload: InsertHouseholdPayload = {
      dateofListingAD: formatForApi(household.dateoflistingAD),
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
      userId: session?.userName ?? "",
      insertUpdate: "I",
    };
    console.log("INSERT PAYLOAD:", payload);
    console.log("SYNC INSERT IDOFCHW:", household.idofCHW);
    // const session = await loadAuthSession();
    console.log("In SyncInsert SESSION IDOFCHW:", session?.idofCHW);

    const response = await this.householdApi.insertHousehold(payload);
    await AppLogger.log("SYNC_INSERT_SUCCESS", "Insert success", {
      localId: household.localId,
      serverHouseholdId: response.outHouseholdId,
    });

    await this.householdRepo.markSynced(
      household.localId,
      response.outHouseholdId,
    );
  }

  // update flow  - household must exist
  private async syncUpdate(household: HouseholdLocal): Promise<void> {
    if (!household.idofCHW) {
      await AppLogger.log("ERROR", "SYNC_ABORT_NULL_IDOFCHW_UPDATE", {
        localId: household.localId,
      });
      throw new Error("INVALID_STATE_NO_CHW_ID");
    }

    if (!household.householdId) {
      throw new Error("Cannot UPDATE household without householdId");
    }
    const session = await loadAuthSession();

    const payload: UpdateHouseholdPayload = {
      householdId: household.householdId,
      dateofListingAD: formatForApi(household.dateoflistingAD),
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
      userId: session?.userName ?? "",
      insertUpdate: "U",
    };

    await this.householdApi.updateHousehold(payload);

    await this.householdRepo.markSynced(
      household.localId,
      household.householdId,
    );

    await AppLogger.log("SYNC_UPDATE_SUCCESS", "Update success", {
      localId: household.localId,
      serverHouseholdId: household.householdId,
    });
  }
}
