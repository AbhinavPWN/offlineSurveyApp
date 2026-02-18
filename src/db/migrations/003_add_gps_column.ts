import type { SQLiteDatabase } from "expo-sqlite";
import type { Migration } from "../migrate";

export const migration003: Migration = {
  version: 3,

  async up(db: SQLiteDatabase) {
    await db.execAsync(`
      ALTER TABLE households
      ADD COLUMN gps_coordinates TEXT;
    `);
  },
};
