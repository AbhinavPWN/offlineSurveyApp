import { MemberFormState } from "./MemberFormState";

export function createEmptyMemberFormState(): MemberFormState {
  return {
    householdLocalId: "",
    // Basic Info

    enrollDate: new Date().toISOString().split("T")[0],
    fName: "",
    gender: null,
    maritalStatus: null,
    relationtoHH: null,
    headHousehold: false,
    mobileNo: "",
    clientAge: "",

    // Identity

    idDocumentType: "CITIZENSHIP",
    idDocumentNo: "NA",
    idIssueDistrictCode: "000",
    memIdIssueDate: null,
    dob: null,
    minorYn: false,

    // Address

    address1Type: "P", // Default to Permanent
    address: "",
    address1Line2: "",
    address1Line3: "",
    address1DistrictCode: "",
    address1Province: "",

    // Occupation & Social

    casteCode: null,
    religionCode: null,
    occupationCode: null,
    educationCode: null,

    // Financial

    totalAsset: 0,
    totalLiabilities: 0,
    netWorth: 0,

    soiSalary: false,
    soiBusIncome: false,
    soiReturnfrmInvest: false,
    soiInheritance: false,
    soiRemittance: false,
    soiOthers: false,
    soiAgriculture: false,

    // Health

    healthConditionsYn: false,
    healthConditions: "",

    disabilityIdentYn: false,
    disabilityIdent: "",

    seeing: null,
    hearing: null,
    walking: null,
    remembering: null,
    selfCare: null,
    communicating: null,

    disabilityStatus: null,

    pregnancyStatus: null,
    pregnancyDate: null,
    motherofChild: false,
    childDob: null,

    vaccinationStatus: null,
    healthInsCoverage: null,

    healthConditionsDia: false,
    healthConditionsHyp: false,
    healthConditionsCar: false,
    healthConditionsChr: false,
    healthConditionsOth: false,
    healthConditionsOthers: "",

    // Misc

    clientBehaviour: "",
    imagePath: null,
  };
}
