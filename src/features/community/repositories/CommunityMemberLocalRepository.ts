import {
  CommunityCategoryNo,
  CommunityMemberCategory,
} from "../../../services/api/dto/CommunityDTO";
import { CommunityMember } from "../models/CommunityMember";

export interface CommunityMemberFilter {
  empId: string;
  categoryNo: CommunityCategoryNo;
  memberCategory: CommunityMemberCategory;
}

export interface SaveCommunityMembersInput extends CommunityMemberFilter {
  members: CommunityMember[];
}

export interface SaveCommunityMembersSummary {
  received: number;
  stored: number;
  skipped: number;
  downloadedAt: number;
}

export interface CommunityMemberLocalRepository {
  /**
   * Replaces the downloaded-member selection for one exact combination of:
   * employee + category number + member category.
   *
   * Downloads for other filter combinations must remain untouched.
   */
  replaceDownloadedMembers(
    input: SaveCommunityMembersInput,
  ): Promise<SaveCommunityMembersSummary>;

  listByFilter(filter: CommunityMemberFilter): Promise<CommunityMember[]>;

  getLastDownloadedAt(filter: CommunityMemberFilter): Promise<number | null>;
}
