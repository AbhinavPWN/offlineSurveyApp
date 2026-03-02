import type { SQLiteDatabase } from "expo-sqlite";
import type { Migration } from "../migrate";

export const migration008: Migration = {
  version: 8,

  async up(db: SQLiteDatabase) {
    await db.execAsync(`
      ALTER TABLE household_members
      ADD COLUMN address1_municipality_code TEXT;
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_members_municipality
      ON household_members(address1_municipality_code);
    `);
  },
};
