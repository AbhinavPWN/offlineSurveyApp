import { HouseholdLocalRepository } from "@/src/repositories/HouseholdLocalRepository";
import {
  HouseholdApiService,
  InsertHouseholdPayload,
  UpdateHouseholdPayload,
} from "@/src/services/HouseholdApiService";
import { NetworkService } from "@/src/utils/NetworkService";
import { HouseholdLocal } from "@/src/models/household.model";

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
      return;
    }

    const pendingHouseholds = await this.householdRepo.listBySyncStatus(
      chwUsername,
      "PENDING",
    );

    for (const household of pendingHouseholds) {
      try {
        if (household.syncAction === "INSERT") {
          await this.syncInsert(household);
        } else if (household.syncAction === "UPDATE") {
          await this.syncUpdate(household);
        } else {
          // Defensive unknown action
          throw new Error(`Unknown syncAction: ${household.syncAction}`);
        }
      } catch (error) {
        await this.householdRepo.markFailed(
          household.localId,
          error instanceof Error ? error.message : " Unknown sync error ",
        );
      }
    }
  }

  // Insert flow - household must not exist and server generates householdId
  private async syncInsert(household: HouseholdLocal): Promise<void> {
    const payload: InsertHouseholdPayload = {
      dateofListingAD: household.dateoflistingAD,
      idofCHW: household.idofCHW,
      provinceCode: household.provinceCode,
      districtCode: household.districtCode,
      vdcnpCode: household.vdcnpCode,
      wardNo: household.wardNo,
      address: household.address,
      gpsCoordinates: "",
      noofHHMembers: String(household.noofHHMembers),
      typeofHousing: household.typeofHousing,
      accesstoCleanWater: household.accesstoCleanWater,
      accesstoSanitation: household.accesstoSanitation,
      activeFlag: household.activeFlag,
      hhClosedDateAD: "",
      userId: "",
      insertUpdate: "I",
    };
    const response = await this.householdApi.insertHousehold(payload);

    await this.householdRepo.markSynced(
      household.localId,
      response.outHouseholdId,
    );
  }

  // update flow  - household must exist
  private async syncUpdate(household: HouseholdLocal): Promise<void> {
    if (!household.householdId) {
      throw new Error("Cannot UPDATE household without householdId");
    }

    const payload: UpdateHouseholdPayload = {
      householdId: household.householdId,
      dateofListingAD: household.dateoflistingAD,
      idofCHW: household.idofCHW,
      provinceCode: household.provinceCode,
      districtCode: household.districtCode,
      vdcnpCode: household.vdcnpCode,
      wardNo: household.wardNo,
      address: household.address,
      gpsCoordinates: "",
      noofHHMembers: String(household.noofHHMembers),
      typeofHousing: household.typeofHousing,
      accesstoCleanWater: household.accesstoCleanWater,
      accesstoSanitation: household.accesstoSanitation,
      activeFlag: household.activeFlag,
      hhClosedDateAD: "",
      userId: "",
      insertUpdate: "U",
    };

    await this.householdApi.updateHousehold(payload);

    await this.householdRepo.markSynced(
      household.localId,
      household.householdId,
    );
  }
}
