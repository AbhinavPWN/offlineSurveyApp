import {
  HouseholdLocal,
  SyncAction,
  SyncStatus,
} from "../models/household.model";
import { Household } from "../domain/models/Household";

export interface HouseholdLocalRepository {
  //Creation
  createLocalHousehold(params: {
    chwUsername: string;
    idofCHW: string;
    provinceCode: string;
    districtCode: string;
    vdcnpCode: string;
    wardNo: string;
  }): Promise<HouseholdLocal>;

  // Retrieval
  getByLocalId(localId: string): Promise<HouseholdLocal | null>;

  getByHouseholdId(householdId: string): Promise<HouseholdLocal | null>;

  listAllForCHW(chwUsername: string): Promise<HouseholdLocal[]>;

  listBySyncStatus(
    chwUsername: string,
    status: SyncStatus,
  ): Promise<HouseholdLocal[]>;

  // Draft/Edit
  updateDraft(localId: string, patch: Partial<HouseholdLocal>): Promise<void>;

  // Sync Lifecycle

  markPending(localId: string, action: SyncAction): Promise<void>;

  markSynced(localId: string, serverHouseholdId: string): Promise<void>;

  markFailed(localId: string, errorMessage?: string): Promise<void>;

  // Server Listing Integration
  insertFromListing(household: Household): Promise<void>;
  updateFromListing(household: Household): Promise<void>;
}
