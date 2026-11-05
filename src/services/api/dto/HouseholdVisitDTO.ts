import type { HouseholdListingDTO } from "./HouseholdListingDTO";
import type { GetHHDataListResponse } from "./GetHHDataListResponse";

export interface HouseholdVisitListParams {
  day: number;
  /** Login username, not the numeric CHW ID returned on household rows. */
  chwUsername: string;
}

export type HouseholdVisitListResponse = GetHHDataListResponse;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isHouseholdListing(value: unknown): value is HouseholdListingDTO {
  if (!isRecord(value)) return false;

  const textFields = [
    "householD_ID",
    "datE_OF_LISTING",
    "datE_OF_LISTING_BS",
    "namE_OF_CHW",
    "namE_OF_CHW_ID",
    "province",
    "provincE_NAME",
    "districT_ID",
    "districT_NAME",
    "vdcnP_CODE",
    "vdcnP_NAME",
    "warD_NO",
    "address",
    "typE_OF_HOUSING",
    "createD_ON",
  ];
  if (textFields.some((key) => typeof value[key] !== "string")) return false;
  if (!(value.householD_ID as string).trim()) return false;
  if (!/^\d+$/.test(value.warD_NO as string)) return false;

  const count = value.nO_OF_HOUSEHOLD_MEMBERS;
  if (typeof count !== "number" || !Number.isSafeInteger(count) || count < 0) {
    return false;
  }

  for (const key of [
    "accesS_TO_CLEAN_WATER",
    "accesS_TO_SANITATION",
    "activE_FLAG",
  ]) {
    if (value[key] !== "Y" && value[key] !== "N") return false;
  }
  for (const key of [
    "gpS_COORDINATES",
    "createD_BY",
    "hH_CLOSED_DATE",
    "hH_CLOSED_DATE_BS",
  ]) {
    if (value[key] !== null && typeof value[key] !== "string") return false;
  }
  for (const key of ["modifieD_DATE", "householD_HEAD_NAME"]) {
    if (value[key] != null && typeof value[key] !== "string") return false;
  }
  return true;
}

/** Reject incomplete snapshots instead of silently hiding or corrupting rows. */
export function parseHouseholdVisitListResponse(
  data: unknown,
): HouseholdVisitListResponse {
  if (!isRecord(data) || typeof data.response_code !== "string") {
    throw new Error(
      "The server returned an invalid household list. Please try again.",
    );
  }
  if (data.response_code !== "0") {
    throw new Error(
      typeof data.response_message === "string" && data.response_message.trim()
        ? data.response_message
        : "The server could not load households for this day.",
    );
  }
  if (
    typeof data.request_id !== "string" ||
    typeof data.response_message !== "string" ||
    !Array.isArray(data.properties) ||
    !data.properties.every(isHouseholdListing)
  ) {
    throw new Error(
      "The household list is incomplete or invalid. Please try again.",
    );
  }
  const ids = data.properties.map((row) => row.householD_ID);
  if (new Set(ids).size !== ids.length) {
    throw new Error(
      "The server returned duplicate households. Please try again.",
    );
  }
  return {
    request_id: data.request_id,
    response_code: data.response_code,
    response_message: data.response_message,
    properties: data.properties,
  };
}
