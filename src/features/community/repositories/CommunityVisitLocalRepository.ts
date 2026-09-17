import type { CommunityVisit } from "../models/CommunityVisit";
import type { CommunityVisitAttendee } from "../models/CommunityVisitAttendee";

/** Every operation is scoped to the exact login username, not supervisorId. */
export interface CommunityVisitScope {
  chwUsername: string;
  visitLocalId: string;
}

export interface CommunityVisitWithAttendees {
  visit: CommunityVisit;
  attendees: CommunityVisitAttendee[];
}

/** Editable business fields only; persistence and sync metadata are repository-owned. */
export type CommunityVisitDraftFields = Omit<
  CommunityVisit,
  | "localId"
  | "serverId"
  | "chwUsername"
  | "syncStatus"
  | "syncAction"
  | "lastSyncError"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

/** Retain the same localId for an attendee across draft edits. */
export type CommunityVisitDraftAttendee = Omit<
  CommunityVisitAttendee,
  | "visitLocalId"
  | "syncStatus"
  | "lastSyncError"
  | "createdAt"
  | "updatedAt"
>;

export interface SaveCommunityVisitDraftInput extends CommunityVisitScope {
  visit: CommunityVisitDraftFields;
  attendees: CommunityVisitDraftAttendee[];

  /** Null means create-only; otherwise require the stored updatedAt to match. */
  expectedUpdatedAt: number | null;
}

export interface QueueCommunityVisitInput extends CommunityVisitScope {
  /** Version of the complete draft validated by the submission use case. */
  expectedUpdatedAt: number;
}

export interface CommunityVisitParentSuccessInput extends CommunityVisitScope {
  serverId: string;
}

export interface CommunityVisitFailureInput extends CommunityVisitScope {
  error: string;
}

export interface CommunityVisitAttendeeScope extends CommunityVisitScope {
  attendeeLocalId: string;
}

export interface CommunityVisitAttendeeFailureInput
  extends CommunityVisitAttendeeScope {
  error: string;
}

/**
 * Local persistence only: no HTTP requests, identity inference, or API formatting.
 *
 * Reads exclude soft-deleted visits. Mutations reject missing, deleted, or
 * differently owned records instead of silently succeeding. Username matching
 * must not merge similarly named accounts or substitute numeric employee IDs.
 *
 * Mutations use transactions and advance the visit updatedAt monotonically,
 * including attendee sync changes. Stale draft writes must fail atomically.
 * The sync use case must serialize uploads; these methods are not a network lock.
 */
export interface CommunityVisitLocalRepository {
  /**
   * Atomically create/update a DRAFT and replace its complete attendee selection.
   * Existing visits must still be DRAFT with no serverId; queued/submitted visits
   * cannot be edited because the API currently documents INSERT only.
   *
   * Preserve existing creation timestamps and reject duplicate attendee IDs,
   * duplicate nonempty client numbers, and IDs belonging to another visit.
   * Omitted draft attendees are removed in the same transaction.
   * Never infer PWD from attendees or overwrite noOfPwd using is_pwd.
   */
  saveDraft(
    input: SaveCommunityVisitDraftInput,
  ): Promise<CommunityVisitWithAttendees>;

  /** Return null for absent, deleted, or differently owned visits. */
  getByLocalId(
    scope: CommunityVisitScope,
  ): Promise<CommunityVisitWithAttendees | null>;

  /** List the owner's visits, newest createdAt first, localId as a stable tie-breaker. */
  listByOwner(chwUsername: string): Promise<CommunityVisit[]>;

  /**
   * Atomically transition the validated DRAFT and all attendees to PENDING.
   * Require matching updatedAt and no serverId. Business validation, including
   * confirmed identities and explicit PWD entry, belongs in the use case.
   */
  queueForSync(input: QueueCommunityVisitInput): Promise<void>;

  /**
   * Return PENDING, PARTIAL, and FAILED aggregates, oldest createdAt first.
   * These are candidates, not permission to retry: FAILED can represent an
   * ambiguous POST outcome that requires reconciliation before another INSERT.
   */
  listSyncCandidates(chwUsername: string): Promise<CommunityVisitWithAttendees[]>;

  /**
   * Persist a nonempty parent serverId before any attendance POST.
   * Accept PENDING/FAILED parents without an ID, or an idempotent repeat of the
   * same ID. Never replace an existing different ID or reset synced attendees.
   * Set PARTIAL while attendance remains unsynced, otherwise SYNCED.
   */
  recordParentSuccess(input: CommunityVisitParentSuccessInput): Promise<void>;

  /**
   * Record FAILED only for a PENDING/FAILED parent without a serverId.
   * Never clear a persisted ID or downgrade a successfully saved parent.
   */
  recordParentFailure(input: CommunityVisitFailureInput): Promise<void>;

  /**
   * Require a saved parent ID and an attendee belonging to this visit.
   * Transition PENDING/FAILED to SYNCED; repeating success is a no-op.
   * Clear the attendee error and atomically recompute the visit status:
   * PARTIAL if any attendee is unsynced, otherwise SYNCED with no visit error.
   */
  recordAttendeeSuccess(scope: CommunityVisitAttendeeScope): Promise<void>;

  /**
   * Require a saved parent ID and a PENDING/FAILED attendee in this visit.
   * Record its error, keep the parent ID, and set the visit to PARTIAL.
   * Never downgrade a SYNCED attendee. Store the error on the visit as well
   * so the local list can explain why attendance remains incomplete.
   */
  recordAttendeeFailure(input: CommunityVisitAttendeeFailureInput): Promise<void>;
}
