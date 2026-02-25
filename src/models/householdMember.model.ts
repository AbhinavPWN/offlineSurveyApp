export type MemberSyncStatus = "DRAFT" | "PENDING" | "SYNCED" | "FAILED";
export type MemberSyncAction = "INSERT" | "UPDATE" | null;

export interface HouseholdMemberLocal {
  // Identity
  localId: string;
  clientNo?: string;
  householdLocalId: string;

  // Sync
  syncStatus: MemberSyncStatus;
  syncAction: MemberSyncAction;

  // Enrollment
  enrollDateAD?: string | null;
  enrollDateBS?: string | null;

  // Personal
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: string | null;
  maritalStatus?: string | null;
  religionCode?: string | null;
  casteCode?: string | null;
  relationToHH?: string | null;
  headHousehold?: "Y" | "N";

  // Identity Docs
  idDocumentType?: string | null;
  idDocumentNo?: string;
  idIssueDistrictCode?: string | null;
  idIssueDateAD?: string | null;
  idIssueDateBS?: string;

  // DOB
  dobAD?: string | null;
  dobBS?: string;

  // Contact
  mobileNo?: string;
  minorYn?: "Y" | "N";

  // Address
  address1Type?: string | null;
  address?: string;
  address1Line2?: string | null;
  address1Line3?: string;
  address1DistrictCode?: string | null;
  address1Province?: string | null;

  // Occupation
  occupationCode?: string | null;
  educationCode?: string | null;
  employeeId?: string;
  tranOfficeCode?: string;

  // Financial
  totalAsset?: string;
  totalLiabilities?: string;
  netWorth?: string; // auto-calculated
  soiSalary?: "Y" | "N";
  soiBusIncome?: "Y" | "N";
  soiReturnfrmInvest?: "Y" | "N";
  soiInheritance?: "Y" | "N";
  soiRemittance?: "Y" | "N";
  soiOthers?: "Y" | "N";
  soiAgriculture?: "Y" | "N";

  // Health
  // Health
  healthConditionsYn?: "Y" | "N" | null;
  healthConditions?: string | null;
  disabilityIdentYn?: "Y" | "N" | null;
  disabilityIdent?: string | null;
  seeing?: string | null;
  hearing?: string | null;
  walking?: string | null;
  remembering?: string | null;
  selfCare?: string | null;
  communicating?: string | null;
  disabilityStatus?: string | null;
  pregnancyStatus?: string | null;
  pregnancyDate?: string | null;
  vaccinationStatus?: string | null;
  healthInsCoverage?: string | null;

  // Misc
  clientBehaviour?: string | null;
  imagePath?: string | null;
  imageUploadStatus?: "PENDING" | "UPLOADED" | "FAILED";

  createdAt: number;
  updatedAt: number;
}
