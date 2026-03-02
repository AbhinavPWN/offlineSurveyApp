import { MemberFormState } from "./MemberFormState";

export function createEmptyMemberFormState(): MemberFormState {
  return {
    // Basic Info

    enrollDate: null,
    fName: "",
    gender: null,
    maritalStatus: null,
    relationtoHH: null,
    headHousehold: false,
    mobileNo: "",

    // Identity

    idDocumentType: null,
    idDocumentNo: "",
    idIssueDistrictCode: null,
    memIdIssueDate: null,
    dob: null,
    minorYn: false,

    // Address

    address1Type: null,
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

    // Misc

    clientBehaviour: "",
    imagePath: null,
  };
}
