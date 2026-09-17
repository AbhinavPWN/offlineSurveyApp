export type CommunityYesNo = "Y" | "N";

/** Matches the statuses allowed by migration 012. */
export type CommunityVisitSyncStatus =
  | "DRAFT"
  | "PENDING"
  | "PARTIAL"
  | "SYNCED"
  | "FAILED";

/** Names preserve the documented API spelling without guessing topic meanings. */
export interface CommunityVisitSessionTopics {
  sessionTopicNut: CommunityYesNo;
  sessionTopicHealthly: CommunityYesNo;
  sessionTopicDrug: CommunityYesNo;
  sessionTopicChild: CommunityYesNo;
  sessionTopicHeat: CommunityYesNo;
  sessionTopicMalaria: CommunityYesNo;
  sessionTopicDiarrhoea: CommunityYesNo;
  sessionTopicGbv: CommunityYesNo;
}

/**
 * Local visit record matching community_visits in migration 012.
 * This is not a POST payload or proof that a draft is ready to submit.
 * Submission validation belongs in the use case.
 */
export interface CommunityVisit extends CommunityVisitSessionTopics {
  localId: string;

  /** Persist immediately after parent success; never reinsert a known parent. */
  serverId: string | null;

  /** Login username owning this local visit, for example wcadmin. */
  chwUsername: string;

  /** Numeric CHW/employee identifier stored as text; do not pad it. */
  supervisorId: string;

  /** AD calendar date: YYYY-MM-DD. Empty is allowed only in a draft. */
  visitDateAd: string;

  /** BS calendar date: YYYY-MM-DD. Empty is allowed only in a draft. */
  visitDateBs: string;

  communityName: string;
  address: string;

  /** Separate from download CategoryNo and MemCategory; mapping unconfirmed. */
  communityCategory: string;

  /** Nonnegative integer counts; serialize as strings only at the API boundary. */
  noOfPresent: number;
  noOfFemales: number;
  noOfMales: number;

  /** Requires explicit collection; member downloads contain no PWD information. */
  noOfPwd: number;

  /** Keep null until the backend identity mapping is confirmed. */
  userId: string | null;

  /** SYNCED means both the parent and all attendance records are saved remotely. */
  syncStatus: CommunityVisitSyncStatus;

  /** Local INSERT maps to API insertUpdate: "I". */
  syncAction: "INSERT";
  lastSyncError: string | null;

  /** Unix timestamps in milliseconds. */
  createdAt: number;
  updatedAt: number;

  /** Local soft deletion only; does not imply a server delete operation. */
  deletedAt: number | null;
}
