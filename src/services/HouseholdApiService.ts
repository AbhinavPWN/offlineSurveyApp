// import axios, { AxiosInstance } from "axios";
import { Household } from "../domain/models/Household";
import { mapListingDtoToHousehold } from "./api/mappers/householdListingMapper";
import { GetHHDataListResponse } from "./api/dto/GetHHDataListResponse";
import { AppLogger } from "../utils/AppLogger";
import { BaseApiClient } from "./api/BaseApiClient";

// --------------------
// API Base
// --------------------

const HOUSEHOLD_ENTRY_ENDPOINT = "/Household_Entry";
const HOUSEHOLD_UPDATE_ENDPOINT = "/Household_Update";

// --------------------
// Payload Types
// --------------------

export interface InsertHouseholdPayload {
  dateofListingAD: string;
  idofCHW: string;
  provinceCode: string;
  districtCode: string;
  vdcnpCode: string;
  wardNo: string;
  address: string;
  gpsCoordinates: string;
  noofHHMembers: string;
  typeofHousing: string;
  accesstoCleanWater: string;
  accesstoSanitation: string;
  activeFlag: string;
  hhClosedDateAD: string;
  userId: string;
  insertUpdate: "I";
}

export interface UpdateHouseholdPayload {
  householdId: string;
  dateofListingAD: string;
  idofCHW: string;
  provinceCode: string;
  districtCode: string;
  vdcnpCode: string;
  wardNo: string;
  address: string;
  gpsCoordinates: string;
  noofHHMembers: string;
  typeofHousing: string;
  accesstoCleanWater: string;
  accesstoSanitation: string;
  activeFlag: string;
  hhClosedDateAD: string;
  userId: string;
  insertUpdate: "U";
}

export interface InsertHouseholdResponse {
  outHouseholdId: string;
}

export interface HouseholdApiService {
  insertHousehold(
    payload: InsertHouseholdPayload,
  ): Promise<InsertHouseholdResponse>;

  updateHousehold(payload: UpdateHouseholdPayload): Promise<void>;

  getHouseholdListing(chwId: string): Promise<Household[]>;
}

// declare module "axios" {
//   interface AxiosRequestConfig {
//     metadata?: any;
//   }
// }

// --------------------
// Implementation
// --------------------

export class HouseholdApiServiceImpl implements HouseholdApiService {
  private client = BaseApiClient.getInstance();

  // -----------------------------
  // INSERT
  // -----------------------------
  async insertHousehold(
    payload: InsertHouseholdPayload,
  ): Promise<InsertHouseholdResponse> {
    const response = await this.client.post(HOUSEHOLD_ENTRY_ENDPOINT, payload);

    // 🔎 Log full response once for debugging
    if (__DEV__) {
      console.log(
        "🟢 INSERT RAW RESPONSE:",
        JSON.stringify(response.data, null, 2),
      );
    }

    // ✅ According to API doc, server returns outHouseholdId
    const serverId = response.data?.household_id;

    if (!serverId) {
      await AppLogger.log("ERROR", "Insert response invalid", {
        fullResponse: response.data,
      });

      throw new Error("Invalid insert response: outHouseholdId missing");
    }

    return {
      outHouseholdId: serverId,
    };
  }

  // -----------------------------
  // UPDATE
  // -----------------------------
  async updateHousehold(payload: UpdateHouseholdPayload): Promise<any> {
    if (!payload.householdId) {
      throw new Error("Update failed: householdId is required");
    }

    const response = await this.client.post(HOUSEHOLD_UPDATE_ENDPOINT, payload);

    const data = response.data;

    await AppLogger.log("SYNC", "Household Update API response", {
      householdId: payload.householdId,
      response: data,
    });
    if (__DEV__) {
      console.log("🔵Household UPDATE RESPONSE:", JSON.stringify(data));
    }

    // If API returns response_code, validate it
    if (data?.response_code && data.response_code !== "SUCCESS") {
      throw new Error(data.response_message || "Household update failed");
    }

    return data;
  }

  // -----------------------------
  // GET LISTING
  // -----------------------------
  async getHouseholdListing(chwId: string): Promise<Household[]> {
    try {
      await AppLogger.log("INFO", "Fetching household listing", { chwId });

      const response = await this.client.get<GetHHDataListResponse>(
        `/GetHHDataList/${chwId}`,
      );

      const data = response.data;
      // console.log("Raw API listing response:", data.properties);
      await AppLogger.log("INFO", "LISTING_RAW_RESPONSE", {
        count: data.properties?.length ?? 0,
      });

      if (data.response_code !== "0") {
        await AppLogger.log("ERROR", "Household listing API error", {
          code: data.response_code,
          message: data.response_message,
        });
        throw new Error(data.response_message);
      }

      if (!Array.isArray(data.properties)) {
        await AppLogger.log("ERROR", "Listing properties not array", { data });
        return [];
      }

      const households = data.properties.map(mapListingDtoToHousehold);

      await AppLogger.log("INFO", "Household listing fetched", {
        count: households.length,
      });

      return households;
    } catch (error: any) {
      await AppLogger.log("ERROR", "Failed to fetch household listing", {
        message: error?.message,
      });
      throw error;
    }
  }
}
