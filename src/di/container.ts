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
