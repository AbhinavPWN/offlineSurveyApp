import {
  convertADToBSISO,
  convertBSToADISO,
} from "../../../utils/nepaliDateUtils";
import type { CommunityVisitWithAttendees } from "../repositories/CommunityVisitLocalRepository";

export interface CommunityVisitSubmissionIssue {
  field: string;
  message: string;
  attendeeLocalId?: string;
}

export interface CommunityVisitSubmissionValidation {
  valid: boolean;
  issues: CommunityVisitSubmissionIssue[];
}

const hasText = (value: string | null): boolean =>
  typeof value === "string" && value.trim().length > 0;
const validCount = (value: number): boolean =>
  Number.isSafeInteger(value) && value >= 0;

export function validateCommunityVisitForSubmission(
  { visit, attendees }: CommunityVisitWithAttendees,
  confirmedCommunityCategories: readonly string[] | null,
): CommunityVisitSubmissionValidation {
  const issues: CommunityVisitSubmissionIssue[] = [];
  const add = (field: string, message: string, attendeeLocalId?: string) => {
    issues.push({
      field,
      message,
      ...(attendeeLocalId ? { attendeeLocalId } : {}),
    });
  };

  if (
    visit.deletedAt !== null ||
    visit.syncStatus !== "DRAFT" ||
    visit.serverId !== null ||
    visit.syncAction !== "INSERT"
  ) {
    add(
      "syncStatus",
      "Only an unqueued, locally saved draft can be submitted.",
    );
  }
  if (!hasText(visit.localId))
    add("localId", "Save the draft before submitting.");
  if (!hasText(visit.chwUsername))
    add("chwUsername", "The CHW username is missing.");
  if (!/^\d+$/.test(visit.supervisorId) || /^0+$/.test(visit.supervisorId)) {
    add("supervisorId", "A numeric CHW supervisor ID is required.");
  }
  if (!hasText(visit.userId))
    add(
      "userId",
      "The visit user ID must be resolved using the confirmed backend mapping.",
    );
  if (!hasText(visit.communityName))
    add("communityName", "Enter the community name.");
  if (!hasText(visit.address)) add("address", "Enter the visit address.");

  const converted = convertBSToADISO(visit.visitDateBs);
  if (
    !converted ||
    converted !== visit.visitDateAd ||
    convertADToBSISO(converted) !== visit.visitDateBs
  ) {
    add("visitDateBs", "Enter a valid BS visit date with a matching AD date.");
  }
  if (!hasText(visit.communityCategory)) {
    add("communityCategory", "Enter the Community category.");
  } else if (
    confirmedCommunityCategories !== null &&
    !confirmedCommunityCategories.includes(visit.communityCategory)
  ) {
    add(
      "communityCategory",
      "Select a valid Community category from the confirmed choices.",
    );
  }

  const topics = {
    sessionTopicNut: visit.sessionTopicNut,
    sessionTopicHealthly: visit.sessionTopicHealthly,
    sessionTopicDrug: visit.sessionTopicDrug,
    sessionTopicChild: visit.sessionTopicChild,
    sessionTopicHeat: visit.sessionTopicHeat,
    sessionTopicMalaria: visit.sessionTopicMalaria,
    sessionTopicDiarrhoea: visit.sessionTopicDiarrhoea,
    sessionTopicGbv: visit.sessionTopicGbv,
  };
  for (const [field, value] of Object.entries(topics)) {
    if (value !== "Y" && value !== "N")
      add(field, "Session topic answers must be Yes or No.");
  }
  for (const [field, value] of Object.entries({
    noOfPresent: visit.noOfPresent,
    noOfFemales: visit.noOfFemales,
    noOfMales: visit.noOfMales,
    noOfPwd: visit.noOfPwd,
  })) {
    if (!validCount(value))
      add(field, "Attendance counts must be nonnegative whole numbers.");
  }

  const females = attendees.filter(
    (attendee) => attendee.gender?.trim().toUpperCase() === "F",
  ).length;
  const males = attendees.filter(
    (attendee) => attendee.gender?.trim().toUpperCase() === "M",
  ).length;
  if (visit.noOfPresent !== attendees.length)
    add("noOfPresent", "Save the draft again to update its attendance total.");
  if (visit.noOfFemales !== females)
    add("noOfFemales", "Save the draft again to update its female count.");
  if (visit.noOfMales !== males)
    add("noOfMales", "Save the draft again to update its male count.");

  const localIds = new Set<string>();
  const clientNos = new Set<string>();
  for (const attendee of attendees) {
    const id = attendee.localId;
    if (!hasText(id) || localIds.has(id))
      add("attendees", "Attendance has a missing or duplicate local ID.", id);
    localIds.add(id);
    if (attendee.visitLocalId !== visit.localId)
      add("attendees", "An attendee belongs to a different visit.", id);
    if (attendee.syncStatus !== "DRAFT")
      add("attendees", "Attendance is already queued or synced.", id);
    if (!hasText(attendee.clientNo)) {
      add(
        "clientNo",
        "Only downloaded-member attendance is currently supported.",
        id,
      );
    } else {
      const clientNo = attendee.clientNo as string;
      if (clientNo !== clientNo.trim() || clientNos.has(clientNo))
        add(
          "clientNo",
          "An attendee has an invalid or duplicate client number.",
          id,
        );
      clientNos.add(clientNo);
    }
    if (!hasText(attendee.visitorName))
      add("visitorName", "An attendee name is missing.", id);
    if (!hasText(attendee.createdBy))
      add(
        "createdBy",
        "The attendance creator ID must be resolved using the confirmed backend mapping.",
        id,
      );
    if (typeof attendee.createdOn !== "string") {
      add(
        "createdOn",
        "The attendance creation-date value must be explicitly resolved.",
        id,
      );
    }
  }

  return { valid: issues.length === 0, issues };
}
