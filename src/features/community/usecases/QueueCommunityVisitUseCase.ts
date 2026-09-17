import type {
  CommunityVisitLocalRepository,
  CommunityVisitScope,
  CommunityVisitWithAttendees,
} from "../repositories/CommunityVisitLocalRepository";
import {
  validateCommunityVisitForSubmission,
  type CommunityVisitSubmissionIssue,
} from "../utils/validateCommunityVisitForSubmission";
import { formatCommunityApiDate } from "../utils/communityApiUtils";

export interface QueueCommunityVisitRequest extends CommunityVisitScope {
  /** The version the user reviewed before choosing to submit. */
  expectedUpdatedAt: number;
  /** Null permits an entered category while the finalized choices are deferred. */
  confirmedCommunityCategories: readonly string[] | null;
}

export class CommunityVisitQueueValidationError extends Error {
  constructor(public readonly issues: CommunityVisitSubmissionIssue[]) {
    super(issues.map((issue) => issue.message).join("\n"));
    this.name = "CommunityVisitQueueValidationError";
  }
}

/**
 * Prepares a reviewed draft for standalone sync without making any HTTP request.
 * Submission identities/date are frozen locally so later retries keep the same
 * values. Do not resolve them again from a different login or the retry date.
 */
export class QueueCommunityVisitUseCase {
  constructor(
    private readonly repository: CommunityVisitLocalRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(input: QueueCommunityVisitRequest): Promise<void> {
    if (!input.chwUsername?.trim() || !input.visitLocalId?.trim()) {
      throw new Error("The CHW username and local visit ID are required.");
    }
    if (
      !Number.isSafeInteger(input.expectedUpdatedAt) ||
      input.expectedUpdatedAt < 0
    ) {
      throw new Error("Reload the draft before submitting.");
    }
    const { chwUsername, visitLocalId, expectedUpdatedAt } = input;
    // Confirmed by endpoint testing: both fields use the login username.
    // supervisorId remains the numeric CHW ID already stored on the visit.
    const userId = chwUsername;
    const createdBy = chwUsername;
    // Capture the device's local calendar date when Submit is chosen, even
    // offline. Persist it once; a later upload/retry must not change the date.
    const submittedAt = this.now();
    const submittedOnIso = [
      submittedAt.getFullYear(),
      String(submittedAt.getMonth() + 1).padStart(2, "0"),
      String(submittedAt.getDate()).padStart(2, "0"),
    ].join("-");
    const formattedDate = formatCommunityApiDate(submittedOnIso);
    if (!formattedDate)
      throw new Error("The submission date is invalid. Check the device date.");
    const createdOn = formattedDate.replace(
      /-([a-z])/,
      (_match, letter: string) => `-${letter.toUpperCase()}`,
    );
    const categories =
      input.confirmedCommunityCategories === null
        ? null
        : [...input.confirmedCommunityCategories];
    const record = await this.repository.getByLocalId({
      chwUsername,
      visitLocalId,
    });
    if (!record)
      throw new Error("The Community draft is unavailable for this account.");
    if (record.visit.updatedAt !== expectedUpdatedAt) {
      throw new Error(
        "This draft has changed. Reopen and review it before submitting.",
      );
    }
    // Validate the proposed values without mutating the stored draft.
    const prepared: CommunityVisitWithAttendees = {
      visit: { ...record.visit, userId },
      attendees: record.attendees.map((attendee) => ({
        ...attendee,
        createdBy,
        createdOn,
      })),
    };
    const validation = validateCommunityVisitForSubmission(
      prepared,
      categories,
    );
    if (validation.issues.length > 0) {
      throw new CommunityVisitQueueValidationError(validation.issues);
    }

    const { visit, attendees } = prepared;
    const saved = await this.repository.saveDraft({
      chwUsername,
      visitLocalId,
      expectedUpdatedAt,
      visit: {
        supervisorId: visit.supervisorId,
        visitDateBs: visit.visitDateBs,
        visitDateAd: visit.visitDateAd,
        communityName: visit.communityName,
        address: visit.address,
        communityCategory: visit.communityCategory,
        noOfPresent: visit.noOfPresent,
        noOfFemales: visit.noOfFemales,
        noOfMales: visit.noOfMales,
        noOfPwd: visit.noOfPwd,
        sessionTopicNut: visit.sessionTopicNut,
        sessionTopicHealthly: visit.sessionTopicHealthly,
        sessionTopicDrug: visit.sessionTopicDrug,
        sessionTopicChild: visit.sessionTopicChild,
        sessionTopicHeat: visit.sessionTopicHeat,
        sessionTopicMalaria: visit.sessionTopicMalaria,
        sessionTopicDiarrhoea: visit.sessionTopicDiarrhoea,
        sessionTopicGbv: visit.sessionTopicGbv,
        userId,
      },
      attendees: attendees.map((attendee) => ({
        localId: attendee.localId,
        clientNo: attendee.clientNo,
        visitorName: attendee.visitorName,
        districtId: attendee.districtId,
        vdcnpCode: attendee.vdcnpCode,
        wardNo: attendee.wardNo,
        address: attendee.address,
        gender: attendee.gender,
        createdBy,
        createdOn,
      })),
    });
    // Repository atomically changes parent and attendees to PENDING. A concurrent
    // edit between preparation and queueing fails the version check. If queueing
    // fails, the preparation above remains an editable DRAFT; reload before retry.
    await this.repository.queueForSync({
      chwUsername,
      visitLocalId,
      expectedUpdatedAt: saved.visit.updatedAt,
    });
  }
}
