import type { SQLiteDatabase } from "expo-sqlite";
import type { Migration } from "../migrate";
import {
  provinces,
  districts,
  municipalities,
} from "../../constants/addressSeed"; // use relative path unless alias confirmed

export const migration007: Migration = {
  version: 7,

  async up(db: SQLiteDatabase) {
    // =========================
    // Create Province Table
    // =========================
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS province (
        id TEXT PRIMARY KEY,
        name_en TEXT NOT NULL,
        name_np TEXT NOT NULL
      );
    `);

    // =========================
    // Create District Table
    // =========================
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS district (
        id TEXT PRIMARY KEY,
        province_id TEXT NOT NULL,
        name_en TEXT NOT NULL,
        name_np TEXT NOT NULL,
        FOREIGN KEY (province_id) REFERENCES province(id)
      );
    `);

    // =========================
    // Create Municipality Table
    // =========================
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS municipality (
        id TEXT PRIMARY KEY,
        district_id TEXT NOT NULL,
        province_id TEXT NOT NULL,
        name_en TEXT NOT NULL,
        name_np TEXT NOT NULL,
        FOREIGN KEY (district_id) REFERENCES district(id),
        FOREIGN KEY (province_id) REFERENCES province(id)
      );
    `);

    // =========================
    // Indexes (VERY IMPORTANT)
    // =========================
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_district_province
      ON district(province_id);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_municipality_district
      ON municipality(district_id);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_municipality_province
      ON municipality(province_id);
    `);

    // =========================
    // Seed Provinces
    // =========================
    for (const p of provinces) {
      await db.runAsync(
        `INSERT OR IGNORE INTO province (id, name_en, name_np)
         VALUES (?, ?, ?)`,
        [p.id, p.name_en, p.name_np],
      );
    }

    // =========================
    // Seed Districts
    // =========================
    for (const d of districts) {
      await db.runAsync(
        `INSERT OR IGNORE INTO district (id, province_id, name_en, name_np)
         VALUES (?, ?, ?, ?)`,
        [d.id, d.province_id, d.name_en, d.name_np],
      );
    }

    // =========================
    // Seed Municipalities
    // =========================
    for (const m of municipalities) {
      await db.runAsync(
        `INSERT OR IGNORE INTO municipality (id, district_id, province_id, name_en, name_np)
         VALUES (?, ?, ?, ?, ?)`,
        [m.id, m.district_id, m.province_id, m.name_en, m.name_np],
      );
    }

    console.log("✅ Address master tables created and seeded successfully.");
  },
};
