// import { SQLiteHouseholdRepository } from "./SQLiteHouseholdRepository";
import { SQLiteHouseholdInfoRepository } from "./SQLiteHouseholdInfoRepository";
import { SQLiteHouseholdLocalRepository } from "./SQLiteHouseholdLocalRepository";

// export const householdRepository = new SQLiteHouseholdRepository();

export const householdLocalRepository = new SQLiteHouseholdLocalRepository();

export const householdInfoRepository = new SQLiteHouseholdInfoRepository();
