export type SyncStatus = "SYNCED" | "PENDING" | "FAILED";
export type SyncAction = "INSERT" | "UPDATE" | null;

export interface HouseholdLocal {
  localId: string;
  householdId?: string;
  chwUsername: string;
  idofCHW: string;
  provinceCode: string;
  districtCode: string;
  vdcnpCode: string;
  wardNo: string;
  address: string;
  dateoflistingAD: string;
  noofHHMembers: number;
  typeofHousing: "P" | "S" | "T";
  accesstoCleanWater: "Y" | "N";
  accesstoSanitation: "Y" | "N";
  activeFlag: "Y" | "N";
  syncStatus: SyncStatus;
  syncAction: SyncAction;
  lastModifiedAt: number;
}
