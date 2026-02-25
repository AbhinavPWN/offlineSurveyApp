import { BaseApiClient } from "./api/BaseApiClient";
import { AppLogger } from "../utils/AppLogger";

// Insert Payload

export interface InsertMemberPayload {
  enrollDate: string;
  maritalStatus: string;
  idDocumentType: string;
  idDocumentNo: string;
  idIssueDistrictCode: string;
  memIdIssueDate: string;
  employeeId: string;
  casteCode: string;
  fName: string;
  gender: string;
  occupationCode: string;
  educationCode: string;
  imagePath: string;
  tranOfficeCode: string;
  dob: string;
  mobileNo: string;
  minorYn: string;
  address1Type: string;
  address: string;
  address1Line2: string;
  address1Line3: string;
  address1DistrictCode: string;
  religionCode: string;
  address1Province: string;
  totalAsset: string;
  totalLiabilities: string;
  netWorth: string;
  soiSalary: string;
  soiBusIncome: string;
  soiReturnfrmInvest: string;
  soiInheritance: string;
  soiRemittance: string;
  soiOthers: string;
  soiAgriculture: string;
  clientBehaviour: string;
  householdId: string;
  headHousehold: string;
  relationtoHH: string;
  healthConditionsYn: string;
  healthConditions: string;
  disabilityIdentYn: string;
  disabilityIdent: string;
  seeing: string;
  hearing: string;
  walking: string;
  remembering: string;
  selfCare: string;
  communicating: string;
  disabilityStatus: string;
  pregnancyStatus: string;
  pregnancyDate: string;
  vaccinationStatus: string;
  healthInsCoverage: string;
  user: string;
  insertUpdate: "I";
}

// Update Payload

export interface UpdateMemberPayload extends Omit<
  InsertMemberPayload,
  "insertUpdate"
> {
  clientNo: string;
  insertUpdate: "U";
}

// defining DTO For listing
export interface GetHHMemberListResponse {
  response_code: string;
  response_message: string;
  properties: any[];
}

// Define Service Interface
export interface MemberApiService {
  insertMember(payload: InsertMemberPayload): Promise<void>;
  updateMember(payload: UpdateMemberPayload): Promise<void>;
  getMemberListing(householdId: string): Promise<any[]>;
}

// Implementation
export class MemberApiServiceImpl implements MemberApiService {
  private client = BaseApiClient.getInstance();

  private readonly INSERT_ENDPOINT = "/Household_Member_Entry";
  private readonly UPDATE_ENDPOINT = "/Household_Member_Update";

  async insertMember(payload: InsertMemberPayload): Promise<void> {
    const response = await this.client.post(this.INSERT_ENDPOINT, payload);

    console.log("===== INSERT MEMBER RESPONSE =====");
    console.log("STATUS:", response.status);
    console.log("DATA:", response.data);
    console.log("===================================");

    await AppLogger.log("SYNC", "Member Insert API success", {
      householdId: payload.householdId,
      name: payload.fName,
      response: response.data,
    });
  }

  async updateMember(payload: UpdateMemberPayload): Promise<void> {
    await this.client.post(this.UPDATE_ENDPOINT, payload);

    await AppLogger.log("SYNC", "Member update API success", {
      clientNo: payload.clientNo,
    });
  }

  async getMemberListing(householdId: string): Promise<any[]> {
    // console.log("📡 Calling GetHHMemberList for:", householdId);

    const response = await this.client.get<GetHHMemberListResponse>(
      `/GetHHMemberList/${householdId}`,
    );

    const data = response.data;

    // console.log("📡 Member API response:", data);

    if (data.response_code !== "0") {
      throw new Error(data.response_message);
    }

    // console.log("📡 Members received:", data.properties?.length);

    return data.properties ?? [];
  }
}
