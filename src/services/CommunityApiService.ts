import { CommunityMember } from "@/src/features/community/models/CommunityMember";
import { BaseApiClient } from "@/src/services/api/BaseApiClient";
import {
  CommunityMemberListParams,
  CommunityMemberListResponse,
} from "@/src/services/api/dto/CommunityDTO";
import { mapCommunityMemberDto } from "@/src/services/api/mappers/communityMemberMapper";
import { AppLogger } from "@/src/utils/AppLogger";

const COMMUNITY_MEMBER_LIST_ENDPOINT = "/Get_Community_Member_List";

export interface CommunityApiService {
  getCommunityMembers(
    params: CommunityMemberListParams,
  ): Promise<CommunityMember[]>;
}

export class CommunityApiServiceImpl implements CommunityApiService {
  private client = BaseApiClient.getInstance();

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
