import { HouseholdMemberLocal } from "../models/householdMember.model";

export interface HouseholdMemberLocalRepository {
  // Creation
  createDraftMember(householdLocalId: string): Promise<HouseholdMemberLocal>;

  // Retrieval
  getByLocalId(localId: string): Promise<HouseholdMemberLocal | null>;
  listByHousehold(householdLocalId: string): Promise<HouseholdMemberLocal[]>;
  listBySyncStatus(status: string): Promise<HouseholdMemberLocal[]>;

  //   Draft Editing
  updateDraft(
    localId: string,
    patch: Partial<HouseholdMemberLocal>,
  ): Promise<void>;

  //   Sync lifecycle
  markPending(localId: string, action: "INSERT" | "UPDATE"): Promise<void>;
  markSynced(localId: string, clientNo: string): Promise<void>;
  markFailed(localId: string): Promise<void>;

  //   Head Household rule
  clearHeadFlagForHousehold(householdLocalId: string): Promise<void>;

  // Delete
  softDelete(localId: string): Promise<void>;

  // Count sync
  recalculateMemberCount(householdLocalId: string): Promise<void>;

  //   helper method
  markAllDraftMembersPending(householdLocalId: string): Promise<void>;

  // Server listing download (snapshot copy)
  insertManyFromListing(
    members: any[],
    householdLocalId: string,
  ): Promise<void>;
}
