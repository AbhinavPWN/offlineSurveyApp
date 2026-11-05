// import axios, { AxiosInstance } from "axios";
import { Household } from "../domain/models/Household";
import { mapListingDtoToHousehold } from "./api/mappers/householdListingMapper";
import { GetHHDataListResponse } from "./api/dto/GetHHDataListResponse";
import { AppLogger } from "../utils/AppLogger";
import { BaseApiClient } from "./api/BaseApiClient";
import {
  HouseholdVisitListParams,
  parseHouseholdVisitListResponse,
} from "./api/dto/HouseholdVisitDTO";

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
  getHouseholdVisitListing(
    params: HouseholdVisitListParams,
  ): Promise<Household[]>;
  getHouseholdHeadName(householdId: string): Promise<string>;
}

// declare module "axios" {
//   interface AxiosRequestConfig {
//     metadata?: any;
//   }
// }

// Helper function for online tab for household head name :
function normalizeRemoteName(value: unknown): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function getHouseholdHeadNameFromRemoteMembers(members: any[]): string {
  const head = members.find((m) => {
    const relation = String(
      m.relationshiP_TO_HEAD_HOUSEHOLD ??
        m.relationtoHH ??
        m.relationToHH ??
        "",
    ).toUpperCase();

    const headFlag = String(
      m.heaD_HOUSEHOLD ?? m.headHousehold ?? "",
    ).toUpperCase();

    return relation === "HHH" || headFlag === "Y";
  });

  if (!head) return "";

  return normalizeRemoteName(
    head.membeR_NAME ??
      head.memberName ??
      head.fname ??
      head.fName ??
      head.firstName ??
      "",
  );
}

// --------------------
// Implementation
// --------------------

export class HouseholdApiServiceImpl implements HouseholdApiService {
  private client = BaseApiClient.getInstance();

  async getHouseholdVisitListing({
    day,
    chwUsername,
  }: HouseholdVisitListParams): Promise<Household[]> {
    if (!Number.isInteger(day) || day < 1 || day > 32) {
      throw new Error("Choose a day from 1 to 32.");
    }
    const username = chwUsername.trim();
    if (!username) {
      throw new Error("Your login username is missing. Please sign in again.");
    }

    const response = await this.client.get<unknown>("/GetHHVisitDataList", {
      params: { HH_date: String(day), CHW_Id: username },
    });
    const data = parseHouseholdVisitListResponse(response.data);
    return data.properties.map(mapListingDtoToHousehold);
  }

  // -----------------------------
  // INSERT
  // -----------------------------
  async insertHousehold(
    payload: InsertHouseholdPayload,
  ): Promise<InsertHouseholdResponse> {
    const response = await this.client.post(HOUSEHOLD_ENTRY_ENDPOINT, payload);

    const data = response.data;

    if (__DEV__) {
      console.log(" INSERT RAW RESPONSE:", JSON.stringify(data, null, 2));
    }

    // Log backend failures properly
    if (data?.response_code !== "SUCCESS") {
      await AppLogger.log("ERROR", "HOUSEHOLD_INSERT_API_FAILED", {
        payload,
        response: data,
        responseCode: data?.response_code,
        responseMessage: data?.response_message,
      });

      throw new Error(data?.response_message || "Household insert failed");
    }

    const serverId = data?.household_id;

    if (!serverId) {
      await AppLogger.log("ERROR", "HOUSEHOLD_INSERT_ID_MISSING", {
        payload,
        response: data,
      });

      throw new Error("Household insert succeeded but household_id missing");
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
      console.log("Household UPDATE RESPONSE:", JSON.stringify(data));
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

      // const response = await this.client.get<GetHHDataListResponse>(
      //   `/GetHHDataList/${chwId}`,
      // );
      const response = await this.client.get<GetHHDataListResponse>(
        `/GetHHDataList/${encodeURIComponent(chwId)}`,
        {
          timeout: 180000, // 3 minutes for this unusually large response
        },
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
        code: error?.code,
        message: error?.message,
        status: error?.response?.status,
        response: error?.response?.data,
      });

      throw error;
    }
  }

  // -----------------------------
  // GET HOUSEHOLD HEAD NAME
  // -----------------------------
  async getHouseholdHeadName(householdId: string): Promise<string> {
    try {
      const response = await this.client.get(`/GetHHMemberList/${householdId}`);

      const data = response.data;

      if (data?.response_code && data.response_code !== "0") {
        await AppLogger.log("WARN", "Household member listing API error", {
          householdId,
          code: data.response_code,
          message: data.response_message,
        });

        return "";
      }

      const members = Array.isArray(data?.properties) ? data.properties : [];

      return getHouseholdHeadNameFromRemoteMembers(members);
    } catch (error: any) {
      await AppLogger.log("WARN", "Failed to fetch household head name", {
        householdId,
        message: error?.message,
      });

      return "";
    }
  }
}
