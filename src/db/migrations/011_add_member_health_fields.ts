import type { SQLiteDatabase } from "expo-sqlite";
import type { Migration } from "../migrate";

export const migration011: Migration = {
  version: 11,

  async up(db: SQLiteDatabase) {
    await db.execAsync(`
      ALTER TABLE household_members ADD COLUMN client_age TEXT;
    `);

    await db.execAsync(`
      ALTER TABLE household_members ADD COLUMN health_conditions_dia TEXT;
    `);

    await db.execAsync(`
      ALTER TABLE household_members ADD COLUMN health_conditions_hyp TEXT;
    `);

    await db.execAsync(`
      ALTER TABLE household_members ADD COLUMN health_conditions_car TEXT;
    `);

    await db.execAsync(`
      ALTER TABLE household_members ADD COLUMN health_conditions_chr TEXT;
    `);

    await db.execAsync(`
      ALTER TABLE household_members ADD COLUMN health_conditions_oth TEXT;
    `);

    await db.execAsync(`
      ALTER TABLE household_members ADD COLUMN health_conditions_others TEXT;
    `);
  },
};
