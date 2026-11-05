import type { Migration } from "../migrate";

export const migration014: Migration = {
  version: 14,
  async up(db) {
    // A durable marker prevents blind INSERT retries after a timeout or app exit.
    await db.execAsync(`CREATE TABLE IF NOT EXISTS survey_submission_attempts (
      survey_id TEXT PRIMARY KEY,
      attempted_at TEXT NOT NULL
    )`);
  },
};
