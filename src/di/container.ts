import { SQLiteHouseholdLocalRepository } from "../repositories/SQLiteHouseholdLocalRepository";
import { HouseholdApiServiceImpl } from "../services/HouseholdApiService";
import { NetworkServiceImpl } from "../utils/NetworkService";
import { SyncHouseholdUseCase } from "../usecases/household/SyncHouseholdUseCase";

// ------------------------
// Singletons (App Lifetime)
// ------------------------

export const householdLocalRepository = new SQLiteHouseholdLocalRepository();

export const householdApiService = new HouseholdApiServiceImpl();

export const networkService = new NetworkServiceImpl();

// ------------------------
// Use Cases
// ------------------------

export const syncHouseholdUseCase = new SyncHouseholdUseCase(
  householdLocalRepository,
  householdApiService,
  networkService,
);
