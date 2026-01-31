import { db } from "../db";
import { Household, HouseholdRepository } from "./HouseholdRepository";
import * as Crypto from "expo-crypto";

// adding ROW Mapper
function mapRowToHousehold(row: any): Household {
  return {
    id: row.id,
    householdCode: row.household_code,
    status: row.status,

    isActive: Boolean(row.is_active),

    createdByUserId: row.created_by_user_id,
    chwId: row.chw_id ?? undefined,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
    submittedAt: row.submitted_at ?? undefined,
  };
}

export class SQLiteHouseholdRepository implements HouseholdRepository {
  // Create - startHousehold
  async startHousehold(params: {
    householdCode: string;
    createdByUserId: string;
    chwId?: string;
  }): Promise<string> {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();

    await db.execAsync("BEGIN");

    try {
      await db.runAsync(
        `
                INSERT INTO households (
                id,
                household_code,
                status,
                is_active,
                created_by_user_id,
                chw_id,
                created_at,
                updated_at
                ) VALUES (?,?,?,?,?,?,?,?)
                `,
        [
          id,
          params.householdCode,
          "DRAFT",
          1,
          params.createdByUserId,
          params.chwId ?? null,
          now,
          now,
        ],
      );

      await db.execAsync("COMMIT");
      return id;
    } catch (error) {
      await db.execAsync("ROLLBACK");
      throw error;
    }
  }

  //   Read - getHouseholdById
  async getHouseholdById(id: string) {
    const row = await db.getFirstAsync<any>(
      `
        SELECT * 
        FROM households 
        WHERE id = ? 
            AND deleted_at IS NULL 
        `,
      [id],
    );

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      householdCode: row.household_code,
      status: row.status,

      isActive: Boolean(row.is_active),

      createdByUserId: row.created_by_user_id,
      chwId: row.chw_id ?? undefined,

      createdAt: row.created_at,
      updatedAt: row.updated_at,
      submittedAt: row.submitted_at ?? undefined,
    };
  }

  //   Business lookup - READ
  async getHouseholdByCode(householdCode: string) {
    const row = await db.getFirstAsync<any>(
      `
        SELECT *
        FROM households
        WHERE household_code = ? 
            AND deleted_at IS NULL
        
        `,
      [householdCode],
    );

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      householdCode: row.household_code,
      status: row.status,

      isActive: Boolean(row.is_active),

      createdByUserId: row.created_by_user_id,
      chwId: row.chw_id ?? undefined,

      createdAt: row.created_at,
      updatedAt: row.updated_at,
      submittedAt: row.submitted_at ?? undefined,
    };
  }

  //   UPDATE
  async updateDraftHousehold(
    id: string,
    patch: Partial<Omit<Household, "id" | "householdCode" | "status">>,
  ): Promise<void> {
    // Preventing from empty patch or updates
    const keys = Object.keys(patch);
    if (keys.length === 0) {
      return;
    }

    // defining field mapping
    const fieldMap: Record<string, string> = {
      provinceCode: "province_code",
      districtCode: "district_code",
      vdcCode: "vdc_code",
      wardNo: "ward_no",
      address: "address",
      gpsLat: "gps_lat",
      gpsLong: "gps_long",
      gpsAccuracy: "gps_accuracy",
      chwId: "chw_id",
    };

    const setClauses: string[] = []; // Which columns to update
    const values: any[] = []; // What values to write

    // Looping through the patch.
    for (const key of Object.keys(patch)) {
      const column = fieldMap[key];
      const value = (patch as any)[key];

      if (!column || value === undefined) {
        continue;
      }

      setClauses.push(`${column} = ?`);
      values.push(value);
    }

    setClauses.push("updated_at = ?");
    values.push(new Date().toISOString());

    // Aborting if nothing valid is there to update
    if (setClauses.length === 1) return;

    // Starting transaction
    await db.execAsync("BEGIN");

    // Executing UPDATE
    try {
      await db.runAsync(
        `
             UPDATE households 
             SET ${setClauses.join(",")}
             WHERE id = ?
                AND status = "DRAFT"
                AND deleted_at IS NULL    
    
            `,
        [...values, id],
      );

      await db.execAsync("COMMIT");
    } catch (error) {
      await db.execAsync("ROLLBACK");
      throw error;
    }
  }

  //   State Transition
  async submitHousehold(id: string): Promise<void> {
    const now = new Date().toISOString();

    await db.execAsync("BEGIN");

    try {
      await db.runAsync(
        `
            UPDATE households
            SET 
                status = "SUBMITTED",
                submitted_at = ?,
                updated_at = ?
            WHERE 
                id = ?
                AND status = "DRAFT"
                AND deleted_at IS NULL
            `,
        [now, now, id],
      );

      await db.execAsync("COMMIT");
    } catch (error) {
      await db.execAsync("ROLLBACK");
      throw error;
    }
  }

  //   LIST
  async listDraftHouseholds(): Promise<Household[]> {
    const rows = await db.getAllAsync<any>(
      `
        SELECT * 
        FROM households 
        WHERE status = "DRAFT"
            AND deleted_at IS NULL
        ORDER BY updated_at DESC
        `,
    );

    return rows.map((row) => ({
      id: row.id,
      householdCode: row.household_code,
      status: row.status,

      isActive: Boolean(row.is_active),

      createdByUserId: row.created_by_user_id,
      chwId: row.chw_id ?? undefined,

      createdAt: row.created_at,
      updatedAt: row.updated_at,
      submittedAt: row.submitted_at ?? undefined,
    }));
  }

  async listSubmittedHouseholds(): Promise<Household[]> {
    const rows = await db.getAllAsync<any>(
      `
      SELECT *
      FROM households
      WHERE status = "SUBMITTED"
        AND deleted_at IS NULL
      ORDER BY submitted_at DESC
      `,
    );

    return rows.map(mapRowToHousehold);
  }
}
