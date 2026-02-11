import { Household } from "@/src/domain/models/Household";
import { HouseholdLocalRepository } from "../HouseholdLocalRepository";
import {
  HouseholdLocal,
  SyncAction,
  SyncStatus,
} from "@/src/models/household.model";

import { v4 as uuidv4 } from "uuid";

/**
 * HouseholdLocalRepositoryImpl
 *
 * This is the ONLY place that talks to local DB
 */

export class HouseholdLocalRepositoryImpl implements HouseholdLocalRepository {
  async insertFromListing(h: Household): Promise<void> {
    const household: HouseholdLocal = {
      localId: uuidv4(),

      // Server identity
      householdId: h.householdId,

      // CHW info
      chwUsername: h.chwId,
      idofCHW: h.chwId,

      // Location
      provinceCode: h.provinceId,
      districtCode: h.districtId,
      vdcnpCode: h.municipalityCode,
      wardNo: String(h.wardNo),

      // Listing info
      address: h.address,
      dateoflistingAD: h.dateOfListingAD,
      noofHHMembers: h.memberCount,
      typeofHousing: h.housingType as any,

      accesstoCleanWater: h.hasCleanWater ? "Y" : "N",
      accesstoSanitation: h.hasSanitation ? "Y" : "N",
      activeFlag: h.isActive ? "Y" : "N",

      // Sync state (VERY IMPORTANT)
      syncStatus: "SYNCED",
      syncAction: null,
      lastModifiedAt: Date.now(),
    };

    this.table.push(household);
  }

  async updateFromListing(h: Household): Promise<void> {
    const local = await this.getByHouseholdId(h.householdId);
    if (!local) return;

    // Preventing overwriting  local pending edits
    if (local.syncStatus !== "SYNCED") return;

    local.provinceCode = h.provinceId;
    local.districtCode = h.districtId;
    local.vdcnpCode = h.municipalityCode;
    local.wardNo = String(h.wardNo);

    local.address = h.address;
    local.dateoflistingAD = h.dateOfListingAD;
    local.noofHHMembers = h.memberCount;

    local.accesstoCleanWater = h.hasCleanWater ? "Y" : "N";
    local.accesstoSanitation = h.hasSanitation ? "Y" : "N";
    local.activeFlag = h.isActive ? "Y" : "N";

    local.lastModifiedAt = Date.now();
  }

  private table: HouseholdLocal[] = [];

  async createLocalHousehold(params: {
    chwUsername: string;
    idofCHW: string;
    provinceCode: string;
    districtCode: string;
    vdcnpCode: string;
    wardNo: string;
  }): Promise<HouseholdLocal> {
    const household: HouseholdLocal = {
      localId: uuidv4(),
      chwUsername: params.chwUsername,
      idofCHW: params.idofCHW,

      provinceCode: params.provinceCode,
      districtCode: params.districtCode,
      vdcnpCode: params.vdcnpCode,
      wardNo: params.wardNo,

      address: "",
      dateoflistingAD: "",
      noofHHMembers: 0,
      typeofHousing: "P",
      accesstoCleanWater: "N",
      accesstoSanitation: "N",
      activeFlag: "Y",

      syncStatus: "PENDING",
      syncAction: "INSERT",
      lastModifiedAt: Date.now(),
    };

    this.table.push(household);
    return household;
  }

  async getByLocalId(localId: string): Promise<HouseholdLocal | null> {
    return this.table.find((h) => h.localId === localId) ?? null;
  }

  async getByHouseholdId(householdId: string): Promise<HouseholdLocal | null> {
    return this.table.find((h) => h.householdId === householdId) ?? null;
  }

  async listAllForCHW(chwUsername: string): Promise<HouseholdLocal[]> {
    return this.table.filter((h) => h.chwUsername === chwUsername);
  }

  async listBySyncStatus(
    chwUsername: string,
    status: SyncStatus,
  ): Promise<HouseholdLocal[]> {
    return this.table.filter(
      (h) => h.chwUsername === chwUsername && h.syncStatus === status,
    );
  }

  async updateDraft(
    localId: string,
    patch: Partial<HouseholdLocal>,
  ): Promise<void> {
    const h = await this.getByLocalId(localId);
    if (!h) return;

    Object.assign(h, patch, {
      lastModifiedAt: Date.now(),
    });
  }
  async markPending(localId: string, action: SyncAction): Promise<void> {
    const h = await this.getByLocalId(localId);
    if (!h) return;

    h.syncStatus = "PENDING";
    h.syncAction = action;
    h.lastModifiedAt = Date.now();
  }
  async markSynced(localId: string, serverHouseholdId: string): Promise<void> {
    const h = await this.getByLocalId(localId);
    if (!h) return;

    h.householdId = serverHouseholdId;
    h.syncStatus = "SYNCED";
    h.lastModifiedAt = Date.now();
  }
  async markFailed(localId: string, errorMessage?: string): Promise<void> {
    const h = await this.getByLocalId(localId);
    if (!h) return;

    h.syncStatus = "FAILED";
    h.lastModifiedAt = Date.now();
  }
}
