// LOCAL -> API Payload Mapping

import {
  InsertMemberPayload,
  UpdateMemberPayload,
} from "../../MemberApiService";

function formatForApi(dateString?: string): string {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return "";

  const day = date.getDate().toString().padStart(2, "0");

  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

export interface MemberLocal {
  localId: string;
  clientNo?: string;

  firstName: string;
  middleName?: string;
  lastName?: string;

  dobAD: string;
  clientAge: string;
  enrollDateAD: string;

  mobileNo: string;
  minorYn: boolean;
  gender: string;
  maritalStatus: string;

  casteCode: string;
  occupationCode: string;
  educationCode: string;
  religionCode: string;

  idDocumentType: string;
  idDocumentNo: string;
  idIssueDistrictCode: string;
  idIssueDateAD: string;

  address: string;
  address1Type: string;
  address1Line2: string;
  address1Line3: string;
  address1DistrictCode: string;
  address1Province: string;

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

  clientBehaviour: string;

  headHousehold: "Y" | "N";
  relationToHH: string;

  healthConditionsYn: boolean;
  healthConditions: string;

  disabilityIdentYn: boolean;
  disabilityIdent: string;

  seeing: string;
  hearing: string;
  walking: string;
  remembering: string;
  selfCare: string;
  communicating: string;

  disabilityStatus: string;

  pregnancyStatus: string;
  pregnancyDateAD?: string;

  motherofChild: boolean;
  childDobAD?: string;

  vaccinationStatus: string;
  healthInsCoverage: string;

  healthConditionsDia: boolean;
  healthConditionsHyp: boolean;
  healthConditionsCar: boolean;
  healthConditionsChr: boolean;
  healthConditionsOth: boolean;
  healthConditionsOthers: string;

  imagePath?: string;
}

// Insert Mapper

export function mapMemberToInsertPayload(
  member: MemberLocal,
  householdId: string,
  user: string,
  employeeId: string,
): InsertMemberPayload {
  return {
    enrollDate: formatForApi(member.enrollDateAD),
    maritalStatus: member.maritalStatus,
    idDocumentType: member.idDocumentType,
    idDocumentNo: member.idDocumentNo ?? "",
    idIssueDistrictCode: member.idIssueDistrictCode,
    memIdIssueDate: formatForApi(member.idIssueDateAD),
    employeeId: employeeId || user,
    casteCode: member.casteCode,
    fName: member.firstName ?? "",
    gender: member.gender,
    occupationCode: member.occupationCode,
    educationCode: member.educationCode,
    imagePath: member.imagePath ?? "",
    tranOfficeCode: "00",
    dob: formatForApi(member.dobAD),
    clientAge: member.clientAge ?? "",
    mobileNo: member.mobileNo ?? "",
    minorYn: member.minorYn ? "Y" : "N",
    address1Type: member.address1Type,
    address: member.address ?? "",
    address1Line2: member.address1Line2,
    address1Line3: member.address1Line3,
    address1DistrictCode: member.address1DistrictCode,
    religionCode: member.religionCode,
    address1Province: member.address1Province,
    totalAsset: String(member.totalAsset),
    totalLiabilities: String(member.totalLiabilities),
    netWorth: String(member.netWorth),
    soiSalary: member.soiSalary ? "Y" : "N",
    soiBusIncome: member.soiBusIncome ? "Y" : "N",
    soiReturnfrmInvest: member.soiReturnfrmInvest ? "Y" : "N",
    soiInheritance: member.soiInheritance ? "Y" : "N",
    soiRemittance: member.soiRemittance ? "Y" : "N",
    soiOthers: member.soiOthers ? "Y" : "N",
    soiAgriculture: member.soiAgriculture ? "Y" : "N",
    clientBehaviour: member.clientBehaviour ?? "",
    householdId,
    headHousehold: member.headHousehold ?? "N",
    relationtoHH: member.relationToHH ?? "",
    healthConditionsYn: member.healthConditionsYn ? "Y" : "N",
    healthConditions: member.healthConditions ?? "",
    disabilityIdentYn: member.disabilityIdentYn ? "Y" : "N",
    disabilityIdent: member.disabilityIdent ?? "",
    seeing: member.seeing,
    hearing: member.hearing,
    walking: member.walking,
    remembering: member.remembering,
    selfCare: member.selfCare,
    communicating: member.communicating,
    disabilityStatus: member.disabilityStatus,
    pregnancyStatus:
      member.gender === "F" ? (member.pregnancyStatus ?? "N") : "N",

    pregnancyDate:
      member.gender === "F" && member.pregnancyStatus === "Y"
        ? formatForApi(member.pregnancyDateAD)
        : "",

    motherofChild:
      member.gender === "F" ? (member.motherofChild ? "Y" : "N") : "N",

    childDob:
      member.gender === "F" && member.motherofChild && member.childDobAD
        ? formatForApi(member.childDobAD)
        : "",

    vaccinationStatus: member.minorYn ? (member.vaccinationStatus ?? "N") : "N",

    healthInsCoverage: member.healthInsCoverage ?? "N",

    healthConditionsDia: member.healthConditionsDia ? "Y" : "N",
    healthConditionsHyp: member.healthConditionsHyp ? "Y" : "N",
    healthConditionsCar: member.healthConditionsCar ? "Y" : "N",
    healthConditionsChr: member.healthConditionsChr ? "Y" : "N",
    healthConditionsOth: member.healthConditionsOth ? "Y" : "N",
    healthConditionsOthers: member.healthConditionsOthers ?? "",
    user,
    insertUpdate: "I",
  };
}

// UPDATE MAPPER

export function mapMemberToUpdatePayload(
  member: MemberLocal,
  householdId: string,
  user: string,
  employeeId: string,
): UpdateMemberPayload {
  if (!member.clientNo) {
    throw new Error("Cannot update member without clientNo");
  }

  return {
    ...mapMemberToInsertPayload(member, householdId, user, employeeId),
    clientNo: member.clientNo,
    insertUpdate: "U",
  };
}
