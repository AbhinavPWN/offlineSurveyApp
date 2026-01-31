export interface HouseholdInfo {
  householdId: string;

  dateOfListing?: string;
  nameOfChw?: string;

  province?: string;
  districtId?: string;
  vdcnpCode?: string;
  wardNo?: string;

  gpsCoordinates?: string;

  noOfHouseholdMembers?: number;

  typeOfHousing?: string;
  accessToCleanWater?: string;
  accessToSanitation?: string;

  address?: string;

  activeFlag?: string;
  hhClosedDate?: string;

  createdOn?: string;
  createdBy?: string;
}

export interface ValidationResult {
  valid: boolean;
  missingFields: string[];
}

export interface HouseholdInfoRepository {
  getByHouseholdId(householdId: string): Promise<HouseholdInfo | null>;

  upsertDraft(
    householdId: string,
    patch: Partial<HouseholdInfo>,
  ): Promise<void>;

  validateForSubmit(info: HouseholdInfo): ValidationResult;
}
