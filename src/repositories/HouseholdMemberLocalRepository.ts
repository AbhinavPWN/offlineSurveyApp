import { HouseholdMemberLocal } from "../models/householdMember.model";

export interface HouseholdMemberLocalRepository {
  // Creation
  createDraftMember(householdLocalId: string): Promise<HouseholdMemberLocal>;

  // Retrieval
  getByLocalId(localId: string): Promise<HouseholdMemberLocal | null>;
  listByHousehold(householdLocalId: string): Promise<HouseholdMemberLocal[]>;
  listBySyncStatus(status: string): Promise<HouseholdMemberLocal[]>;
  getByClientNo(clientNo: string): Promise<HouseholdMemberLocal | null>;

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
  // WARNING:
  // household_member_count stores the declared household size entered in
  // the household form. It must not be recalculated from local member rows.
  // Do not call this method for member insert/update/sync.
  recalculateMemberCount(householdLocalId: string): Promise<void>;

  //   helper method
  markAllDraftMembersPending(householdLocalId: string): Promise<void>;

  // Server listing download (snapshot copy)
  insertManyFromListing(
    members: any[],
    householdLocalId: string,
  ): Promise<void>;
}
