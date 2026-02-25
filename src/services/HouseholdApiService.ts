// import axios, { AxiosInstance } from "axios";
import { Household } from "../domain/models/Household";
import { mapListingDtoToHousehold } from "./api/mappers/householdListingMapper";
import { GetHHDataListResponse } from "./api/dto/GetHHDataListResponse";
import { AppLogger } from "../utils/AppLogger";

// import { loadAuthSession } from "@/src/auth/storage/authStorage";
// import { isTokenValid } from "@/src/auth/service/token";
import { BaseApiClient } from "./api/BaseApiClient";

// --------------------
// API Base
// --------------------

// const BASE_URL = "https://wecareapi.nirdhan.com.np:8085/api/SavingDeposit";

const HOUSEHOLD_ENTRY_ENDPOINT = "/Household_Entry";

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
  // private client: AxiosInstance;

  // constructor() {
  //   this.client = axios.create({
  //     baseURL: BASE_URL,
  //     timeout: 15000,
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });

  //   // -----------------------------
  //   // REQUEST INTERCEPTOR
  //   // -----------------------------
  //   this.client.interceptors.request.use(async (config) => {
  //     config.metadata = { startTime: new Date().getTime() };

  //     await AppLogger.log("INFO", "API_REQUEST", {
  //       method: config.method?.toUpperCase(),
  //       url: `${config.baseURL ?? ""}${config.url ?? ""}`,
  //       body: config.data ?? null,
  //     });

  //     try {
  //       const session = await loadAuthSession();

  //       if (session && session.accessToken && isTokenValid(session)) {
  //         config.headers.Authorization = `Bearer ${session.accessToken}`;
  //       } else {
  //         await AppLogger.log("WARN", "API_REQUEST_NO_VALID_TOKEN", {
  //           url: config.url,
  //         });
  //       }
  //     } catch (error: any) {
  //       await AppLogger.log("ERROR", "API_TOKEN_ATTACH_FAILED", {
  //         message: error?.message,
  //       });
  //     }

  //     return config;
  //   });

  //   // -----------------------------
  //   // RESPONSE INTERCEPTOR
  //   // -----------------------------
  //   this.client.interceptors.response.use(
  //     async (response) => {
  //       const duration =
  //         new Date().getTime() - (response.config.metadata?.startTime ?? 0);

  //       await AppLogger.log("INFO", "API_RESPONSE", {
  //         method: response.config.method?.toUpperCase(),
  //         url: `${response.config.baseURL ?? ""}${response.config.url ?? ""}`,

  //         status: response.status,
  //         durationMs: duration,
  //       });

  //       return response;
  //     },
  //     async (error) => {
  //       const config = error.config || {};
  //       const duration =
  //         new Date().getTime() - (config.metadata?.startTime ?? 0);

  //       await AppLogger.log("ERROR", "API_ERROR", {
  //         method: config.method?.toUpperCase(),
  //         url: config.baseURL + config.url,
  //         status: error.response?.status ?? "NO_RESPONSE",
  //         message: error.message,
  //         durationMs: duration,
  //       });

  //       if (error.response?.status === 401) {
  //         await AppLogger.log("AUTH", "API_401_UNAUTHORIZED", {
  //           url: config.url,
  //         });
  //       }

  //       return Promise.reject(error);
  //     },
  //   );
  // }

  // -----------------------------
  // INSERT
  // -----------------------------
  async insertHousehold(
    payload: InsertHouseholdPayload,
  ): Promise<InsertHouseholdResponse> {
    // await AppLogger.log("INFO", "API - Insert household request", {
    //   payload,
    // });
    const response = await this.client.post(HOUSEHOLD_ENTRY_ENDPOINT, payload);

    // console.log("INSERT RAW RESPONSE:", response.data);
    // await AppLogger.log("INFO", "Insert household response", {
    //   response: response.data,
    // });

    const serverId = response.data?.household_id;

    if (!serverId) {
      await AppLogger.log("ERROR", "Insert response invalid", {
        fullResponse: response.data,
      });

      throw new Error("Invalid insert response: household_id missing");
    }

    return {
      outHouseholdId: serverId,
    };
  }

  // -----------------------------
  // UPDATE
  // -----------------------------
  async updateHousehold(payload: UpdateHouseholdPayload): Promise<void> {
    if (!payload.householdId) {
      throw new Error("Update failed: householdId is required");
    }

    await this.client.post(HOUSEHOLD_ENTRY_ENDPOINT, payload);
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
