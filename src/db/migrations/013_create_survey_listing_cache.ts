import type { Migration } from "../migrate";

export const migration013: Migration = {
  version: 13,
  async up(db) {
    await db.execAsync(`CREATE TABLE IF NOT EXISTS survey_listing_cache (
      username TEXT NOT NULL,
      day INTEGER NOT NULL CHECK(day BETWEEN 1 AND 32),
      households TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY(username, day)
    )`);
  },
};
