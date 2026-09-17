import { randomUUID } from "expo-crypto";
import {
  convertADToBSISO,
  convertBSToADISO,
} from "../../../utils/nepaliDateUtils";
import type { CommunityMember } from "../models/CommunityMember";
import type {
  CommunityVisitDraftFields,
  CommunityVisitDraftAttendee,
  CommunityVisitLocalRepository,
  CommunityVisitWithAttendees,
} from "../repositories/CommunityVisitLocalRepository";

/** Structurally accepts form values without depending on a React component. */
export interface CommunityVisitDraftEntry extends Omit<
  CommunityVisitDraftFields,
  "supervisorId" | "userId" | "noOfPresent" | "noOfFemales" | "noOfMales"
> {
  selectedMembers: Pick<
    CommunityMember,
    | "clientNo"
    | "memberName"
    | "gender"
    | "districtId"
    | "vdcnpCode"
    | "wardNo"
    | "address"
  >[];
}

export interface SaveCommunityVisitDraftRequest {
  chwUsername: string;
  supervisorId: string;
  /** Null creates a draft. For edits, supply the version originally opened. */
  target: { visitLocalId: string; expectedUpdatedAt: number } | null;
  values: CommunityVisitDraftEntry;
}

function requireText(value: string, label: string): void {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`${label} is unavailable.`);
}

/** Saves locally only. Does not queue a visit or call either POST endpoint. */
export class SaveCommunityVisitDraftUseCase {
  constructor(
    private readonly repository: CommunityVisitLocalRepository,
    private readonly createId: () => string = randomUUID,
  ) {}

  async execute(
    input: SaveCommunityVisitDraftRequest,
  ): Promise<CommunityVisitWithAttendees> {
    requireText(input.chwUsername, "CHW username");
    requireText(input.supervisorId, "Supervisor ID");
    const { values } = input;
    if (!Number.isSafeInteger(values.noOfPwd) || values.noOfPwd < 0) {
      throw new Error(
        "Enter a nonnegative whole number for PWD, including 0 if none attended.",
      );
    }
    // Incomplete drafts may have no date, but may not store inconsistent calendars.
    let visitDateAd = "";
    if (values.visitDateBs) {
      const converted = convertBSToADISO(values.visitDateBs);
      if (!converted || convertADToBSISO(converted) !== values.visitDateBs) {
        throw new Error(
          "Complete the BS date or clear it before saving the draft.",
        );
      }
      visitDateAd = converted;
    }
    if (values.visitDateAd !== visitDateAd) {
      throw new Error(
        "The AD and BS dates do not match. Re-enter the visit date.",
      );
    }

    const existing = input.target
      ? await this.repository.getByLocalId({
          chwUsername: input.chwUsername,
          visitLocalId: input.target.visitLocalId,
        })
      : null;
    if (input.target) {
      if (!existing)
        throw new Error("The draft is unavailable for this account.");
      if (
        existing.visit.syncStatus !== "DRAFT" ||
        existing.visit.serverId !== null
      ) {
        throw new Error("Only an unqueued draft can be edited.");
      }
      if (existing.visit.updatedAt !== input.target.expectedUpdatedAt) {
        throw new Error("This draft has changed. Reload it before saving.");
      }
      if (existing.visit.supervisorId !== input.supervisorId) {
        throw new Error(
          "The supervisor ID differs from the saved draft. Verify the account before editing.",
        );
      }
      if (
        existing.attendees.some((attendee) => attendee.syncStatus !== "DRAFT")
      ) {
        throw new Error("Queued attendance cannot be edited.");
      }
    }

    const previousByClient = new Map(
      (existing?.attendees ?? [])
        .filter((attendee) => attendee.clientNo !== null)
        .map((attendee) => [attendee.clientNo, attendee]),
    );
    const selectedClientNos = new Set<string>();
    const attendees: CommunityVisitDraftAttendee[] = [];
    for (const member of values.selectedMembers) {
      requireText(member.clientNo, "Downloaded member client number");
      if (member.clientNo !== member.clientNo.trim())
        throw new Error("Client number contains surrounding spaces.");
      if (selectedClientNos.has(member.clientNo))
        throw new Error("The same member cannot be selected twice.");
      selectedClientNos.add(member.clientNo);
      const previous = previousByClient.get(member.clientNo);
      // Keep the saved snapshot and local ID when an existing attendee remains selected.
      attendees.push({
        localId: previous?.localId ?? this.createId(),
        clientNo: member.clientNo,
        visitorName: previous ? previous.visitorName : member.memberName,
        districtId: previous ? previous.districtId : member.districtId,
        vdcnpCode: previous ? previous.vdcnpCode : member.vdcnpCode,
        wardNo: previous ? previous.wardNo : member.wardNo,
        address: previous ? previous.address : member.address,
        gender: previous ? previous.gender : member.gender,
        // Never infer these from the login username or supervisor ID.
        createdBy: previous?.createdBy ?? null,
        createdOn: previous?.createdOn ?? null,
      });
    }

    const topics = {
      sessionTopicNut: values.sessionTopicNut,
      sessionTopicHealthly: values.sessionTopicHealthly,
      sessionTopicDrug: values.sessionTopicDrug,
      sessionTopicChild: values.sessionTopicChild,
      sessionTopicHeat: values.sessionTopicHeat,
      sessionTopicMalaria: values.sessionTopicMalaria,
      sessionTopicDiarrhoea: values.sessionTopicDiarrhoea,
      sessionTopicGbv: values.sessionTopicGbv,
    };
    if (Object.values(topics).some((value) => value !== "Y" && value !== "N")) {
      throw new Error("Session topics must be Y or N.");
    }
    const countGender = (gender: string) =>
      attendees.filter(
        (attendee) => attendee.gender?.trim().toUpperCase() === gender,
      ).length;

    return this.repository.saveDraft({
      chwUsername: input.chwUsername,
      visitLocalId: input.target?.visitLocalId ?? this.createId(),
      expectedUpdatedAt: input.target?.expectedUpdatedAt ?? null,
      visit: {
        supervisorId: input.supervisorId,
        visitDateBs: values.visitDateBs,
        visitDateAd,
        communityName: values.communityName,
        address: values.address,
        communityCategory: values.communityCategory,
        noOfPresent: attendees.length,
        noOfFemales: countGender("F"),
        noOfMales: countGender("M"),
        // CHW-entered visit count; never add it to the selected attendance total.
        noOfPwd: values.noOfPwd,
        ...topics,
        userId: existing?.visit.userId ?? null,
      },
      attendees,
    });
  }
}
