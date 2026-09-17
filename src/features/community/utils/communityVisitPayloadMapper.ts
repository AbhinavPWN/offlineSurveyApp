import type {
  CommunityAttendanceEntryPayload,
  CommunityVisitEntryPayload,
  YesNo,
} from "../../../services/api/dto/CommunityDTO";
import type { CommunityVisit } from "../models/CommunityVisit";
import type { CommunityVisitAttendee } from "../models/CommunityVisitAttendee";
import { formatCommunityApiDate } from "./communityApiUtils";

function requiredText(value: string | null, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required before Community submission.`);
  }
  // Validate without changing identity spelling, case, or padding.
  return value;
}

function optionalText(value: string | null, label: string): string {
  if (value === null) return "";
  if (typeof value !== "string") throw new Error(`${label} must be text.`);
  return value;
}

function countToString(value: number, label: string): string {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a nonnegative whole number.`);
  }
  return String(value);
}

function sessionFlag(value: YesNo, label: string): YesNo {
  if (value !== "Y" && value !== "N") {
    throw new Error(`${label} must be Y or N.`);
  }
  return value;
}

function requireActiveInsert(visit: CommunityVisit): void {
  if (visit.deletedAt !== null)
    throw new Error("A deleted visit cannot be submitted.");
  if (visit.syncAction !== "INSERT")
    throw new Error("Only Community visit inserts are supported.");
}

/**
 * Pure conversion: no database writes, HTTP calls, or changes to the source.
 * The caller must validate the form and confirm the stored userId mapping.
 * A nonempty ID alone cannot establish which backend identity it represents.
 * This can validate an unqueued draft; sync eligibility belongs in the use case.
 */
export function mapCommunityVisitToPayload(
  visit: CommunityVisit,
): CommunityVisitEntryPayload {
  requireActiveInsert(visit);
  if (visit.serverId !== null) {
    throw new Error(
      "This visit already has a server ID. Upload its remaining attendance instead of inserting the parent again.",
    );
  }

  const visitDate = formatCommunityApiDate(visit.visitDateAd);
  if (!visitDate)
    throw new Error(
      "A valid AD visit date is required for Community submission.",
    );

  return {
    // Match the successfully tested parent endpoint format: 01-SEP-2026.
    visitDate: visitDate.toUpperCase(),
    supervisorId: requiredText(visit.supervisorId, "Supervisor ID"),
    communityName: requiredText(visit.communityName, "Community name"),
    address: requiredText(visit.address, "Community address"),
    // No mapping from download CategoryNo or MemCategory is assumed.
    communityCategory: requiredText(
      visit.communityCategory,
      "Community category",
    ),
    noOfPresent: countToString(visit.noOfPresent, "Number present"),
    noOfFemales: countToString(visit.noOfFemales, "Number of females"),
    noOfMales: countToString(visit.noOfMales, "Number of males"),
    // Preserve the CHW-entered count; do not derive it from attendee records.
    noOfPwd: countToString(visit.noOfPwd, "Number of PWD"),
    sessionTopicNut: sessionFlag(visit.sessionTopicNut, "Nutrition"),
    sessionTopicHealthly: sessionFlag(
      visit.sessionTopicHealthly,
      "Healthy Lifestyle",
    ),
    sessionTopicDrug: sessionFlag(visit.sessionTopicDrug, "Drug Abuse"),
    sessionTopicChild: sessionFlag(visit.sessionTopicChild, "Child Marriage"),
    sessionTopicHeat: sessionFlag(visit.sessionTopicHeat, "Heat Stress"),
    sessionTopicMalaria: sessionFlag(visit.sessionTopicMalaria, "Malaria"),
    sessionTopicDiarrhoea: sessionFlag(
      visit.sessionTopicDiarrhoea,
      "Diarrhoea",
    ),
    sessionTopicGbv: sessionFlag(
      visit.sessionTopicGbv,
      "Gender-based Violence",
    ),
    userId: requiredText(visit.userId, "Confirmed visit user ID"),
    insertUpdate: "I",
  };
}

/**
 * Pass the parent loaded after its successful server ID has been persisted.
 * Repository ownership checks and retry decisions belong in the sync use case.
 * No fallback from createdBy to userId, supervisorId, or chwUsername is allowed.
 */
export function mapCommunityVisitAttendeeToPayload(
  visit: CommunityVisit,
  attendee: CommunityVisitAttendee,
): CommunityAttendanceEntryPayload {
  requireActiveInsert(visit);
  requiredText(visit.localId, "Local visit ID");
  if (attendee.visitLocalId !== visit.localId) {
    throw new Error("The attendee does not belong to this Community visit.");
  }
  if (attendee.syncStatus === "SYNCED") {
    throw new Error("This attendee has already been uploaded.");
  }
  const communityVisitId = requiredText(
    visit.serverId,
    "Saved parent visit ID",
  );
  if (
    communityVisitId !== communityVisitId.trim() ||
    /^0+$/.test(communityVisitId)
  ) {
    throw new Error("The saved parent visit ID is invalid.");
  }
  // The API sample supplies an empty string. Preserve an explicit choice, but
  // never turn an unresolved null into that choice or invent a timestamp format.
  if (typeof attendee.createdOn !== "string") {
    throw new Error(
      "Attendance createdOn must be explicitly resolved before submission.",
    );
  }

  return {
    communityVisitId,
    // Null/blank client numbers remain blocked until manual visitors are confirmed.
    clientNo: requiredText(
      attendee.clientNo,
      "Downloaded member client number",
    ),
    visitorName: requiredText(attendee.visitorName, "Visitor name"),
    districtId: optionalText(attendee.districtId, "District ID"),
    vdcnpCode: optionalText(attendee.vdcnpCode, "Municipality code"),
    wardNo: optionalText(attendee.wardNo, "Ward number"),
    address: optionalText(attendee.address, "Attendee address"),
    createdBy: requiredText(
      attendee.createdBy,
      "Confirmed attendance creator ID",
    ),
    createdOn: attendee.createdOn,
    insertUpdate: "I",
  };
}
