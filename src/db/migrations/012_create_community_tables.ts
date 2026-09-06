import type { SQLiteDatabase } from "expo-sqlite";
import type { Migration } from "../migrate";

export const migration012: Migration = {
  version: 12,

  async up(db: SQLiteDatabase) {
    // ------------------------------------
    // Downloaded community members
    // ------------------------------------

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS community_members (
        emp_id TEXT NOT NULL,
        client_no TEXT NOT NULL,

        household_id TEXT NOT NULL,

        district_id TEXT,
        district_name TEXT,

        municipality_name TEXT,
        vdcnp_code TEXT,
        ward_no TEXT,
        address TEXT,

        household_head_name TEXT,
        member_name TEXT NOT NULL,
        relationship TEXT,

        gender TEXT,
        client_age INTEGER,

        pregnancy_status TEXT,
        pregnancy_date TEXT,

        mother_of_child TEXT,
        child_dob TEXT,

        downloaded_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,

        PRIMARY KEY (emp_id, client_no)
      );
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_community_members_emp
      ON community_members(emp_id);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_community_members_name
      ON community_members(member_name);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_community_members_household
      ON community_members(household_id);
    `);

    // A member may appear in more than one downloaded category.
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS community_member_eligibilities (
        emp_id TEXT NOT NULL,
        client_no TEXT NOT NULL,

        category_no TEXT NOT NULL,
        member_category TEXT NOT NULL,

        downloaded_at INTEGER NOT NULL,

        PRIMARY KEY (
          emp_id,
          client_no,
          category_no,
          member_category
        ),

        FOREIGN KEY (emp_id, client_no)
          REFERENCES community_members(emp_id, client_no)
          ON DELETE CASCADE
      );
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_community_eligibility_filter
      ON community_member_eligibilities(
        emp_id,
        category_no,
        member_category
      );
    `);

    // ------------------------------------
    // Community visits
    // ------------------------------------

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS community_visits (
        local_id TEXT PRIMARY KEY,
        server_id TEXT UNIQUE,

        chw_username TEXT NOT NULL,
        supervisor_id TEXT NOT NULL,

        visit_date_ad TEXT NOT NULL,
        visit_date_bs TEXT NOT NULL,

        community_name TEXT NOT NULL,
        address TEXT NOT NULL,
        community_category TEXT NOT NULL,

        no_of_present INTEGER NOT NULL DEFAULT 0,
        no_of_females INTEGER NOT NULL DEFAULT 0,
        no_of_males INTEGER NOT NULL DEFAULT 0,
        no_of_pwd INTEGER NOT NULL DEFAULT 0,

        session_topic_nut TEXT NOT NULL DEFAULT 'N',
        session_topic_healthly TEXT NOT NULL DEFAULT 'N',
        session_topic_drug TEXT NOT NULL DEFAULT 'N',
        session_topic_child TEXT NOT NULL DEFAULT 'N',
        session_topic_heat TEXT NOT NULL DEFAULT 'N',
        session_topic_malaria TEXT NOT NULL DEFAULT 'N',
        session_topic_diarrhoea TEXT NOT NULL DEFAULT 'N',
        session_topic_gbv TEXT NOT NULL DEFAULT 'N',

        user_id TEXT,

        sync_status TEXT NOT NULL DEFAULT 'DRAFT'
          CHECK (
            sync_status IN (
              'DRAFT',
              'PENDING',
              'PARTIAL',
              'SYNCED',
              'FAILED'
            )
          ),

        sync_action TEXT NOT NULL DEFAULT 'INSERT'
          CHECK (sync_action = 'INSERT'),

        last_sync_error TEXT,

        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        deleted_at INTEGER
      );
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_community_visits_chw
      ON community_visits(chw_username);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_community_visits_sync
      ON community_visits(sync_status);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_community_visits_date
      ON community_visits(visit_date_ad);
    `);

    // ------------------------------------
    // Community visit attendance
    // ------------------------------------

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS community_visit_attendees (
        local_id TEXT PRIMARY KEY,
        visit_local_id TEXT NOT NULL,

        client_no TEXT,
        visitor_name TEXT NOT NULL,

        district_id TEXT,
        vdcnp_code TEXT,
        ward_no TEXT,
        address TEXT,

        gender TEXT,
        is_pwd TEXT NOT NULL DEFAULT 'N'
          CHECK (is_pwd IN ('Y', 'N')),

        created_by TEXT,
        created_on TEXT,

        sync_status TEXT NOT NULL DEFAULT 'DRAFT'
          CHECK (
            sync_status IN (
              'DRAFT',
              'PENDING',
              'SYNCED',
              'FAILED'
            )
          ),

        last_sync_error TEXT,

        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,

        FOREIGN KEY (visit_local_id)
          REFERENCES community_visits(local_id)
          ON DELETE CASCADE
      );
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_community_attendees_visit
      ON community_visit_attendees(visit_local_id);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_community_attendees_sync
      ON community_visit_attendees(sync_status);
    `);

    await db.execAsync(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_community_attendee_member_unique
      ON community_visit_attendees(visit_local_id, client_no)
      WHERE client_no IS NOT NULL AND client_no <> '';
    `);
  },
};
