import type { SQLiteDatabase } from "expo-sqlite";
import type { Migration } from "../migrate";

export const migration005: Migration = {
  version: 5,

  async up(db: SQLiteDatabase) {
    await db.execAsync(`
      ALTER TABLE households
      ADD COLUMN is_downloaded INTEGER DEFAULT 1;
    `);
  },
};
