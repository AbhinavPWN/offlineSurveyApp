import { HouseholdMemberLocal } from "@/src/models/householdMember.model";
import { convertApiDateToISO } from "@/src/utils/dateUtils";

/**
 * Strict Y/N normalizer
 * - Only "Y" becomes "Y"
 * - Everything else becomes "N"
 */
const normalizeYN = (val?: string | null): "Y" | "N" => {
  if (val === "Y") return "Y";
  if (val === "N") return "N";

  if (val !== undefined && val !== null) {
    console.warn("⚠ Unexpected Y/N value from server:", val);
  }

  return "N";
};

/**
 * Safe string normalizer
 */
const normalizeString = (val?: string | null): string | undefined => {
  if (val === null || val === undefined) return undefined;
  return String(val);
};

/**
 * Safe number → string normalization
 */
const normalizeNumberString = (val: any): string => {
  if (val === null || val === undefined || val === "") return "0";
  return String(val);
};

export function mapServerMemberToDb(
  m: any,
  householdLocalId: string,
): Partial<HouseholdMemberLocal> {
  return {
    clientNo: normalizeString(m.clienT_NO),
    householdLocalId,

    enrollDateAD: convertApiDateToISO(m.enrolL_DATE),
    enrollDateBS: normalizeString(m.enrolL_DATE_BS),

    firstName: normalizeString(m.fname),
    middleName: normalizeString(m.middlE_NAME),
    lastName: normalizeString(m.lname),

    gender: normalizeString(m.gender),
    maritalStatus: normalizeString(m.maritaL_STATUS),
    religionCode: normalizeString(m.religioN_CODE),
    casteCode: normalizeString(m.castE_CODE),
    relationToHH: normalizeString(m.relationshiP_TO_HEAD_HOUSEHOLD),

    headHousehold: normalizeYN(m.heaD_HOUSEHOLD),

    idDocumentType: normalizeString(m.iD_DOCUMENT_TYPE),
    idDocumentNo: normalizeString(m.iD_DOCUMENT_NO),
    idIssueDistrictCode: normalizeString(m.iD_ISSUE_DISTRICT_CODE),
    idIssueDateAD: convertApiDateToISO(m.meM_IDENTITY_ISSUE_DATE),
    idIssueDateBS: normalizeString(m.meM_IDENTITY_ISSUE_DATE_BS),

    dobAD: convertApiDateToISO(m.dob),
    dobBS: normalizeString(m.doB_BS),
    clientAge: normalizeString(m.client_age),

    mobileNo: normalizeString(m.mobilE_NO),
    minorYn: normalizeYN(m.minoR_Y_N),

    address1Type: normalizeString(m.addresS_1_TYPE),
    address: normalizeString(m.address),
    address1Line2: normalizeString(m.addresS_1_LINE2),
    address1Line3: normalizeString(m.addresS_1_LINE3),
    address1DistrictCode: normalizeString(m.addresS_1_DISTRICT),
    address1Province: normalizeString(m.provincE1),

    occupationCode: normalizeString(m.occupatioN_CODE),
    educationCode: normalizeString(m.educatioN_CODE),
    employeeId: normalizeString(m.employeE_ID),
    tranOfficeCode: normalizeString(m.traN_OFFICE_CODE),

    totalAsset: normalizeNumberString(m.totaL_ASSET),
    totalLiabilities: normalizeNumberString(m.totaL_LIABILITIES),
    netWorth: normalizeNumberString(m.neT_WORTH),

    soiSalary: normalizeYN(m.soI_SALARY),
    soiBusIncome: normalizeYN(m.soI_BUS_INCOME),
    soiReturnfrmInvest: normalizeYN(m.soI_RETURN_FRM_INVEST),
    soiInheritance: normalizeYN(m.soI_INHERITANCE),
    soiRemittance: normalizeYN(m.soI_REMITTANCE),
    soiOthers: normalizeYN(m.soI_OTHERS),
    soiAgriculture: normalizeYN(m.soI_AGRICULTURE),

    healthConditionsYn: normalizeYN(m.healtH_CONDITIONS_YN),
    healthConditions: normalizeString(m.healtH_CONDITIONS),

    disabilityIdentYn: normalizeYN(m.disabilitY_IDENTIFICATION_YN),
    disabilityIdent: normalizeString(m.disabilitY_IDENTIFICATION),

    seeing: normalizeYN(m.seeing),
    hearing: normalizeYN(m.hearing),
    walking: normalizeYN(m.walking),
    remembering: normalizeYN(m.remembering),
    selfCare: normalizeYN(m.selF_CARE),
    communicating: normalizeYN(m.communicating),

    disabilityStatus: normalizeYN(m.disabilitY_STATUS),

    pregnancyStatus: normalizeYN(m.pregnancY_STATUS),
    pregnancyDateAD: convertApiDateToISO(m.pregnancY_DATE),

    motherofChild: normalizeYN(m.mother_of_child),
    childDobAD: convertApiDateToISO(m.child_dob),

    vaccinationStatus: normalizeYN(m.vaccinatioN_STATUS),
    healthInsCoverage: normalizeYN(m.healtH_INSURANCE_COVERAGE),

    healthConditionsDia: normalizeYN(m.healtH_CONDITIONS_dia),
    healthConditionsHyp: normalizeYN(m.healtH_CONDITIONS_hyp),
    healthConditionsCar: normalizeYN(m.healtH_CONDITIONS_car),
    healthConditionsChr: normalizeYN(m.healtH_CONDITIONS_chr),
    healthConditionsOth: normalizeYN(m.healtH_CONDITIONS_oth),
    healthConditionsOthers: normalizeString(m.healtH_CONDITIONS_others),

    clientBehaviour: normalizeString(m.clienT_BEHAVIOUR),
    imagePath: normalizeString(m.imagE_PATH),
  };
}
