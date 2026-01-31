import { db } from "../db";
import {
  HouseholdInfo,
  HouseholdInfoRepository,
  ValidationResult,
} from "./HouseholdInfoRepository";

export class SQLiteHouseholdInfoRepository implements HouseholdInfoRepository {
  validateForSubmit(info: HouseholdInfo): ValidationResult {
    // throw new Error("Method not implemented.");
    const missing: string[] = [];

    if (!info.province) missing.push("Province");
    if (!info.districtId) missing.push("District");
    if (!info.wardNo) missing.push("Ward");
    if (
      typeof info.noOfHouseholdMembers !== "number" ||
      info.noOfHouseholdMembers <= 0
    )
      missing.push("No. of household members");

    if (!info.typeOfHousing) missing.push("Type of housing");
    if (!info.accessToCleanWater) missing.push("Access to clean water");
    if (!info.accessToSanitation) missing.push("Access to sanitation");
    if (!info.gpsCoordinates) missing.push("GPS location");

    return {
      valid: missing.length === 0,
      missingFields: missing,
    };
  }

  async getByHouseholdId(householdId: string) {
    const row = await db.getFirstAsync<any>(
      `
      SELECT *
      FROM household_info
      WHERE household_id = ?
        AND deleted_at IS NULL
      `,
      [householdId],
    );

    if (!row) return null;

    return {
      householdId: row.household_id,

      dateOfListing: row.date_of_listing ?? undefined,
      nameOfChw: row.name_of_chw ?? undefined,

      province: row.province ?? undefined,
      districtId: row.district_id ?? undefined,
      vdcnpCode: row.vdcnp_code ?? undefined,
      wardNo: row.ward_no ?? undefined,

      gpsCoordinates: row.gps_coordinates ?? undefined,

      noOfHouseholdMembers: row.no_of_household_members ?? undefined,

      typeOfHousing: row.type_of_housing ?? undefined,
      accessToCleanWater: row.access_to_clean_water ?? undefined,
      accessToSanitation: row.access_to_sanitation ?? undefined,

      address: row.address ?? undefined,

      activeFlag: row.active_flag ?? undefined,
      hhClosedDate: row.hh_closed_date ?? undefined,

      createdOn: row.created_on ?? undefined,
      createdBy: row.created_by ?? undefined,
    };
  }

  async upsertDraft(
    householdId: string,
    patch: Partial<HouseholdInfo>,
  ): Promise<void> {
    const keys = Object.keys(patch);
    if (keys.length === 0) return;

    const fieldMap: Record<string, string> = {
      dateOfListing: "date_of_listing",
      nameOfChw: "name_of_chw",
      province: "province",
      districtId: "district_id",
      vdcnpCode: "vdcnp_code",
      wardNo: "ward_no",
      gpsCoordinates: "gps_coordinates",
      noOfHouseholdMembers: "no_of_household_members",
      typeOfHousing: "type_of_housing",
      accessToCleanWater: "access_to_clean_water",
      accessToSanitation: "access_to_sanitation",
      address: "address",
      activeFlag: "active_flag",
      hhClosedDate: "hh_closed_date",
      createdOn: "created_on",
      createdBy: "created_by",
    };

    const columns: string[] = [];
    const placeholders: string[] = [];
    const updates: string[] = [];
    const values: any[] = [];

    for (const key of keys) {
      const column = fieldMap[key];
      const value = (patch as any)[key];

      if (!column || value === undefined) continue;

      columns.push(column);
      placeholders.push("?");
      updates.push(`${column} = excluded.${column}`);
      values.push(value);
    }

    if (columns.length === 0) return;

    await db.runAsync(
      `
      INSERT INTO household_info (
        household_id,
        ${columns.join(",")}
      ) VALUES (
        ?,
        ${placeholders.join(",")}
      )
      ON CONFLICT(household_id)
      DO UPDATE SET
        ${updates.join(",")}
      `,
      [householdId, ...values],
    );
  }
}
