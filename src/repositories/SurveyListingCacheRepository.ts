import { db } from "@/src/db";
import type { Household } from "@/src/domain/models/Household";

export interface CachedSurveyListing {
  households: Household[];
  updatedAt: string;
}

export class SurveyListingCacheRepository {
  async save(
    username: string,
    day: number,
    households: Household[],
  ): Promise<void> {
    await db.runAsync(
      `INSERT INTO survey_listing_cache(username, day, households, updated_at)
       VALUES (?, ?, ?, ?) ON CONFLICT(username, day) DO UPDATE SET
       households=excluded.households, updated_at=excluded.updated_at`,
      [username, day, JSON.stringify(households), new Date().toISOString()],
    );
  }

  async get(
    username: string,
    day: number,
  ): Promise<CachedSurveyListing | null> {
    const row = await db.getFirstAsync<{
      households: string;
      updated_at: string;
    }>(
      "SELECT households, updated_at FROM survey_listing_cache WHERE username=? AND day=?",
      [username, day],
    );
    if (!row) return null;

    let households: unknown;
    try {
      households = JSON.parse(row.households);
    } catch {
      throw new Error(
        "This saved list could not be read. Connect to the internet and load it again.",
      );
    }
    if (
      !Array.isArray(households) ||
      !households.every((item) => item && typeof item.householdId === "string")
    ) {
      throw new Error(
        "This saved list could not be read. Connect to the internet and load it again.",
      );
    }
    return { households, updatedAt: row.updated_at };
  }
}
