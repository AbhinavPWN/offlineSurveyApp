export type HouseholdStatus = "DRAFT" | "SUBMITTED";

export interface Household {
  id: string; // local UUID
  householdCode: string; //Client/BusinessID

  status: HouseholdStatus;
  isActive: boolean;

  createdByUserId: string;
  chwId?: string;

  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export interface HouseholdRepository {
  startHousehold(params: {
    householdCode: string;
    createdByUserId: string;
    chwId?: string;
  }): Promise<string>;

  getHouseholdById(id: string): Promise<Household | null>;

  getHouseholdByCode(householdCode: string): Promise<Household | null>;

  // updateDraftHousehold(
  //   id: string,
  //   patch: Partial<Omit<Household, "id" | "householdCode" | "status">>,
  // ): Promise<void>;

  submitHousehold(id: string): Promise<void>;

  listDraftHouseholds(): Promise<Household[]>;

  listSubmittedHouseholds(): Promise<Household[]>;
}
