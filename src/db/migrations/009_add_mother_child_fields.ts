import type { SQLiteDatabase } from "expo-sqlite";
import type { Migration } from "../migrate";

export const migration009: Migration = {
  version: 9,

  async up(db: SQLiteDatabase) {
    await db.execAsync(`
      ALTER TABLE household_members
      ADD COLUMN mother_of_child TEXT;
    `);

    await db.execAsync(`
      ALTER TABLE household_members
      ADD COLUMN child_dob TEXT;
    `);
  },
};
