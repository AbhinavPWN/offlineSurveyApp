import { v4 as uuidv4 } from "uuid";
import { db } from "@/src/db";

export type SurveyStatus = "draft" | "completed";

export interface SurveyRecord {
  surveyId: string;
  householdId: string;
  memberId: string;
  surveyType: string;
  surveyDate: string | null;
  currentSection: string | null;
  status: SurveyStatus;
  synced: 0 | 1;
  createdAt: string;
  updatedAt: string;
}

export interface PendingSurveyForSync {
  survey: SurveyRecord;
  answers: Record<string, string | null>;
}

interface SurveyRow {
  survey_id: string;
  household_id: string;
  member_id: string;
  survey_type: string;
  survey_date: string | null;
  current_section: string | null;
  status: SurveyStatus;
  synced: number;
  created_at: string;
  updated_at: string;
}

interface SurveyAnswerRow {
  question_key: string;
  answer: string | null;
}

let surveySchemaReady = false;

function nowIso(): string {
  return new Date().toISOString();
}

function mapSurveyRow(row: SurveyRow): SurveyRecord {
  return {
    surveyId: row.survey_id,
    householdId: row.household_id,
    memberId: row.member_id,
    surveyType: row.survey_type,
    surveyDate: row.survey_date,
    currentSection: row.current_section,
    status: row.status,
    synced: row.synced === 1 ? 1 : 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function withWriteTransaction<T>(work: () => Promise<T>): Promise<T> {
  await db.execAsync("BEGIN IMMEDIATE");

  try {
    const result = await work();
    await db.execAsync("COMMIT");
    return result;
  } catch (error) {
    await db.execAsync("ROLLBACK");
    throw error;
  }
}

export async function initializeSurveySQLite(): Promise<void> {
  if (surveySchemaReady) return;

  try {
    await db.execAsync("PRAGMA foreign_keys = ON;");

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS surveys (
        survey_id TEXT PRIMARY KEY,
        household_id TEXT NOT NULL,
        member_id TEXT NOT NULL UNIQUE,
        survey_type TEXT NOT NULL,
        survey_date TEXT,
        current_section TEXT,
        status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed')),
        synced INTEGER NOT NULL DEFAULT 0 CHECK (synced IN (0, 1)),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS survey_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        survey_id TEXT NOT NULL,
        question_key TEXT NOT NULL,
        answer TEXT,
        updated_at TEXT NOT NULL,
        UNIQUE (survey_id, question_key),
        FOREIGN KEY (survey_id) REFERENCES surveys(survey_id) ON DELETE CASCADE
      );
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_survey_answers_survey_id
      ON survey_answers(survey_id);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_surveys_member_id
      ON surveys(member_id);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_surveys_synced
      ON surveys(synced);
    `);

    surveySchemaReady = true;
  } catch (error) {
    throw new Error(
      `Failed to initialize survey SQLite schema: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function createSurveyDraft(
  memberId: string,
  householdId: string,
  surveyType: string,
): Promise<SurveyRecord> {
  if (!memberId?.trim()) throw new Error("memberId is required");
  if (!householdId?.trim()) throw new Error("householdId is required");
  if (!surveyType?.trim()) throw new Error("surveyType is required");

  await initializeSurveySQLite();

  try {
    const existing = await db.getFirstAsync<SurveyRow>(
      `
      SELECT *
      FROM surveys
      WHERE member_id = ?
      LIMIT 1
      `,
      [memberId],
    );

    if (existing) return mapSurveyRow(existing);

    const surveyId = uuidv4();
    const now = nowIso();

    return await withWriteTransaction(async () => {
      await db.runAsync(
        `
        INSERT INTO surveys (
          survey_id,
          household_id,
          member_id,
          survey_type,
          survey_date,
          status,
          synced,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, 'draft', 0, ?, ?)
        `,
        [surveyId, householdId, memberId, surveyType, now, now, now],
      );

      const created = await db.getFirstAsync<SurveyRow>(
        `
        SELECT *
        FROM surveys
        WHERE survey_id = ?
        LIMIT 1
        `,
        [surveyId],
      );

      if (!created) {
        throw new Error("Survey draft creation succeeded but row not found");
      }

      return mapSurveyRow(created);
    });
  } catch (error) {
    throw new Error(
      `Failed to create survey draft for member ${memberId}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function saveSurveyAnswer(
  surveyId: string,
  questionKey: string,
  answer: string | null,
): Promise<void> {
  if (!surveyId?.trim()) throw new Error("surveyId is required");
  if (!questionKey?.trim()) throw new Error("questionKey is required");

  await initializeSurveySQLite();

  const now = nowIso();

  try {
    await withWriteTransaction(async () => {
      await db.runAsync(
        `
        INSERT INTO survey_answers (
          survey_id,
          question_key,
          answer,
          updated_at
        ) VALUES (?, ?, ?, ?)
        ON CONFLICT(survey_id, question_key)
        DO UPDATE SET
          answer = excluded.answer,
          updated_at = excluded.updated_at
        `,
        [surveyId, questionKey, answer, now],
      );

      await db.runAsync(
        `
        UPDATE surveys
        SET updated_at = ?, synced = 0
        WHERE survey_id = ?
        `,
        [now, surveyId],
      );
    });
  } catch (error) {
    throw new Error(
      `Failed to save answer for ${questionKey}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function loadSurveyAnswers(
  surveyId: string,
): Promise<Record<string, string | null>> {
  if (!surveyId?.trim()) throw new Error("surveyId is required");

  await initializeSurveySQLite();

  try {
    const rows = await db.getAllAsync<SurveyAnswerRow>(
      `
      SELECT question_key, answer
      FROM survey_answers
      WHERE survey_id = ?
      ORDER BY id ASC
      `,
      [surveyId],
    );

    const answerMap: Record<string, string | null> = {};

    for (const row of rows) {
      answerMap[row.question_key] = row.answer;
    }

    return answerMap;
  } catch (error) {
    throw new Error(
      `Failed to load survey answers for ${surveyId}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function markSurveyCompleted(surveyId: string): Promise<void> {
  if (!surveyId?.trim()) throw new Error("surveyId is required");

  await initializeSurveySQLite();

  const now = nowIso();

  try {
    await withWriteTransaction(async () => {
      await db.runAsync(
        `
        UPDATE surveys
        SET status = 'completed',
            survey_date = COALESCE(survey_date, ?),
            synced = 0,
            updated_at = ?
        WHERE survey_id = ?
        `,
        [now, now, surveyId],
      );
    });
  } catch (error) {
    throw new Error(
      `Failed to mark survey ${surveyId} as completed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function updateSurveyCurrentSection(
  surveyId: string,
  currentSection: string | null,
): Promise<void> {
  if (!surveyId?.trim()) throw new Error("surveyId is required");

  await initializeSurveySQLite();

  const now = nowIso();

  try {
    await withWriteTransaction(async () => {
      await db.runAsync(
        `
        UPDATE surveys
        SET current_section = ?,
            updated_at = ?,
            synced = 0
        WHERE survey_id = ?
        `,
        [currentSection, now, surveyId],
      );
    });
  } catch (error) {
    throw new Error(
      `Failed to update current section for survey ${surveyId}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function getPendingSurveysForSync(): Promise<
  PendingSurveyForSync[]
> {
  await initializeSurveySQLite();

  try {
    const surveys = await db.getAllAsync<SurveyRow>(
      `
      SELECT *
      FROM surveys
      WHERE synced = 0
        AND status = 'completed'
      ORDER BY updated_at ASC
      `,
    );

    const pending: PendingSurveyForSync[] = [];

    for (const row of surveys) {
      const survey = mapSurveyRow(row);
      const answers = await loadSurveyAnswers(survey.surveyId);
      pending.push({ survey, answers });
    }

    return pending;
  } catch (error) {
    throw new Error(
      `Failed to fetch pending surveys: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function getSurveyByMemberId(
  memberId: string,
): Promise<SurveyRecord | null> {
  if (!memberId?.trim()) throw new Error("memberId is required");

  await initializeSurveySQLite();

  try {
    const row = await db.getFirstAsync<SurveyRow>(
      `
      SELECT *
      FROM surveys
      WHERE member_id = ?
      LIMIT 1
      `,
      [memberId],
    );

    return row ? mapSurveyRow(row) : null;
  } catch (error) {
    throw new Error(
      `Failed to get survey by memberId ${memberId}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export const surveySQLite = {
  initializeSurveySQLite,
  createSurveyDraft,
  saveSurveyAnswer,
  loadSurveyAnswers,
  markSurveyCompleted,
  updateSurveyCurrentSection,
  getPendingSurveysForSync,
  getSurveyByMemberId,
};
