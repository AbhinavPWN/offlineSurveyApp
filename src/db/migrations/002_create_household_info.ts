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

        province TEXT,
        district_id TEXT,
        vdcnp_code TEXT,
        ward_no TEXT,

        gps_coordinates TEXT,

        no_of_household_members INTEGER,

        type_of_housing TEXT,
        access_to_clean_water TEXT,
        access_to_sanitation TEXT,

        address TEXT,

        active_flag TEXT DEFAULT 'N',
        hh_closed_date TEXT,

        created_on TEXT,
        created_by TEXT,

        deleted_at TEXT,

        FOREIGN KEY (household_id)
          REFERENCES households(id)
          ON DELETE CASCADE
      );
    `);
  },
};
