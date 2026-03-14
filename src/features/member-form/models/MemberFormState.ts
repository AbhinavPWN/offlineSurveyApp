export interface MemberFormState {
  // Basic Info
  enrollDate: string | null; // ISO YYYY-MM-DD
  fName: string;
  gender: string | null;
  maritalStatus: string | null;
  relationtoHH: string | null;
  headHousehold: boolean;
  mobileNo: string;

  clientAge: string;

  // Identity

  idDocumentType: string | null;
  idDocumentNo: string;
  idIssueDistrictCode: string | null;
  memIdIssueDate: string | null; // ISO
  dob: string | null; // ISO
  minorYn: boolean;

  // Address

  address1Type: string | null;
  address: string;
  address1Line3: string;
  address1Province: string;
  address1DistrictCode: string;
  address1Line2: string;

  // Occupation & Social

  casteCode: string | null;
  religionCode: string | null;
  occupationCode: string | null;
  educationCode: string | null;

  // Financial

  totalAsset: number;
  totalLiabilities: number;
  netWorth: number;

  soiSalary: boolean;
  soiBusIncome: boolean;
  soiReturnfrmInvest: boolean;
  soiInheritance: boolean;
  soiRemittance: boolean;
  soiOthers: boolean;
  soiAgriculture: boolean;

  // Health

  healthConditionsYn: boolean;
  healthConditions: string;

  disabilityIdentYn: boolean;
  disabilityIdent: string;

  seeing: string | null;
  hearing: string | null;
  walking: string | null;
  remembering: string | null;
  selfCare: string | null;
  communicating: string | null;

  disabilityStatus: string | null;

  pregnancyStatus: string | null;
  pregnancyDate: string | null;

  motherofChild: boolean;
  childDob: string | null;

  vaccinationStatus: string | null;
  healthInsCoverage: string | null;

  healthConditionsDia: boolean;
  healthConditionsHyp: boolean;
  healthConditionsCar: boolean;
  healthConditionsChr: boolean;
  healthConditionsOth: boolean;
  healthConditionsOthers: string;

  // Misc

  clientBehaviour: string;
  imagePath: string | null;
}
