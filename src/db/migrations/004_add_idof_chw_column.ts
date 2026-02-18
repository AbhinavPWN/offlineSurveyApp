import type { SQLiteDatabase } from "expo-sqlite";
import type { Migration } from "../migrate";

export const migration004: Migration = {
  version: 4,

  async up(db: SQLiteDatabase) {
    await db.execAsync(`
      ALTER TABLE households
      ADD COLUMN idof_chw TEXT;
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_households_idof_chw
      ON households (idof_chw);
    `);
  },
};
