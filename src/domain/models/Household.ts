/**
 * Clean internal model used across app
 */
export interface Household {
  // Identity
  householdId: string; // server-generated
  localId?: string; // for offline-created households

  // Source & sync
  source: "LISTING" | "LOCAL";
  syncStatus: "SYNCED" | "PENDING" | "FAILED";

  // Listing info
  dateOfListingAD: string;
  dateOfListingBS: string;

  chwId: string;
  chwName: string;

  // Location
  provinceId: string;
  provinceName: string;

  districtId: string;
  districtName: string;

  municipalityCode: string;
  municipalityName: string;

  wardNo: number;
  address: string;

  gpsCoordinates?: string | null;

  // Household details
  memberCount: number;
  housingType: string;

  hasCleanWater: boolean;
  hasSanitation: boolean;

  // Lifecycle
  isActive: boolean;
  closedDateAD?: string | null;
  closedDateBS?: string | null;

  // Audit
  createdOn: string;
}
