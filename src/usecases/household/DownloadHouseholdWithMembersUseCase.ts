import { Household } from "@/src/domain/models/Household";
import { HouseholdLocalRepository } from "@/src/repositories/HouseholdLocalRepository";
import { HouseholdMemberLocalRepository } from "@/src/repositories/HouseholdMemberLocalRepository";
import { MemberApiService } from "@/src/services/MemberApiService";
import { db } from "@/src/db";
import { AppLogger } from "@/src/utils/AppLogger";

export class DownloadHouseholdWithMembersUseCase {
  constructor(
    private householdRepo: HouseholdLocalRepository,
    private memberRepo: HouseholdMemberLocalRepository,
    private memberApi: MemberApiService,
  ) {}

  async execute(
    household: Household,
    chwUsername: string,
    idofCHW: string,
  ): Promise<void> {
    // Block if already exists
    const existing = await this.householdRepo.getByHouseholdId(
      household.householdId,
    );

    if (existing) {
      throw new Error("ALREADY_DOWNLOADED");
    }

    // Fetch members first (fail test)
    const remoteMembers = await this.memberApi.getMemberListing(
      household.householdId,
    );

    await AppLogger.log("SYNC", "Downloading household snapshot", {
      serverId: household.householdId,
      memberCount: remoteMembers.length,
    });

    try {
      // Begin transaction
      await db.execAsync("BEGIN");

      // Insert household snapshot
      await this.householdRepo.insertFromListing(
        household,
        chwUsername,
        idofCHW,
      );

      // Get inserted localId
      const inserted = await this.householdRepo.getByHouseholdId(
        household.householdId,
      );

      if (!inserted) {
        throw new Error("HOUSEHOLD_INSERT_FAILED");
      }
      // Insert Members snapshot
      await this.memberRepo.insertManyFromListing(
        remoteMembers,
        inserted.localId,
      );

      // Commit
      await db.execAsync("COMMIT");
      await AppLogger.log("SYNC", "Household download completed", {
        serverId: household.householdId,
      });
    } catch (error) {
      //   console.log("❌ DOWNLOAD ERROR:", error);
      await db.execAsync("ROLLBACK");
      await AppLogger.log("ERROR", "Household download failed", {
        serverId: household.householdId,
      });

      throw error;
    }
  }
}
