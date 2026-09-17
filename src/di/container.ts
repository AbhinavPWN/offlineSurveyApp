import { QueueCommunityVisitUseCase } from "@/src/features/community/usecases/QueueCommunityVisitUseCase";
import { SyncCommunityVisitUseCase } from "@/src/features/community/usecases/SyncCommunityVisitUseCase";
import { SQLiteHouseholdLocalRepository } from "../repositories/SQLiteHouseholdLocalRepository";
import { HouseholdApiServiceImpl } from "../services/HouseholdApiService";
import { NetworkServiceImpl } from "../utils/NetworkService";
import { SyncHouseholdUseCase } from "../usecases/household/SyncHouseholdUseCase";
import { SyncMembersUseCase } from "../usecases/members/SyncMemberUseCase";
import { GlobalSyncUseCase } from "@/src/usecases/sync/GlobalSyncUseCase";
import { SyncContextGuard } from "@/src/usecases/sync/SyncContextGuard";
import { SQLiteHouseholdMemberLocalRepository } from "@/src/repositories/SQLiteHouseholdMemberLocalRepository";
import { MemberApiServiceImpl } from "@/src/services/MemberApiService";
import { SQLiteHouseholdInfoRepository } from "../repositories/SQLiteHouseholdInfoRepository";
import { DownloadHouseholdWithMembersUseCase } from "../usecases/household/DownloadHouseholdWithMembersUseCase";
import { CommunityApiServiceImpl } from "@/src/services/CommunityApiService";
import { SQLiteCommunityMemberLocalRepository } from "@/src/repositories/SQLiteCommunityMemberLocalRepository";
import { DownloadCommunityMembersUseCase } from "@/src/features/community/usecases/DownloadCommunityMembersUseCase";
import { SQLiteCommunityVisitLocalRepository } from "@/src/features/community/repositories/SQLiteCommunityVisitLocalRepository";
import { SaveCommunityVisitDraftUseCase } from "@/src/features/community/usecases/SaveCommunityVisitDraftUseCase";

// ------------------------
// Singletons
// ------------------------

// Repositories
export const householdLocalRepository = new SQLiteHouseholdLocalRepository();
export const householdMemberLocalRepository =
  new SQLiteHouseholdMemberLocalRepository();
export const householdInfoRepository = new SQLiteHouseholdInfoRepository();

// Services
export const householdApiService = new HouseholdApiServiceImpl();
export const memberApi = new MemberApiServiceImpl();
export const networkService = new NetworkServiceImpl();
export const communityApiService = new CommunityApiServiceImpl();

const syncGuard = new SyncContextGuard(networkService);

// export const memberRepo = new SQLiteHouseholdMemberLocalRepository();

// ------------------------
// Use Cases
// ------------------------

export const syncHouseholdUseCase = new SyncHouseholdUseCase(
  householdLocalRepository,
  householdApiService,
);

export const syncMembersUseCase = new SyncMembersUseCase(
  householdMemberLocalRepository,
  householdLocalRepository,
  memberApi,
  syncGuard,
);

export const globalSyncUseCase = new GlobalSyncUseCase(
  syncGuard,
  syncHouseholdUseCase,
  syncMembersUseCase,
);

export const downloadHouseholdWithMembersUseCase =
  new DownloadHouseholdWithMembersUseCase(
    householdLocalRepository,
    householdMemberLocalRepository,
    memberApi,
  );

export const communityMemberLocalRepository =
  new SQLiteCommunityMemberLocalRepository();

export const downloadCommunityMembersUseCase =
  new DownloadCommunityMembersUseCase(
    communityApiService,
    communityMemberLocalRepository,
  );

// Community visit drafts (local storage only).
export const communityVisitLocalRepository =
  new SQLiteCommunityVisitLocalRepository();

export const saveCommunityVisitDraftUseCase =
  new SaveCommunityVisitDraftUseCase(communityVisitLocalRepository);

export const queueCommunityVisitUseCase =
  new QueueCommunityVisitUseCase(communityVisitLocalRepository);

export const syncCommunityVisitUseCase = new SyncCommunityVisitUseCase(
  communityVisitLocalRepository,
  communityApiService,
  networkService,
);
