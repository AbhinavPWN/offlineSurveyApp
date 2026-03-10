import { db } from "../db";

export type AddressOption = {
  id: string;
  name_en: string;
  name_np: string;
};

// Get all provinces
export async function getProvinces(): Promise<AddressOption[]> {
  return db.getAllAsync<AddressOption>(
    `SELECT id, name_en, name_np
     FROM province
     ORDER BY id`,
  );
}

// Get districts by province
export async function getDistrictsByProvince(
  provinceId: string,
): Promise<AddressOption[]> {
  return db.getAllAsync<AddressOption>(
    `SELECT id, name_en, name_np
     FROM district
     WHERE province_id = ?
     ORDER BY name_en`,
    [provinceId],
  );
}

// Get municipalities by district
export async function getMunicipalitiesByDistrict(
  districtId: string,
): Promise<AddressOption[]> {
  return db.getAllAsync<AddressOption>(
    `SELECT id, name_en, name_np
     FROM municipality
     WHERE district_id = ?
     ORDER BY name_en`,
    [districtId],
  );
}

// Get province by district (for auto-fill)
export async function getProvinceByDistrict(
  districtId: string,
): Promise<string | null> {
  const row = await db.getFirstAsync<{ province_id: string }>(
    `SELECT province_id FROM district WHERE id = ?`,
    [districtId],
  );

  return row?.province_id ?? null;
}

// Get all districts (no province filter)
export async function getAllDistricts(): Promise<AddressOption[]> {
  return db.getAllAsync<AddressOption>(
    `SELECT id, name_en, name_np
     FROM district
     ORDER BY name_en`,
  );
}

export async function getAllMunicipalities(): Promise<AddressOption[]> {
  return db.getAllAsync<AddressOption>(
    `SELECT id, name_en, name_np
     FROM municipality`,
  );
}
