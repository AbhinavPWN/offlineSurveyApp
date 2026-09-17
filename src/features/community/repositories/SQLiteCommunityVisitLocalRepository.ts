import type { SQLiteDatabase } from "expo-sqlite";
import { db } from "../../../db";
import type { CommunityVisit } from "../models/CommunityVisit";
import type { CommunityVisitAttendee } from "../models/CommunityVisitAttendee";
import type {
  CommunityVisitLocalRepository,
  CommunityVisitScope,
  CommunityVisitWithAttendees,
  SaveCommunityVisitDraftInput,
  QueueCommunityVisitInput,
  CommunityVisitParentSuccessInput,
  CommunityVisitFailureInput,
  CommunityVisitAttendeeScope,
  CommunityVisitAttendeeFailureInput,
} from "./CommunityVisitLocalRepository";

// These fixed maps are the only source of interpolated SQL identifiers.
const visitColumns: Record<keyof CommunityVisit, string> = {
  localId: "local_id",
  serverId: "server_id",
  chwUsername: "chw_username",
  supervisorId: "supervisor_id",
  visitDateAd: "visit_date_ad",
  visitDateBs: "visit_date_bs",
  communityName: "community_name",
  address: "address",
  communityCategory: "community_category",
  noOfPresent: "no_of_present",
  noOfFemales: "no_of_females",
  noOfMales: "no_of_males",
  noOfPwd: "no_of_pwd",
  sessionTopicNut: "session_topic_nut",
  sessionTopicHealthly: "session_topic_healthly",
  sessionTopicDrug: "session_topic_drug",
  sessionTopicChild: "session_topic_child",
  sessionTopicHeat: "session_topic_heat",
  sessionTopicMalaria: "session_topic_malaria",
  sessionTopicDiarrhoea: "session_topic_diarrhoea",
  sessionTopicGbv: "session_topic_gbv",
  userId: "user_id",
  syncStatus: "sync_status",
  syncAction: "sync_action",
  lastSyncError: "last_sync_error",
  createdAt: "created_at",
  updatedAt: "updated_at",
  deletedAt: "deleted_at",
};

const attendeeColumns: Record<keyof CommunityVisitAttendee, string> = {
  localId: "local_id",
  visitLocalId: "visit_local_id",
  clientNo: "client_no",
  visitorName: "visitor_name",
  districtId: "district_id",
  vdcnpCode: "vdcnp_code",
  wardNo: "ward_no",
  address: "address",
  gender: "gender",
  createdBy: "created_by",
  createdOn: "created_on",
  syncStatus: "sync_status",
  lastSyncError: "last_sync_error",
  createdAt: "created_at",
  updatedAt: "updated_at",
};

function projection(columns: Record<string, string>): string {
  return Object.entries(columns)
    .map(([key, column]) => `${column} AS "${key}"`)
    .join(", ");
}

const visitSelect = projection(visitColumns);
const attendeeSelect = projection(attendeeColumns);

function requireText(value: string, label: string): void {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`${label} is required.`);
}

function checkScope(scope: CommunityVisitScope): void {
  // Validate without trimming/case-folding identities into another account.
  requireText(scope.chwUsername, "CHW username");
  requireText(scope.visitLocalId, "Local visit ID");
}

function nextTimestamp(previous = 0): number {
  return Math.max(Date.now(), previous + 1);
}

function requireDraft(visit: CommunityVisit, expectedUpdatedAt: number): void {
  if (visit.syncStatus !== "DRAFT" || visit.serverId !== null) {
    throw new Error("Only an unqueued draft can be edited or queued.");
  }
  if (visit.updatedAt !== expectedUpdatedAt) {
    throw new Error(
      "This draft has changed. Reload it before saving or submitting.",
    );
  }
}

/** All values are bound parameters; callers pass only the fixed maps above. */
async function writeRecord<T extends CommunityVisit | CommunityVisitAttendee>(
  tx: SQLiteDatabase,
  table: "community_visits" | "community_visit_attendees",
  columns: Record<keyof T, string>,
  record: T,
): Promise<void> {
  const keys = Object.keys(columns) as (keyof T)[];
  const names = keys.map((key) => columns[key]);
  await tx.runAsync(
    `INSERT INTO ${table} (${names.join(", ")})
     VALUES (${keys.map(() => "?").join(", ")})
     ON CONFLICT(local_id) DO UPDATE SET
     ${names
       .filter((name) => name !== "local_id")
       .map((name) => `${name} = excluded.${name}`)
       .join(", ")}`,
    keys.map((key) => record[key] as string | number | null),
  );
}

/** Native Android/iOS repository; Expo's exclusive transactions do not support web. */
export class SQLiteCommunityVisitLocalRepository implements CommunityVisitLocalRepository {
  private operations: Promise<void> = Promise.resolve();

  constructor(private readonly database: SQLiteDatabase = db) {}

  private transaction<T>(work: (tx: SQLiteDatabase) => Promise<T>): Promise<T> {
    // Serialize this instance's operations, including consistent aggregate reads.
    const operation = this.operations.then(async () => {
      let result!: T;
      await this.database.withExclusiveTransactionAsync(async (tx) => {
        result = await work(tx);
      });
      return result;
    });
    this.operations = operation.then(
      () => undefined,
      () => undefined,
    );
    return operation;
  }

  private async findVisit(
    tx: SQLiteDatabase,
    scope: CommunityVisitScope,
  ): Promise<CommunityVisit | null> {
    checkScope(scope);
    return tx.getFirstAsync<CommunityVisit>(
      `SELECT ${visitSelect} FROM community_visits
       WHERE local_id = ? AND chw_username = ? COLLATE BINARY AND deleted_at IS NULL`,
      [scope.visitLocalId, scope.chwUsername],
    );
  }

  private async requireVisit(
    tx: SQLiteDatabase,
    scope: CommunityVisitScope,
  ): Promise<CommunityVisit> {
    const visit = await this.findVisit(tx, scope);
    if (!visit)
      throw new Error("Community visit is unavailable for this account.");
    return visit;
  }

  private attendees(
    tx: SQLiteDatabase,
    visitLocalId: string,
  ): Promise<CommunityVisitAttendee[]> {
    return tx.getAllAsync<CommunityVisitAttendee>(
      `SELECT ${attendeeSelect} FROM community_visit_attendees
       WHERE visit_local_id = ? ORDER BY created_at ASC, local_id ASC`,
      [visitLocalId],
    );
  }

  async saveDraft(
    input: SaveCommunityVisitDraftInput,
  ): Promise<CommunityVisitWithAttendees> {
    checkScope(input);
    for (const count of [
      input.visit.noOfPresent,
      input.visit.noOfFemales,
      input.visit.noOfMales,
      input.visit.noOfPwd,
    ]) {
      if (!Number.isSafeInteger(count) || count < 0)
        throw new Error("Attendance counts must be nonnegative whole numbers.");
    }
    const localIds = new Set<string>();
    const clientNos = new Set<string>();
    for (const attendee of input.attendees) {
      requireText(attendee.localId, "Local attendee ID");
      if (localIds.has(attendee.localId))
        throw new Error("Duplicate attendee ID.");
      localIds.add(attendee.localId);
      if (attendee.clientNo !== null) {
        requireText(attendee.clientNo, "Client number");
        if (attendee.clientNo !== attendee.clientNo.trim())
          throw new Error("Client number must not contain surrounding spaces.");
        if (clientNos.has(attendee.clientNo))
          throw new Error("The same member cannot attend a visit twice.");
        clientNos.add(attendee.clientNo);
      }
    }

    return this.transaction(async (tx) => {
      // Check the globally unique ID as well as ownership: never hijack a hidden row.
      const existing = await tx.getFirstAsync<CommunityVisit>(
        `SELECT ${visitSelect} FROM community_visits WHERE local_id = ?`,
        [input.visitLocalId],
      );
      if (
        existing &&
        (existing.chwUsername !== input.chwUsername ||
          existing.deletedAt !== null)
      ) {
        throw new Error("Community visit is unavailable for this account.");
      }
      if (input.expectedUpdatedAt === null) {
        if (existing)
          throw new Error("A visit with this local ID already exists.");
      } else {
        if (!existing) throw new Error("The draft no longer exists.");
        requireDraft(existing, input.expectedUpdatedAt);
      }
      const previous = await this.attendees(tx, input.visitLocalId);
      if (previous.some((attendee) => attendee.syncStatus !== "DRAFT")) {
        throw new Error("Queued attendance cannot be replaced.");
      }
      for (const attendee of input.attendees) {
        const owner = await tx.getFirstAsync<{ visitLocalId: string }>(
          "SELECT visit_local_id AS visitLocalId FROM community_visit_attendees WHERE local_id = ?",
          [attendee.localId],
        );
        if (owner && owner.visitLocalId !== input.visitLocalId)
          throw new Error("Attendee ID belongs to another visit.");
      }
      const now = nextTimestamp(
        Math.max(
          existing?.updatedAt ?? 0,
          ...previous.map((attendee) => attendee.updatedAt),
        ),
      );
      const visit: CommunityVisit = {
        ...input.visit,
        localId: input.visitLocalId,
        chwUsername: input.chwUsername,
        serverId: null,
        syncStatus: "DRAFT",
        syncAction: "INSERT",
        lastSyncError: null,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        deletedAt: null,
      };
      await writeRecord(tx, "community_visits", visitColumns, visit);
      // Only DRAFT rows can reach here. Replacing them together also permits a
      // changed selection without transient unique-client conflicts.
      await tx.runAsync(
        "DELETE FROM community_visit_attendees WHERE visit_local_id = ?",
        [visit.localId],
      );
      const previousById = new Map(
        previous.map((attendee) => [attendee.localId, attendee]),
      );
      for (const inputAttendee of input.attendees) {
        const attendee: CommunityVisitAttendee = {
          ...inputAttendee,
          visitLocalId: visit.localId,
          syncStatus: "DRAFT",
          lastSyncError: null,
          createdAt: previousById.get(inputAttendee.localId)?.createdAt ?? now,
          updatedAt: now,
        };
        // is_pwd intentionally takes its schema default; visit.noOfPwd is authoritative.
        await writeRecord(
          tx,
          "community_visit_attendees",
          attendeeColumns,
          attendee,
        );
      }
      return { visit, attendees: await this.attendees(tx, visit.localId) };
    });
  }

  getByLocalId(
    scope: CommunityVisitScope,
  ): Promise<CommunityVisitWithAttendees | null> {
    return this.transaction(async (tx) => {
      const visit = await this.findVisit(tx, scope);
      return visit
        ? { visit, attendees: await this.attendees(tx, visit.localId) }
        : null;
    });
  }

  listByOwner(chwUsername: string): Promise<CommunityVisit[]> {
    requireText(chwUsername, "CHW username");
    return this.transaction((tx) =>
      tx.getAllAsync<CommunityVisit>(
        `SELECT ${visitSelect} FROM community_visits
       WHERE chw_username = ? COLLATE BINARY AND deleted_at IS NULL
       ORDER BY created_at DESC, local_id ASC`,
        [chwUsername],
      ),
    );
  }

  queueForSync(input: QueueCommunityVisitInput): Promise<void> {
    return this.transaction(async (tx) => {
      const visit = await this.requireVisit(tx, input);
      requireDraft(visit, input.expectedUpdatedAt);
      const attendees = await this.attendees(tx, visit.localId);
      if (attendees.some((attendee) => attendee.syncStatus !== "DRAFT"))
        throw new Error("Attendance is already queued or synced.");
      const now = nextTimestamp(
        Math.max(
          visit.updatedAt,
          ...attendees.map((attendee) => attendee.updatedAt),
        ),
      );
      await tx.runAsync(
        "UPDATE community_visit_attendees SET sync_status = 'PENDING', last_sync_error = NULL, updated_at = ? WHERE visit_local_id = ?",
        [now, visit.localId],
      );
      await tx.runAsync(
        "UPDATE community_visits SET sync_status = 'PENDING', last_sync_error = NULL, updated_at = ? WHERE local_id = ?",
        [now, visit.localId],
      );
    });
  }

  listSyncCandidates(
    chwUsername: string,
  ): Promise<CommunityVisitWithAttendees[]> {
    requireText(chwUsername, "CHW username");
    return this.transaction(async (tx) => {
      const visits = await tx.getAllAsync<CommunityVisit>(
        `SELECT ${visitSelect} FROM community_visits
         WHERE chw_username = ? COLLATE BINARY AND deleted_at IS NULL
         AND sync_status IN ('PENDING', 'PARTIAL', 'FAILED')
         ORDER BY created_at ASC, local_id ASC`,
        [chwUsername],
      );
      const results: CommunityVisitWithAttendees[] = [];
      for (const visit of visits)
        results.push({
          visit,
          attendees: await this.attendees(tx, visit.localId),
        });
      return results;
    });
  }

  private async refreshParent(
    tx: SQLiteDatabase,
    visit: CommunityVisit,
    now: number,
  ): Promise<void> {
    const attendees = await this.attendees(tx, visit.localId);
    const incomplete = attendees.some(
      (attendee) => attendee.syncStatus !== "SYNCED",
    );
    const latestFailure = attendees
      .filter((attendee) => attendee.syncStatus === "FAILED")
      .sort((a, b) => b.updatedAt - a.updatedAt)[0];
    await tx.runAsync(
      "UPDATE community_visits SET sync_status = ?, last_sync_error = ?, updated_at = ? WHERE local_id = ?",
      [
        incomplete ? "PARTIAL" : "SYNCED",
        latestFailure?.lastSyncError ?? null,
        now,
        visit.localId,
      ],
    );
  }

  recordParentSuccess(input: CommunityVisitParentSuccessInput): Promise<void> {
    requireText(input.serverId, "Server visit ID");
    return this.transaction(async (tx) => {
      const visit = await this.requireVisit(tx, input);
      if (visit.serverId !== null) {
        if (visit.serverId !== input.serverId)
          throw new Error("Cannot replace the saved server visit ID.");
        return;
      }
      if (visit.syncStatus !== "PENDING" && visit.syncStatus !== "FAILED")
        throw new Error("Parent visit is not awaiting upload.");
      await tx.runAsync(
        "UPDATE community_visits SET server_id = ? WHERE local_id = ?",
        [input.serverId, visit.localId],
      );
      await this.refreshParent(tx, visit, nextTimestamp(visit.updatedAt));
    });
  }

  recordParentFailure(input: CommunityVisitFailureInput): Promise<void> {
    requireText(input.error, "Sync error");
    return this.transaction(async (tx) => {
      const visit = await this.requireVisit(tx, input);
      if (
        visit.serverId !== null ||
        (visit.syncStatus !== "PENDING" && visit.syncStatus !== "FAILED")
      ) {
        throw new Error("Cannot mark this parent visit as failed.");
      }
      await tx.runAsync(
        "UPDATE community_visits SET sync_status = 'FAILED', last_sync_error = ?, updated_at = ? WHERE local_id = ?",
        [input.error, nextTimestamp(visit.updatedAt), visit.localId],
      );
    });
  }

  private recordAttendance(
    scope: CommunityVisitAttendeeScope,
    error: string | null,
  ): Promise<void> {
    requireText(scope.attendeeLocalId, "Local attendee ID");
    return this.transaction(async (tx) => {
      const visit = await this.requireVisit(tx, scope);
      if (!visit.serverId)
        throw new Error(
          "Save the parent server ID before recording attendance uploads.",
        );
      const attendee = await tx.getFirstAsync<CommunityVisitAttendee>(
        `SELECT ${attendeeSelect} FROM community_visit_attendees WHERE local_id = ? AND visit_local_id = ?`,
        [scope.attendeeLocalId, visit.localId],
      );
      if (!attendee) throw new Error("Attendee does not belong to this visit.");
      if (attendee.syncStatus === "SYNCED" && error === null) return;
      if (attendee.syncStatus !== "PENDING" && attendee.syncStatus !== "FAILED")
        throw new Error("Cannot change this attendee's upload state.");
      const now = nextTimestamp(Math.max(visit.updatedAt, attendee.updatedAt));
      await tx.runAsync(
        "UPDATE community_visit_attendees SET sync_status = ?, last_sync_error = ?, updated_at = ? WHERE local_id = ? AND visit_local_id = ?",
        [
          error === null ? "SYNCED" : "FAILED",
          error,
          now,
          attendee.localId,
          visit.localId,
        ],
      );
      await this.refreshParent(tx, visit, now);
    });
  }

  recordAttendeeSuccess(scope: CommunityVisitAttendeeScope): Promise<void> {
    return this.recordAttendance(scope, null);
  }

  recordAttendeeFailure(
    input: CommunityVisitAttendeeFailureInput,
  ): Promise<void> {
    requireText(input.error, "Sync error");
    return this.recordAttendance(input, input.error);
  }
}
