import { SQLiteHouseholdRepository } from "./SQLiteHouseholdRepository";
import { SQLiteHouseholdInfoRepository } from "./SQLiteHouseholdInfoRepository";

export const householdRepository = new SQLiteHouseholdRepository();

export const householdInfoRepository = new SQLiteHouseholdInfoRepository();
