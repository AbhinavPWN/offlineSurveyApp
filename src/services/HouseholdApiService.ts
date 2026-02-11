import axios, { AxiosInstance } from "axios";
import { Household } from "../domain/models/Household";
import { mapListingDtoToHousehold } from "./api/mappers/householdListingMapper";
import { GetHHDataListResponse } from "./api/dto/GetHHDataListResponse";
import { AppLogger } from "../utils/AppLogger";
// API Base config
const BASE_URL = "https://wecareapi.nirdhan.com.np:8085/api/SavingDeposit";
const HOUSEHOLD_ENTRY_ENDPOINT = "/Household_Entry";
// Payload types - matching backend exactly

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

// Update payload (insertUpdate= "U")
export interface UpdateHouseholdPayload {
  readonly householdId: string;
  readonly dateofListingAD: string;
  readonly idofCHW: string;
  readonly provinceCode: string;
  readonly districtCode: string;
  readonly vdcnpCode: string;
  readonly wardNo: string;
  readonly address: string;
  readonly gpsCoordinates: string;
  readonly noofHHMembers: string;
  readonly typeofHousing: string;
  readonly accesstoCleanWater: string;
  readonly accesstoSanitation: string;
  readonly activeFlag: string;
  readonly hhClosedDateAD: string;
  readonly userId: string;
  readonly insertUpdate: "U";
}

// Response from insert
export interface InsertHouseholdResponse {
  outHouseholdId: string;
}

// Service interface
export interface HouseholdApiService {
  insertHousehold(
    payload: InsertHouseholdPayload,
  ): Promise<InsertHouseholdResponse>;

  updateHousehold(payload: UpdateHouseholdPayload): Promise<void>;

  // Listing households for CHW
  getHouseholdListing(chwId: string): Promise<Household[]>;
}

// Service implementation

export class HouseholdApiServiceImpl implements HouseholdApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * INSERT new household
   * Server generates householdId (outHouseholdId)
   */
  async insertHousehold(
    payload: InsertHouseholdPayload,
  ): Promise<InsertHouseholdResponse> {
    const response = await this.client.post(HOUSEHOLD_ENTRY_ENDPOINT, payload);
    // Backend return outHouseholdId
    if (!response.data?.outHouseholdId) {
      throw new Error("Invalid insert response:outHouseholdId missing ");
    }

    return {
      outHouseholdId: response.data.outHouseholdId,
    };
  }

  //   Update existing Household
  async updateHousehold(payload: UpdateHouseholdPayload): Promise<void> {
    if (!payload.householdId) {
      throw new Error("Update failed: householdId is required");
    }

    await this.client.post(HOUSEHOLD_ENTRY_ENDPOINT, payload);
  }

  // GET household listing for CHW
  async getHouseholdListing(chwId: string) {
    try {
      await AppLogger.log("INFO", "Fetching household listing", { chwId });

      const response = await this.client.get<GetHHDataListResponse>(
        `/GetHHDataList/${chwId}`,
      );
      const data = response.data;

      if (data.response_code !== "0") {
        await AppLogger.log("ERROR", "Household listing API returned error", {
          code: data.response_code,
          message: data.response_message,
        });
        throw new Error(data.response_message);
      }

      if (!Array.isArray(data.properties)) {
        await AppLogger.log(
          "ERROR",
          "Household listing properties is not array",
          { data },
        );
        return [];
      }

      const households = data.properties.map(mapListingDtoToHousehold);

      await AppLogger.log("INFO", "Household listing fetched", {
        count: households.length,
      });

      return households;
    } catch (error: any) {
      await AppLogger.log(
        "ERROR",
        "Failed to fetch household listing - {Dashboard}",
        { message: error?.message },
      );
      throw error;
    }
  }
}
