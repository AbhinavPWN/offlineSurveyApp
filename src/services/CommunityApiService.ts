import { CommunityMember } from "@/src/features/community/models/CommunityMember";
import { BaseApiClient } from "@/src/services/api/BaseApiClient";
import {
  CommunityAttendanceEntryPayload,
  CommunityAttendanceEntryResponse,
  CommunityMemberListParams,
  CommunityMemberListResponse,
  CommunityVisitEntryPayload,
  CommunityVisitEntryResponse,
} from "@/src/services/api/dto/CommunityDTO";
import { mapCommunityMemberDto } from "@/src/services/api/mappers/communityMemberMapper";
import { AppLogger } from "@/src/utils/AppLogger";

const COMMUNITY_MEMBER_LIST_ENDPOINT = "/Get_Community_Member_List";
const COMMUNITY_VISIT_ENTRY_ENDPOINT = "/Community_Visit_Entry";
const COMMUNITY_ATTENDANCE_ENTRY_ENDPOINT = "/Community_Visit_Attendance_Entry";

export type CommunityPostErrorKind =
  | "INVALID_PAYLOAD"
  | "AUTH_REQUIRED"
  | "API_REJECTED"
  | "UNKNOWN_OUTCOME";

/**
 * UNKNOWN_OUTCOME must not trigger a blind INSERT retry: the server may have
 * saved the record. API_REJECTED reports the response, not a retry guarantee.
 */
export class CommunityPostError extends Error {
  constructor(
    message: string,
    public readonly kind: CommunityPostErrorKind,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = "CommunityPostError";
  }
}

function validatePostFields(
  body: Record<string, unknown>,
  requiredFields: string[],
): void {
  for (const [field, value] of Object.entries(body)) {
    if (typeof value !== "string") {
      throw new CommunityPostError(
        `${field} must be a string.`,
        "INVALID_PAYLOAD",
      );
    }
  }
  for (const field of requiredFields) {
    if (!(body[field] as string)?.trim()) {
      throw new CommunityPostError(`${field} is required.`, "INVALID_PAYLOAD");
    }
  }
  if (body.insertUpdate !== "I") {
    throw new CommunityPostError(
      "Community submissions currently support INSERT only.",
      "INVALID_PAYLOAD",
    );
  }
}

function readServerVisitId(value: unknown): string | null {
  if (typeof value === "string") {
    const id = value.trim();
    // IDs are stored as text. Reject empty/zero IDs without inventing padding.
    return id && !/^0+$/.test(id) ? id : null;
  }
  // Accommodate JSON numeric IDs only when conversion cannot lose precision.
  if (typeof value === "number" && Number.isSafeInteger(value) && value > 0) {
    return String(value);
  }
  return null;
}

function readHttpStatus(error: unknown): number | null {
  if (!error || typeof error !== "object" || !("response" in error)) {
    return null;
  }
  const response = (error as { response?: unknown }).response;
  if (!response || typeof response !== "object" || !("status" in response)) {
    return null;
  }
  const status = (response as { status?: unknown }).status;
  return typeof status === "number" ? status : null;
}

export interface CommunityApiService {
  getCommunityMembers(
    params: CommunityMemberListParams,
  ): Promise<CommunityMember[]>;

  /** Caller supplies confirmed identities and an already formatted API date. */
  createCommunityVisit(
    payload: CommunityVisitEntryPayload,
  ): Promise<CommunityVisitEntryResponse>;

  /** Call only after the parent ID has been persisted locally. No automatic retry. */
  createCommunityAttendance(
    payload: CommunityAttendanceEntryPayload,
  ): Promise<CommunityAttendanceEntryResponse>;
}

export class CommunityApiServiceImpl implements CommunityApiService {
  private client = BaseApiClient.getInstance();

  async createCommunityVisit(
    payload: CommunityVisitEntryPayload,
  ): Promise<CommunityVisitEntryResponse> {
    // Explicit fields prevent local sync metadata from leaking into the request.
    const body: CommunityVisitEntryPayload = {
      visitDate: payload.visitDate,
      supervisorId: payload.supervisorId,
      communityName: payload.communityName,
      address: payload.address,
      communityCategory: payload.communityCategory,
      noOfPresent: payload.noOfPresent,
      noOfFemales: payload.noOfFemales,
      noOfMales: payload.noOfMales,
      noOfPwd: payload.noOfPwd,
      sessionTopicNut: payload.sessionTopicNut,
      sessionTopicHealthly: payload.sessionTopicHealthly,
      sessionTopicDrug: payload.sessionTopicDrug,
      sessionTopicChild: payload.sessionTopicChild,
      sessionTopicHeat: payload.sessionTopicHeat,
      sessionTopicMalaria: payload.sessionTopicMalaria,
      sessionTopicDiarrhoea: payload.sessionTopicDiarrhoea,
      sessionTopicGbv: payload.sessionTopicGbv,
      userId: payload.userId,
      insertUpdate: payload.insertUpdate,
    };
    validatePostFields({ ...body }, [
      "visitDate",
      "supervisorId",
      "communityName",
      "address",
      "communityCategory",
      "userId",
    ]);
    for (const count of [
      body.noOfPresent,
      body.noOfFemales,
      body.noOfMales,
      body.noOfPwd,
    ]) {
      if (!/^\d+$/.test(count) || !Number.isSafeInteger(Number(count))) {
        throw new CommunityPostError(
          "Attendance counts must be nonnegative whole-number strings.",
          "INVALID_PAYLOAD",
        );
      }
    }
    for (const topic of [
      body.sessionTopicNut,
      body.sessionTopicHealthly,
      body.sessionTopicDrug,
      body.sessionTopicChild,
      body.sessionTopicHeat,
      body.sessionTopicMalaria,
      body.sessionTopicDiarrhoea,
      body.sessionTopicGbv,
    ]) {
      if (topic !== "Y" && topic !== "N") {
        throw new CommunityPostError(
          "Session topics must be Y or N.",
          "INVALID_PAYLOAD",
        );
      }
    }
    return this.postCommunityEntry(COMMUNITY_VISIT_ENTRY_ENDPOINT, body);
  }

  async createCommunityAttendance(
    payload: CommunityAttendanceEntryPayload,
  ): Promise<CommunityAttendanceEntryResponse> {
    const body: CommunityAttendanceEntryPayload = {
      communityVisitId: payload.communityVisitId,
      clientNo: payload.clientNo,
      visitorName: payload.visitorName,
      districtId: payload.districtId,
      vdcnpCode: payload.vdcnpCode,
      wardNo: payload.wardNo,
      address: payload.address,
      createdBy: payload.createdBy,
      createdOn: payload.createdOn,
      insertUpdate: payload.insertUpdate,
    };
    validatePostFields({ ...body }, [
      "communityVisitId",
      "clientNo",
      "visitorName",
      "createdBy",
    ]);
    if (readServerVisitId(body.communityVisitId) !== body.communityVisitId) {
      throw new CommunityPostError(
        "A valid saved parent visit ID is required.",
        "INVALID_PAYLOAD",
      );
    }
    return this.postCommunityEntry(
      COMMUNITY_ATTENDANCE_ENTRY_ENDPOINT,
      body,
      body.communityVisitId,
    );
  }

  private async postCommunityEntry(
    endpoint: string,
    body: CommunityVisitEntryPayload | CommunityAttendanceEntryPayload,
    expectedParentId?: string,
  ): Promise<CommunityVisitEntryResponse> {
    let data: unknown;
    try {
      const response = await this.client.post<unknown>(endpoint, body, {
        timeout: 60000,
      });
      data = response.data;
    } catch (error: unknown) {
      // A 401 is a definitive rejection: the API did not authorize the INSERT.
      // It is safe to offer retry after the user signs in again.
      if (readHttpStatus(error) === 401) {
        throw new CommunityPostError(
          "Your login session expired. Sign in again, then retry.",
          "AUTH_REQUIRED",
          error,
        );
      }

      // Transport failures and other HTTP outcomes do not prove the INSERT rolled back.
      throw new CommunityPostError(
        "The Community submission outcome is unknown. Verify whether it was saved before retrying.",
        "UNKNOWN_OUTCOME",
        error,
      );
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new CommunityPostError(
        "The server returned an invalid Community response; saving could not be confirmed.",
        "UNKNOWN_OUTCOME",
      );
    }
    const result = data as Record<string, unknown>;
    const code =
      typeof result.response_code === "string"
        ? result.response_code.trim()
        : "";
    const message =
      typeof result.response_message === "string"
        ? result.response_message
        : "";
    if (!code) {
      throw new CommunityPostError(
        "The Community response is missing its result code; saving could not be confirmed.",
        "UNKNOWN_OUTCOME",
      );
    }
    if (code !== "SUCCESS") {
      throw new CommunityPostError(
        message.trim() || "The server did not accept the Community submission.",
        "API_REJECTED",
      );
    }
    const serverId = readServerVisitId(result.community_visit_id);
    if (!serverId) {
      throw new CommunityPostError(
        "The server reported success without a valid Community visit ID. Do not resubmit automatically.",
        "UNKNOWN_OUTCOME",
      );
    }
    if (expectedParentId !== undefined && serverId !== expectedParentId) {
      throw new CommunityPostError(
        "The attendance response refers to a different Community visit. Verify the saved attendance before retrying.",
        "UNKNOWN_OUTCOME",
      );
    }
    return {
      community_visit_id: serverId,
      response_code: code,
      response_message: message,
    };
  }

  async getCommunityMembers(
    params: CommunityMemberListParams,
  ): Promise<CommunityMember[]> {
    try {
      await AppLogger.log("INFO", "COMMUNITY_MEMBER_DOWNLOAD_STARTED", {
        empId: params.EmpId,
        categoryNo: params.CategoryNo,
        memCategory: params.MemCategory,
      });

      const response = await this.client.get<CommunityMemberListResponse>(
        COMMUNITY_MEMBER_LIST_ENDPOINT,
        {
          params,
          timeout: 60000,
        },
      );

      const data = response.data;
      const responseCode = String(data?.response_code ?? "");

      if (responseCode !== "0") {
        await AppLogger.log("ERROR", "COMMUNITY_MEMBER_DOWNLOAD_API_FAILED", {
          empId: params.EmpId,
          categoryNo: params.CategoryNo,
          memCategory: params.MemCategory,
          responseCode,
          responseMessage: data?.response_message,
        });

        throw new Error(
          data?.response_message || "Unable to download community members.",
        );
      }

      if (!Array.isArray(data?.properties)) {
        await AppLogger.log(
          "ERROR",
          "COMMUNITY_MEMBER_DOWNLOAD_INVALID_RESPONSE",
          {
            empId: params.EmpId,
            categoryNo: params.CategoryNo,
            memCategory: params.MemCategory,
          },
        );

        throw new Error(
          "Community member response does not contain a valid member list.",
        );
      }

      const members = data.properties.map(mapCommunityMemberDto);

      await AppLogger.log("INFO", "COMMUNITY_MEMBER_DOWNLOAD_COMPLETED", {
        empId: params.EmpId,
        categoryNo: params.CategoryNo,
        memCategory: params.MemCategory,
        memberCount: members.length,
      });

      return members;
    } catch (error: any) {
      await AppLogger.log("ERROR", "COMMUNITY_MEMBER_DOWNLOAD_FAILED", {
        empId: params.EmpId,
        categoryNo: params.CategoryNo,
        memCategory: params.MemCategory,
        status: error?.response?.status,
        code: error?.code,
        message: error?.message,
        backendMessage:
          error?.response?.data?.response_message ??
          error?.response?.data?.message ??
          null,
      });

      throw error;
    }
  }
}
