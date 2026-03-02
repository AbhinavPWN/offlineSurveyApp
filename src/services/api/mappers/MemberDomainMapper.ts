import { HouseholdMemberLocal } from "@/src/models/householdMember.model";
import { MemberLocal } from "@/src/services/api/mappers/MemberMapper";

const toBool = (val?: string | null) => val === "Y";

export function mapDbToDomainMember(db: HouseholdMemberLocal): MemberLocal {
  return {
    localId: db.localId,
    clientNo: db.clientNo,

    firstName: db.firstName ?? "",
    middleName: db.middleName,
    lastName: db.lastName,

    dobAD: db.dobAD ?? "",
    enrollDateAD: db.enrollDateAD ?? "",

    mobileNo: db.mobileNo ?? "",
    minorYn: toBool(db.minorYn),
    gender: db.gender ?? "",
    maritalStatus: db.maritalStatus ?? "",

    casteCode: db.casteCode ?? "",
    occupationCode: db.occupationCode ?? "",
    educationCode: db.educationCode ?? "",
    religionCode: db.religionCode ?? "",

    idDocumentType: db.idDocumentType ?? "",
    idDocumentNo: db.idDocumentNo ?? "",
    idIssueDistrictCode: db.idIssueDistrictCode ?? "",
    idIssueDateAD: db.idIssueDateAD ?? "",

    address: db.address ?? "",
    address1Type: db.address1Type ?? "",
    address1Line2: db.address1Line2 ?? "",
    address1Line3: db.address1Line3 ?? "",
    address1DistrictCode: db.address1DistrictCode ?? "",
    address1Province: db.address1Province ?? "",

    totalAsset: Number(db.totalAsset ?? 0),
    totalLiabilities: Number(db.totalLiabilities ?? 0),
    netWorth: Number(db.netWorth ?? 0),

    soiSalary: toBool(db.soiSalary),
    soiBusIncome: toBool(db.soiBusIncome),
    soiReturnfrmInvest: toBool(db.soiReturnfrmInvest),
    soiInheritance: toBool(db.soiInheritance),
    soiRemittance: toBool(db.soiRemittance),
    soiOthers: toBool(db.soiOthers),
    soiAgriculture: toBool(db.soiAgriculture),

    clientBehaviour: db.clientBehaviour ?? "",

    headHousehold: db.headHousehold ?? "N",
    relationToHH: db.relationToHH ?? "",

    healthConditionsYn: toBool(db.healthConditionsYn),
    healthConditions: db.healthConditions ?? "",

    disabilityIdentYn: toBool(db.disabilityIdentYn),
    disabilityIdent: db.disabilityIdent ?? "",

    seeing: db.seeing ?? "N",
    hearing: db.hearing ?? "N",
    walking: db.walking ?? "N",
    remembering: db.remembering ?? "N",
    selfCare: db.selfCare ?? "N",
    communicating: db.communicating ?? "N",

    disabilityStatus: db.disabilityStatus ?? "N",

    pregnancyStatus: db.pregnancyStatus ?? "N",
    pregnancyDateAD: db.pregnancyDateAD ?? undefined,

    motherofChild: toBool(db.motherofChild),
    childDobAD: db.childDobAD ?? undefined,

    vaccinationStatus: db.vaccinationStatus ?? "N",
    healthInsCoverage: db.healthInsCoverage ?? "N",

    imagePath: db.imagePath ?? undefined,
  };
}
