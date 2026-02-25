import { db } from "../db";
import { v4 as uuidv4 } from "uuid";
import {
  HouseholdLocal,
  SyncAction,
  SyncStatus,
} from "../models/household.model";
import { HouseholdLocalRepository } from "./HouseholdLocalRepository";
import { Household } from "../domain/models/Household";
import { AppLogger } from "../utils/AppLogger";

function mapRowToHouseholdLocal(row: any): HouseholdLocal {
  return {
    localId: row.id,
    householdId: row.server_id ?? undefined,
    chwUsername: row.chw_id,
    idofCHW: row.idof_chw,

    provinceCode: row.province_code,
    districtCode: row.district_code,
    vdcnpCode: row.vdc_code,
    wardNo: row.ward_no,

    address: row.address ?? "",
    dateoflistingAD: row.date_of_listing ?? "",
    gpsCoordinates: row.gps_coordinates ?? "",

    noofHHMembers: row.household_member_count ?? 0,
    typeofHousing: row.housing_type_code ?? "P",

    accesstoCleanWater: row.has_clean_water ?? "N",
    accesstoSanitation: row.has_sanitation ?? "N",
    activeFlag: row.active_flag ?? "Y",

    syncStatus: row.status as SyncStatus,
    syncAction: row.sync_action as SyncAction,
    // lastModifiedAt: new Date(row.updated_at).getTime(),
    // lastModifiedAt: row.updated_at
    //   ? new Date(row.updated_at).getTime()
    //   : Date.now(),
    lastModifiedAt:
      row.updated_at && !isNaN(new Date(row.updated_at).getTime())
        ? new Date(row.updated_at).getTime()
        : 0,
  };
}

export class SQLiteHouseholdLocalRepository implements HouseholdLocalRepository {
  //Create New Local
  async createLocalHousehold(params: {
    chwUsername: string;
    idofCHW: string;
    provinceCode: string;
    districtCode: string;
    vdcnpCode: string;
    wardNo: string;
  }): Promise<HouseholdLocal> {
    const id = uuidv4();
    const now = new Date().toISOString();

    try {
      await db.runAsync(
        `
          INSERT INTO households (
          id,
          server_id,
          chw_id,
          idof_chw,
          status,
          sync_action,
          province_code,
          district_code,
          vdc_code,
          ward_no,
          address,
          household_member_count,
          housing_type_code,
          has_clean_water,
          has_sanitation,
          active_flag,
          created_at,
          updated_at
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `,
        [
          id,
          null,
          params.chwUsername,
          params.idofCHW,
          // "PENDING",
          // "INSERT",
          "DRAFT",
          null,
          params.provinceCode,
          params.districtCode,
          params.vdcnpCode,
          params.wardNo,
          "",
          0,
          "P",
          "N",
          "N",
          "Y",
          now,
          now,
        ],
      );

      // Create household_info row
      await db.runAsync(
        `
        INSERT INTO household_info (household_id)
        VALUES (?)
        `,
        [id],
      );

      await AppLogger.log("INFO", " Created new local household", {
        localId: id,
        chw: params.chwUsername,
      });

      return {
        localId: id,
        householdId: undefined,
        chwUsername: params.chwUsername,
        idofCHW: params.idofCHW,
        provinceCode: params.provinceCode,
        districtCode: params.districtCode,
        vdcnpCode: params.vdcnpCode,
        wardNo: params.wardNo,
        address: "",
        dateoflistingAD: "",
        gpsCoordinates: "",
        noofHHMembers: 0,
        typeofHousing: "P",
        accesstoCleanWater: "N",
        accesstoSanitation: "N",
        activeFlag: "Y",
        // syncStatus: "PENDING",
        // syncAction: "INSERT",
        syncStatus: "DRAFT", // New FIXED
        syncAction: null, // New FIXED
        lastModifiedAt: Date.now(),
      };
    } catch (error: any) {
      await AppLogger.log("ERROR", "Failed to create local household", {
        message: error?.message,
      });
      throw error;
    }
  }

  //   LOOKUPS
  async getByLocalId(localId: string): Promise<HouseholdLocal | null> {
    const row = await db.getFirstAsync<any>(
      `
      SELECT h.*, hi.date_of_listing
      FROM households h
      LEFT JOIN household_info hi
      ON hi.household_id = h.id
      WHERE h.id = ? AND h.deleted_at IS NULL
      `,
      [localId],
    );

    return row ? mapRowToHouseholdLocal(row) : null;
  }

  async getByHouseholdId(householdId: string): Promise<HouseholdLocal | null> {
    const row = await db.getFirstAsync<any>(
      `
      SELECT h.*, hi.date_of_listing
      FROM households h
      LEFT JOIN household_info hi
      ON hi.household_id = h.id
      WHERE h.server_id = ? AND h.deleted_at IS NULL
      `,
      [householdId],
    );

    return row ? mapRowToHouseholdLocal(row) : null;
  }

  async listAllForCHW(chwUsername: string): Promise<HouseholdLocal[]> {
    const rows = await db.getAllAsync<any>(
      `
      SELECT h.*, hi.date_of_listing
      FROM households h
      LEFT JOIN household_info hi
      ON hi.household_id = h.id
      WHERE h.chw_id = ?
        AND h.deleted_at IS NULL
      ORDER BY h.updated_at DESC
      `,
      [chwUsername],
    );

    return rows.map(mapRowToHouseholdLocal);
  }

  async listBySyncStatus(
    chwUsername: string,
    status: SyncStatus,
  ): Promise<HouseholdLocal[]> {
    const rows = await db.getAllAsync<any>(
      `
      SELECT h.*, hi.date_of_listing
      FROM households h
      LEFT JOIN household_info hi
      ON hi.household_id = h.id
      WHERE h.chw_id = ?
        AND h.status = ?
        AND h.deleted_at IS NULL
      `,
      [chwUsername, status],
    );

    return rows.map(mapRowToHouseholdLocal);
  }

  //   Update Draft
  async updateDraft(
    localId: string,
    patch: Partial<HouseholdLocal>,
  ): Promise<void> {
    const keys = Object.keys(patch);
    if (keys.length === 0) return;

    const fieldMap: Record<string, string> = {
      provinceCode: "province_code",
      districtCode: "district_code",
      vdcnpCode: "vdc_code",
      wardNo: "ward_no",
      address: "address",
      noofHHMembers: "household_member_count",
      typeofHousing: "housing_type_code",
      accesstoCleanWater: "has_clean_water",
      accesstoSanitation: "has_sanitation",
      activeFlag: "active_flag",
      gpsCoordinates: "gps_coordinates",
    };

    const setClauses: string[] = [];
    const values: any[] = [];

    for (const key of keys) {
      const column = fieldMap[key];
      const value = (patch as any)[key];
      if (!column || value === undefined) continue;
      setClauses.push(`${column} = ? `);
      values.push(value);
    }

    if (setClauses.length === 0) return;

    setClauses.push("updated_at = ?");
    values.push(new Date().toISOString());

    await db.runAsync(
      `
      UPDATE households
      SET ${setClauses.join(",")}
      WHERE id = ?
      `,
      [...values, localId],
    );
    // 🔥 Save date in household_info table
    if (patch.dateoflistingAD !== undefined) {
      await db.runAsync(
        `
        INSERT INTO household_info (household_id, date_of_listing)
        VALUES (?, ?)
        ON CONFLICT(household_id)
        DO UPDATE SET date_of_listing = excluded.date_of_listing
        `,
        [localId, patch.dateoflistingAD],
      );
    }
  }

  //   SYNC STATE TRANSITIONS

  async markPending(localId: string, action: SyncAction): Promise<void> {
    await db.runAsync(
      `
        
        UPDATE households
        SET status = ?, sync_action = ? , updated_at = ? 
        WHERE id = ? 
        `,
      ["PENDING", action, new Date().toISOString(), localId],
    );

    await AppLogger.log("SYNC", "Marked household PENDING", {
      localId,
      action,
    });
  }

  async markSynced(localId: string, serverHouseholdId: string): Promise<void> {
    await db.runAsync(
      `
      UPDATE households
      SET server_id = ?, status = ?, sync_action = NULL, updated_at = ?
      WHERE id = ?
      `,
      [serverHouseholdId, "SYNCED", new Date().toISOString(), localId],
    );

    await AppLogger.log("SYNC", "Household marked SYNCED", {
      localId,
      serverId: serverHouseholdId,
    });
  }

  async markFailed(localId: string, errorMessage?: string): Promise<void> {
    await db.runAsync(
      `
      UPDATE households
      SET status = ?, updated_at = ?
      WHERE id = ?
      `,
      ["FAILED", new Date().toISOString(), localId],
    );

    await AppLogger.log("ERROR", "Household marked FAILED", {
      localId,
    });
  }

  //   LISTING Integration
  async insertFromListing(
    h: Household,
    chwUsername: string,
    idofCHW: string,
  ): Promise<void> {
    const id = uuidv4();
    const now = new Date().toISOString();

    await db.runAsync(
      `
        INSERT INTO households (
        id,
        server_id,
        chw_id,
        idof_chw,
        status,
        sync_action,
        province_code,
        district_code,
        vdc_code,
        ward_no,
        address,
        household_member_count,
        housing_type_code,
        has_clean_water,
        has_sanitation,
        active_flag,
        is_downloaded,
        created_at,
        updated_at  
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `,
      [
        id,
        h.householdId,
        chwUsername,
        idofCHW,
        "SYNCED",
        null,
        h.provinceId,
        h.districtId,
        h.municipalityCode,
        String(h.wardNo),
        h.address,
        h.memberCount,
        h.housingType,
        h.hasCleanWater ? "Y" : "N",
        h.hasSanitation ? "Y" : "N",
        h.isActive ? "Y" : "N",
        1, // Downloaded
        now,
        now,
      ],
    );

    await AppLogger.log("SYNC", "Inserted household from listing ", {
      serverId: h.householdId,
    });
  }

  async updateFromListing(h: Household): Promise<void> {
    const existing = await this.getByHouseholdId(h.householdId);
    if (!existing) return;

    if (existing.syncStatus !== "SYNCED") {
      await AppLogger.log("WARN", "Skipped listing update (Local Pending)", {
        serverId: h.householdId,
      });
      return;
    }

    await db.runAsync(
      `
      UPDATE households
      SET
        province_code = ?,
        district_code = ?,
        vdc_code = ?,
        ward_no = ?,
        address = ?,
        household_member_count = ?,
        housing_type_code = ?,
        has_clean_water = ?,
        has_sanitation = ?,
        active_flag = ?,
        updated_at = ?
      WHERE server_id = ?
      `,
      [
        h.provinceId,
        h.districtId,
        h.municipalityCode,
        String(h.wardNo),
        h.address,
        h.memberCount,
        h.housingType,
        h.hasCleanWater ? "Y" : "N",
        h.hasSanitation ? "Y" : "N",
        h.isActive ? "Y" : "N",
        new Date().toISOString(),
        h.householdId,
      ],
    );

    await AppLogger.log("SYNC", "Updated household from listing", {
      serverId: h.householdId,
    });
  }

  async repairMissingIdOfChw(
    chwUsername: string,
    idofCHW: string,
  ): Promise<void> {
    await db.runAsync(
      `
    UPDATE households
    SET idof_chw = ?
    WHERE chw_id = ?
      AND idof_chw IS NULL
    `,
      [idofCHW, chwUsername],
    );

    await AppLogger.log("INFO", "Repaired missing idof_chw rows", {
      chwUsername,
    });
  }

  // Deleting Local Copy
  async deleteLocal(localId: string): Promise<void> {
    await db.runAsync(
      `
    DELETE FROM households
    WHERE id = ?
    `,
      [localId],
    );

    await AppLogger.log("INFO", "Household removed from device", {
      localId,
    });
  }
}
