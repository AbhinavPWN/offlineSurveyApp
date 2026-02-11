import { HouseholdLocalRepositoryImpl } from "../repositories/impl/HouseholdLocalRepositoryImpl";
import { HouseholdApiServiceImpl } from "../services/HouseholdApiService";
import { NetworkServiceImpl } from "../utils/NetworkService";
import { SyncHouseholdUseCase } from "../usecases/household/SyncHouseholdUseCase";

// Singleton instances - Created once for the entire APP.

// Repositories
const householdLocalRepository = new HouseholdLocalRepositoryImpl();

// Services
const householdApiService = new HouseholdApiServiceImpl();

const networkService = new NetworkServiceImpl();

// use cases
export const syncHouseholdUseCase = new SyncHouseholdUseCase(
  householdLocalRepository,
  householdApiService,
  networkService,
);
