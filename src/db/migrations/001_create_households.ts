import { SQLiteDatabase } from "expo-sqlite";

export const migration001 = {
  version: 1,

  async up(db: SQLiteDatabase): Promise<void> {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS households (
        id TEXT PRIMARY KEY,

        server_id TEXT UNIQUE,

        chw_id TEXT NOT NULL,

        status TEXT NOT NULL,              -- SYNCED | PENDING | FAILED
        sync_action TEXT,                  -- INSERT | UPDATE | null

        province_code TEXT,
        district_code TEXT,
        vdc_code TEXT,
        ward_no TEXT,
        address TEXT,

        household_member_count INTEGER,
        housing_type_code TEXT,
        has_clean_water TEXT,
        has_sanitation TEXT,
        active_flag TEXT,

        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_households_chw
      ON households (chw_id);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_households_status
      ON households (status);
    `);
  },
};
