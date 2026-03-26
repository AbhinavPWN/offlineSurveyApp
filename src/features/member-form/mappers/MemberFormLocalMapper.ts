import { HouseholdMemberLocal } from "@/src/models/householdMember.model";
import { MemberFormState } from "../models/MemberFormState";

export function mapLocalToForm(local: HouseholdMemberLocal): MemberFormState {
  const isHead = local.headHousehold === "Y";
  return {
    householdLocalId: local.householdLocalId,
    // Basic
    enrollDate: local.enrollDateAD ?? new Date().toISOString().split("T")[0],
    fName: local.firstName ?? "",
    gender: local.gender ?? null,
    maritalStatus: local.maritalStatus ?? null,
    relationtoHH: isHead ? "HHH" : (local.relationToHH ?? null),
    headHousehold: isHead,
    mobileNo: local.mobileNo ?? "",
    clientAge: local.clientAge ?? "",

    // Identity
    // Identity
    idDocumentType: local.idDocumentType || "CITIZENSHIP",
    idDocumentNo: local.idDocumentNo || "NA",
    idIssueDistrictCode: local.idIssueDistrictCode || "000",
    memIdIssueDate: local.idIssueDateAD ?? local.enrollDateAD ?? null,
    dob: local.dobAD ?? null,
    minorYn: local.minorYn === "Y",

    // Address
    address1Type: local.address1Type ?? null,
    address: local.address ?? "",
    address1Line2: local.address1Line2 ?? "",
    address1Line3: local.address1Line3 ?? "",
    address1DistrictCode: local.address1DistrictCode ?? "",
    address1Province: local.address1Province ?? "",

    // Occupation
    casteCode: local.casteCode ?? "",
    religionCode: local.religionCode ?? "",
    occupationCode: local.occupationCode ?? "",
    educationCode: local.educationCode ?? "",

    // Financial
    totalAsset: Number(local.totalAsset ?? 0),
    totalLiabilities: Number(local.totalLiabilities ?? 0),
    netWorth: Number(local.netWorth ?? 0),

    soiSalary: local.soiSalary === "Y",
    soiBusIncome: local.soiBusIncome === "Y",
    soiReturnfrmInvest: local.soiReturnfrmInvest === "Y",
    soiInheritance: local.soiInheritance === "Y",
    soiRemittance: local.soiRemittance === "Y",
    soiOthers: local.soiOthers === "Y",
    soiAgriculture: local.soiAgriculture === "Y",

    // Health
    healthConditionsYn: local.healthConditionsYn === "Y",
    healthConditions: local.healthConditions ?? "",

    disabilityIdentYn: local.disabilityIdentYn === "Y",
    disabilityIdent: local.disabilityIdent ?? "",

    seeing: local.seeing ?? "N",
    hearing: local.hearing ?? "N",
    walking: local.walking ?? "N",
    remembering: local.remembering ?? "N",
    selfCare: local.selfCare ?? "N",
    communicating: local.communicating ?? "N",

    disabilityStatus: local.disabilityStatus ?? null,

    pregnancyStatus: local.pregnancyStatus ?? "N",
    pregnancyDate: local.pregnancyDateAD ?? "",

    motherofChild: local.motherofChild === "Y",
    childDob: local.childDobAD ?? "",

    vaccinationStatus: local.vaccinationStatus ?? "",
    healthInsCoverage: local.healthInsCoverage ?? "N",

    healthConditionsDia: local.healthConditionsDia === "Y",
    healthConditionsHyp: local.healthConditionsHyp === "Y",
    healthConditionsCar: local.healthConditionsCar === "Y",
    healthConditionsChr: local.healthConditionsChr === "Y",
    healthConditionsOth: local.healthConditionsOth === "Y",
    healthConditionsOthers: local.healthConditionsOthers ?? "",

    // Misc
    clientBehaviour: local.clientBehaviour ?? "",
    imagePath: local.imagePath ?? null,
  };
}

export function mapFormToLocalPatch(
  form: MemberFormState,
): Partial<HouseholdMemberLocal> {
  return {
    enrollDateAD: form.enrollDate ?? null,
    firstName: form.fName,
    gender: form.gender ?? null,
    maritalStatus: form.maritalStatus ?? null,
    relationToHH: form.headHousehold ? "HHH" : (form.relationtoHH ?? null),
    headHousehold: form.headHousehold ? "Y" : "N",
    mobileNo: form.mobileNo,
    clientAge: form.clientAge,

    idDocumentType: form.idDocumentType || "CITIZENSHIP",
    idDocumentNo: form.idDocumentNo || "NA",
    idIssueDistrictCode: form.idIssueDistrictCode || "000",
    idIssueDateAD: form.memIdIssueDate || form.enrollDate || null,
    dobAD: form.dob ?? null,
    minorYn: form.minorYn ? "Y" : "N",

    address1Type: form.address1Type ?? null,
    address: form.address,
    address1Line2: form.address1Line2 ?? null,
    address1Line3: form.address1Line3,
    address1DistrictCode: form.address1DistrictCode ?? null,
    address1Province: form.address1Province ?? null,

    casteCode: form.casteCode ?? null,
    religionCode: form.religionCode ?? null,
    occupationCode: form.occupationCode ?? null,
    educationCode: form.educationCode ?? null,

    totalAsset: String(form.totalAsset),
    totalLiabilities: String(form.totalLiabilities),
    netWorth: String(
      Number(form.totalAsset || 0) - Number(form.totalLiabilities || 0),
    ),

    soiSalary: form.soiSalary ? "Y" : "N",
    soiBusIncome: form.soiBusIncome ? "Y" : "N",
    soiReturnfrmInvest: form.soiReturnfrmInvest ? "Y" : "N",
    soiInheritance: form.soiInheritance ? "Y" : "N",
    soiRemittance: form.soiRemittance ? "Y" : "N",
    soiOthers: form.soiOthers ? "Y" : "N",
    soiAgriculture: form.soiAgriculture ? "Y" : "N",

    // -------------------------
    // HEALTH (Cleaned Safely)
    // -------------------------

    healthConditionsYn: form.healthConditionsYn ? "Y" : "N",
    healthConditions: form.healthConditionsYn ? form.healthConditions : null,

    disabilityIdentYn: form.disabilityIdentYn ? "Y" : "N",
    disabilityIdent: form.disabilityIdentYn ? form.disabilityIdent : null,

    seeing: form.seeing ?? "N",
    hearing: form.hearing ?? "N",
    walking: form.walking ?? "N",
    remembering: form.remembering ?? "N",
    selfCare: form.selfCare ?? "N",
    communicating: form.communicating ?? "N",

    disabilityStatus: form.disabilityStatus ?? "N",

    pregnancyStatus: form.gender === "F" ? (form.pregnancyStatus ?? "N") : null,

    pregnancyDateAD:
      form.gender === "F" && form.pregnancyStatus === "Y"
        ? (form.pregnancyDate ?? null)
        : null,

    childDobAD: form.motherofChild && form.childDob ? form.childDob : null,

    motherofChild: form.motherofChild ? "Y" : "N",

    vaccinationStatus: form.minorYn ? (form.vaccinationStatus ?? "N") : null,

    healthInsCoverage: form.healthInsCoverage ?? "N",

    healthConditionsDia: form.healthConditionsDia ? "Y" : "N",
    healthConditionsHyp: form.healthConditionsHyp ? "Y" : "N",
    healthConditionsCar: form.healthConditionsCar ? "Y" : "N",
    healthConditionsChr: form.healthConditionsChr ? "Y" : "N",
    healthConditionsOth: form.healthConditionsOth ? "Y" : "N",
    healthConditionsOthers: form.healthConditionsOthers ?? "",

    clientBehaviour: form.clientBehaviour,
    imagePath: form.imagePath ?? null,
  };
}
