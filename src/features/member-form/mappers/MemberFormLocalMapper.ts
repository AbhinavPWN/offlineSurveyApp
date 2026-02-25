import { HouseholdMemberLocal } from "@/src/models/householdMember.model";
import { MemberFormState } from "../models/MemberFormState";

export function mapLocalToForm(local: HouseholdMemberLocal): MemberFormState {
  return {
    // Basic
    enrollDate: local.enrollDateAD ?? null,
    fName: local.firstName ?? "",
    gender: local.gender ?? null,
    maritalStatus: local.maritalStatus ?? null,
    relationtoHH: local.relationToHH ?? null,
    headHousehold: local.headHousehold === "Y",
    mobileNo: local.mobileNo ?? "",

    // Identity
    idDocumentType: local.idDocumentType ?? null,
    idDocumentNo: local.idDocumentNo ?? "",
    idIssueDistrictCode: local.idIssueDistrictCode ?? null,
    memIdIssueDate: local.idIssueDateAD ?? null,
    dob: local.dobAD ?? null,
    minorYn: local.minorYn === "Y",

    // Address
    address1Type: local.address1Type ?? null,
    address: local.address ?? "",
    address1Line2: local.address1Line2 ?? null,
    address1Line3: local.address1Line3 ?? "",
    address1DistrictCode: local.address1DistrictCode ?? null,
    address1Province: local.address1Province ?? null,

    // Occupation
    casteCode: local.casteCode ?? null,
    religionCode: local.religionCode ?? null,
    occupationCode: local.occupationCode ?? null,
    educationCode: local.educationCode ?? null,

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
    pregnancyDate: local.pregnancyDate ?? null,

    vaccinationStatus: local.vaccinationStatus ?? null,
    healthInsCoverage: local.healthInsCoverage ?? "N",

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
    relationToHH: form.relationtoHH ?? null,
    headHousehold: form.headHousehold ? "Y" : "N",
    mobileNo: form.mobileNo,

    idDocumentType: form.idDocumentType ?? null,
    idDocumentNo: form.idDocumentNo,
    idIssueDistrictCode: form.idIssueDistrictCode ?? null,
    idIssueDateAD: form.memIdIssueDate ?? null,
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
    netWorth: String(form.netWorth),

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

    pregnancyDate:
      form.gender === "F" && form.pregnancyStatus === "Y"
        ? (form.pregnancyDate ?? null)
        : null,

    vaccinationStatus: form.minorYn ? (form.vaccinationStatus ?? "N") : null,

    healthInsCoverage: form.healthInsCoverage ?? "N",

    clientBehaviour: form.clientBehaviour,
    imagePath: form.imagePath ?? null,
  };
}
