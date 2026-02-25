import type { SQLiteDatabase } from "expo-sqlite";
import type { Migration } from "../migrate";

export const migration006: Migration = {
  version: 6,

  async up(db: SQLiteDatabase) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS household_members (
        -- Identity
        id TEXT PRIMARY KEY,
        client_no TEXT UNIQUE,
        household_local_id TEXT NOT NULL,

        -- Sync
        sync_status TEXT NOT NULL,
        sync_action TEXT,

        -- Enrollment
        enroll_date_ad TEXT,
        enroll_date_bs TEXT,

        -- Personal Info
        first_name TEXT,
        middle_name TEXT,
        last_name TEXT,
        gender TEXT,
        marital_status TEXT,
        religion_code TEXT,
        caste_code TEXT,
        relation_to_hh TEXT,
        head_household TEXT,

        -- Identity Docs
        id_document_type TEXT,
        id_document_no TEXT,
        id_issue_district_code TEXT,
        id_issue_date_ad TEXT,
        id_issue_date_bs TEXT,

        -- DOB
        dob_ad TEXT,
        dob_bs TEXT,

        -- Contact
        mobile_no TEXT,
        minor_yn TEXT,

        -- Address
        address1_type TEXT,
        address TEXT,
        address1_line2 TEXT,
        address1_line3 TEXT,
        address1_district_code TEXT,
        address1_province TEXT,

        -- Occupation / Education
        occupation_code TEXT,
        education_code TEXT,
        employee_id TEXT,
        tran_office_code TEXT,

        -- Financial
        total_asset TEXT,
        total_liabilities TEXT,
        net_worth TEXT,
        soi_salary TEXT,
        soi_bus_income TEXT,
        soi_returnfrmInvest TEXT,
        soi_inheritance TEXT,
        soi_remittance TEXT,
        soi_others TEXT,
        soi_agriculture TEXT,

        -- Health
        health_conditions_yn TEXT,
        health_conditions TEXT,
        disability_ident_yn TEXT,
        disability_ident TEXT,
        seeing TEXT,
        hearing TEXT,
        walking TEXT,
        remembering TEXT,
        self_care TEXT,
        communicating TEXT,
        disability_status TEXT,
        pregnancy_status TEXT,
        pregnancy_date TEXT,
        vaccination_status TEXT,
        health_ins_coverage TEXT,

        -- Misc
        client_behaviour TEXT,
        image_path TEXT,
        image_upload_status TEXT,

        -- Audit
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,

        FOREIGN KEY (household_local_id)
          REFERENCES households(id)
          ON DELETE CASCADE
      );
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_members_household
      ON household_members(household_local_id);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_members_status
      ON household_members(sync_status);
    `);
  },
};
