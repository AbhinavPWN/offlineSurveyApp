import type { SQLiteDatabase } from "expo-sqlite";
import type { Migration } from "../migrate";

export const migration010: Migration = {
  version: 10,

  async up(db: SQLiteDatabase) {
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

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_surveys_household_id
      ON surveys(household_id);
    `);
  },
};
