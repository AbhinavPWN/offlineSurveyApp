/** Matches the attendee statuses allowed by migration 012. */
export type CommunityVisitAttendeeSyncStatus =
  | "DRAFT"
  | "PENDING"
  | "SYNCED"
  | "FAILED";

/**
 * Attendance snapshot stored independently of downloaded member profiles.
 * Refreshing a member download must not change an existing visit's attendance.
 *
 * PWD is collected as CommunityVisit.noOfPwd. The legacy attendee is_pwd
 * column is intentionally omitted and must not be used to calculate that count.
 */
export interface CommunityVisitAttendee {
  /** Stable local identifier retained across upload attempts. */
  localId: string;

  /** References CommunityVisit.localId, not the server visit ID. */
  visitLocalId: string;

  /**
   * Downloaded member client number. Null matches SQLite's provisional support
   * for manual visitors; it does not establish API support for such visitors.
   * Initially, attendee selection requires a downloaded member with a clientNo.
   */
  clientNo: string | null;

  /** Member name copied when the attendee is selected. */
  visitorName: string;

  districtId: string | null;
  vdcnpCode: string | null;
  wardNo: string | null;
  address: string | null;

  /**
   * Preserve the supplied gender code for local counts; not sent to attendance API.
   * Missing or unrecognized values must not be inferred as male or female.
   */
  gender: string | null;

  /** Backend identity mapping is unconfirmed; never infer from another ID. */
  createdBy: string | null;

  /**
   * API createdOn value, separate from local timestamps. Its required format and
   * defaulting behavior are unconfirmed; keep null until deliberately resolved.
   */
  createdOn: string | null;

  /**
   * Independent upload state enables retrying only unsynced attendance after
   * the parent server ID has been persisted. FAILED alone does not prove that
   * retrying is safe after a timeout or another ambiguous server outcome.
   */
  syncStatus: CommunityVisitAttendeeSyncStatus;
  lastSyncError: string | null;

  /** Unix timestamps in milliseconds. */
  createdAt: number;
  updatedAt: number;
}
