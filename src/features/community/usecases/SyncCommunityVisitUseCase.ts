import {
  CommunityPostError,
  type CommunityApiService,
} from "../../../services/CommunityApiService";
import type { NetworkService } from "../../../utils/NetworkService";
import type {
  CommunityVisitLocalRepository,
  CommunityVisitScope,
} from "../repositories/CommunityVisitLocalRepository";
import {
  mapCommunityVisitToPayload,
  mapCommunityVisitAttendeeToPayload,
} from "../utils/communityVisitPayloadMapper";

const UNCERTAIN = "Upload outcome unconfirmed: ";
const AUTH_REQUIRED = "Sign-in required: ";
const REJECTED = "Server rejected submission: ";
const INVALID = "Submission was not sent: ";
const CHECK_MESSAGE =
  "The server may have saved this record. Check the web application before another attempt.";

/** Only failures known to occur before sending or explicitly reported by the API
 * can be retried by the user's Retry action. Legacy/unclassified failures need review. */
function needsReview(status: string, error: string | null): boolean {
  return (
    status === "FAILED" &&
    !(
      error?.startsWith(AUTH_REQUIRED) ||
      error?.startsWith(REJECTED) ||
      error?.startsWith(INVALID)
    )
  );
}

export interface CommunityVisitSyncResult {
  status: "SYNCED" | "PENDING" | "PARTIAL" | "FAILED" | "REVIEW_REQUIRED";
  message: string;
}

export interface CommunityVisitSyncOptions {
  /** True only for an explicit user retry of a rejected/not-sent record. */
  retryFailed?: boolean;
  /** Stop subsequent requests if the initiating screen/account changes. */
  shouldContinue?: () => boolean;
}

/** Standalone, one-visit sync. Does not modify global household sync. */
export class SyncCommunityVisitUseCase {
  private running = false;

  constructor(
    private readonly repository: CommunityVisitLocalRepository,
    private readonly api: CommunityApiService,
    private readonly network: NetworkService,
  ) {}

  private async result(
    scope: CommunityVisitScope,
  ): Promise<CommunityVisitSyncResult> {
    const record = await this.repository.getByLocalId(scope);
    if (!record)
      throw new Error("Community visit is unavailable for this account.");
    const { visit, attendees } = record;
    if (
      (!visit.serverId && needsReview(visit.syncStatus, visit.lastSyncError)) ||
      attendees.some((a) => needsReview(a.syncStatus, a.lastSyncError))
    ) {
      return { status: "REVIEW_REQUIRED", message: CHECK_MESSAGE };
    }
    if (visit.syncStatus === "SYNCED")
      return {
        status: "SYNCED",
        message: "Visit and attendance uploaded successfully.",
      };
    if (visit.syncStatus === "DRAFT")
      throw new Error("Submit the saved draft before uploading.");
    return {
      status: visit.syncStatus,
      message:
        visit.lastSyncError ??
        (visit.serverId
          ? "The visit is saved on the server. Some attendance still needs uploading."
          : "Saved locally and waiting to upload."),
    };
  }

  async execute(
    scope: CommunityVisitScope,
    options: CommunityVisitSyncOptions = {},
  ): Promise<CommunityVisitSyncResult> {
    if (this.running)
      throw new Error("A Community upload is already in progress.");
    if (!scope.chwUsername.trim() || !scope.visitLocalId.trim())
      throw new Error("The CHW username and visit ID are required.");
    this.running = true;
    const checkCurrent = () => {
      if (options.shouldContinue && !options.shouldContinue())
        throw new Error(
          "Upload stopped because the active account or screen changed.",
        );
    };
    try {
      checkCurrent();
      let record = await this.repository.getByLocalId(scope);
      if (!record)
        throw new Error("Community visit is unavailable for this account.");
      if (record.visit.syncStatus === "DRAFT")
        throw new Error("Submit the saved draft before uploading.");
      if (record.visit.syncStatus === "SYNCED") return this.result(scope);
      if (!(await this.network.isOnline())) return this.result(scope);
      checkCurrent();

      if (record.visit.serverId === null) {
        if (needsReview(record.visit.syncStatus, record.visit.lastSyncError))
          return this.result(scope);
        if (record.visit.syncStatus === "FAILED" && !options.retryFailed)
          return this.result(scope);
        if (record.visit.userId !== scope.chwUsername)
          throw new Error(
            "The queued visit username does not match this account.",
          );
        let payload;
        try {
          payload = mapCommunityVisitToPayload(record.visit);
        } catch (error: unknown) {
          await this.repository.recordParentFailure({
            ...scope,
            error:
              INVALID +
              (error instanceof Error
                ? error.message
                : "Invalid visit details."),
          });
          return this.result(scope);
        }
        // Commit a durable checkpoint BEFORE POST. A crash or lost response leaves
        // an uncertain outcome, never an ordinary pending INSERT on the next run.
        await this.repository.recordParentFailure({
          ...scope,
          error: UNCERTAIN + CHECK_MESSAGE,
        });
        checkCurrent();
        try {
          const response = await this.api.createCommunityVisit(payload);
          // Always save a successful response, even if the user navigated away.
          await this.repository.recordParentSuccess({
            ...scope,
            serverId: response.community_visit_id,
          });
        } catch (error: unknown) {
          if (
            error instanceof CommunityPostError &&
            error.kind !== "UNKNOWN_OUTCOME"
          ) {
            await this.repository.recordParentFailure({
              ...scope,
              error:
                (error.kind === "AUTH_REQUIRED"
                  ? AUTH_REQUIRED
                  : error.kind === "API_REJECTED"
                    ? REJECTED
                    : INVALID) +
                error.message,
            });
          }
          // Unknown errors (including failure to persist success) retain the checkpoint.
          return this.result(scope);
        }
        record = await this.repository.getByLocalId(scope);
        if (!record?.visit.serverId)
          throw new Error(
            "The parent visit ID could not be loaded after upload.",
          );
      }

      for (const attendee of record.attendees) {
        checkCurrent();
        if (
          attendee.syncStatus === "SYNCED" ||
          needsReview(attendee.syncStatus, attendee.lastSyncError)
        )
          continue;
        if (attendee.syncStatus === "FAILED" && !options.retryFailed) continue;
        if (attendee.syncStatus === "DRAFT")
          throw new Error("An attendee was not queued with this visit.");
        if (!(await this.network.isOnline())) break;
        checkCurrent();
        const attendeeScope = { ...scope, attendeeLocalId: attendee.localId };
        if (attendee.createdBy !== scope.chwUsername)
          throw new Error(
            "The queued attendee username does not match this account.",
          );
        let payload;
        try {
          payload = mapCommunityVisitAttendeeToPayload(record.visit, attendee);
        } catch (error: unknown) {
          await this.repository.recordAttendeeFailure({
            ...attendeeScope,
            error:
              INVALID +
              (error instanceof Error
                ? error.message
                : "Invalid attendance details."),
          });
          continue;
        }
        await this.repository.recordAttendeeFailure({
          ...attendeeScope,
          error: UNCERTAIN + CHECK_MESSAGE,
        });
        checkCurrent();
        try {
          await this.api.createCommunityAttendance(payload);
          await this.repository.recordAttendeeSuccess(attendeeScope);
        } catch (error: unknown) {
          if (
            error instanceof CommunityPostError &&
            error.kind !== "UNKNOWN_OUTCOME"
          ) {
            await this.repository.recordAttendeeFailure({
              ...attendeeScope,
              error:
                (error.kind === "AUTH_REQUIRED"
                  ? AUTH_REQUIRED
                  : error.kind === "API_REJECTED"
                    ? REJECTED
                    : INVALID) +
                error.message,
            });
          }
          // Other attendees may still upload. The uncertain attendee is not resent.
        }
      }
      return this.result(scope);
    } finally {
      this.running = false;
    }
  }

  /**
   * Converts only the outcomes the CHW has explicitly checked in the web app
   * into retryable failures, then performs the requested retry. This prevents
   * an accidental duplicate INSERT when a response was lost after saving.
   */
  async retryAfterNotFoundReview(
    scope: CommunityVisitScope,
    options: Omit<CommunityVisitSyncOptions, "retryFailed"> = {},
  ): Promise<CommunityVisitSyncResult> {
    if (this.running)
      throw new Error("A Community upload is already in progress.");
    const record = await this.repository.getByLocalId(scope);
    if (!record)
      throw new Error("Community visit is unavailable for this account.");

    const reviewedMessage =
      REJECTED + "Checked in the web application and confirmed not saved.";
    let reviewedAny = false;

    if (
      !record.visit.serverId &&
      needsReview(record.visit.syncStatus, record.visit.lastSyncError)
    ) {
      await this.repository.recordParentFailure({
        ...scope,
        error: reviewedMessage,
      });
      reviewedAny = true;
    }

    for (const attendee of record.attendees) {
      if (needsReview(attendee.syncStatus, attendee.lastSyncError)) {
        await this.repository.recordAttendeeFailure({
          ...scope,
          attendeeLocalId: attendee.localId,
          error: reviewedMessage,
        });
        reviewedAny = true;
      }
    }

    if (!reviewedAny) {
      throw new Error("This visit does not need server verification.");
    }

    return this.execute(scope, { ...options, retryFailed: true });
  }
}
