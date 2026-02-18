import type { SQLiteDatabase } from "expo-sqlite";
import type { Migration } from "../migrate";

export const migration002: Migration = {
  version: 2,

  async up(db: SQLiteDatabase) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS household_info (
        household_id TEXT PRIMARY KEY,

        date_of_listing TEXT,
        name_of_chw TEXT,
        created_on TEXT,
        created_by TEXT,
        hh_closed_date TEXT,

        deleted_at TEXT,

        FOREIGN KEY (household_id)
          REFERENCES households(id)
          ON DELETE CASCADE
      );
    `);
  },
};
