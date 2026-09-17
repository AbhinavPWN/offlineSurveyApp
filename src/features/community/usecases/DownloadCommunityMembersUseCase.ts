// UI selection → GET API → mapped members → SQLite transaction → summary
import { CommunityApiService } from "../../../services/CommunityApiService";
import {
  CommunityMemberFilter,
  CommunityMemberLocalRepository,
  SaveCommunityMembersSummary,
} from "../repositories/CommunityMemberLocalRepository";

export class DownloadCommunityMembersUseCase {
  constructor(
    private readonly communityApiService: CommunityApiService,
    private readonly communityMemberRepository: CommunityMemberLocalRepository,
  ) {}

  async execute(
    filter: CommunityMemberFilter,
  ): Promise<SaveCommunityMembersSummary> {
    const empId = filter.empId.trim();

    if (!empId) {
      throw new Error("Employee ID is required");
    }

    const members = await this.communityApiService.getCommunityMembers({
      EmpId: empId,
      CategoryNo: filter.categoryNo,
      MemCategory: filter.memberCategory,
    });

    return this.communityMemberRepository.replaceDownloadedMembers({
      empId,
      categoryNo: filter.categoryNo,
      memberCategory: filter.memberCategory,
      members,
    });
  }
}
