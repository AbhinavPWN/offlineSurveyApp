import { BaseApiClient } from "./api/BaseApiClient";
import { AppLogger } from "../utils/AppLogger";

/* ============================
   API RESPONSE TYPE
============================ */

export interface MemberApiResponse {
  response_code: string;
  response_message: string;
  client_id?: string;
}

/* ============================
   INSERT PAYLOAD
============================ */

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
  clientAge: string;
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
  motherofChild: string;
  childDob: string;
  vaccinationStatus: string;
  healthInsCoverage: string;
  healthConditionsDia: string;
  healthConditionsHyp: string;
  healthConditionsCar: string;
  healthConditionsChr: string;
  healthConditionsOth: string;
  healthConditionsOthers: string;
  user: string;
  insertUpdate: "I";
}

/* ============================
   UPDATE PAYLOAD
============================ */

export interface UpdateMemberPayload extends Omit<
  InsertMemberPayload,
  "insertUpdate"
> {
  clientNo: string;
  insertUpdate: "U";
}

/* ============================
   LISTING RESPONSE
============================ */

export interface GetHHMemberListResponse {
  response_code: string;
  response_message: string;
  properties: any[];
}

/* ============================
   SERVICE INTERFACE
============================ */

export interface MemberApiService {
  insertMember(payload: InsertMemberPayload): Promise<MemberApiResponse>;
  updateMember(payload: UpdateMemberPayload): Promise<MemberApiResponse>;
  getMemberListing(householdId: string): Promise<any[]>;
}

/* ============================
   IMPLEMENTATION
============================ */

export class MemberApiServiceImpl implements MemberApiService {
  private client = BaseApiClient.getInstance();

  private readonly INSERT_ENDPOINT = "/Household_Member_Entry";
  private readonly UPDATE_ENDPOINT = "/Household_Member_Update";

  async insertMember(payload: InsertMemberPayload): Promise<MemberApiResponse> {
    const response = await this.client.post<MemberApiResponse>(
      this.INSERT_ENDPOINT,
      payload,
    );

    await AppLogger.log("SYNC", "Member Insert API response", {
      householdId: payload.householdId,
      name: payload.fName,
      response: response.data,
    });

    return response.data;
  }

  async updateMember(payload: UpdateMemberPayload): Promise<MemberApiResponse> {
    const response = await this.client.post<MemberApiResponse>(
      this.UPDATE_ENDPOINT,
      payload,
    );

    await AppLogger.log("SYNC", "Member Update API response", {
      clientNo: payload.clientNo,
      response: response.data,
    });
    if (__DEV__) {
      console.log("🔵 MEMBER UPDATE RESPONSE:", JSON.stringify(response.data));
    }
    return response.data;
  }

  async getMemberListing(householdId: string): Promise<any[]> {
    const response = await this.client.get<GetHHMemberListResponse>(
      `/GetHHMemberList/${householdId}`,
    );

    const data = response.data;

    if (data.response_code !== "0") {
      throw new Error(data.response_message);
    }

    return data.properties ?? [];
  }
}
