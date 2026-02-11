import { HouseholdApiService } from "@/src/services/HouseholdApiService";
import { HouseholdLocalRepository } from "@/src/repositories/HouseholdLocalRepository";
import { AppLogger } from "@/src/utils/AppLogger";

export interface DownloadSummary {
  inserted: number;
  updated: number;
}

export class DownloadHouseholdsUseCase {
  constructor(
    private apiService: HouseholdApiService,
    private localRepo: HouseholdLocalRepository,
    private getCurrentChwUsername: () => Promise<string>,
  ) {}

  async execute(): Promise<DownloadSummary> {
    let inserted = 0;
    let updated = 0;

    try {
      const chwUsername = await this.getCurrentChwUsername();

      await AppLogger.log("INFO", "Download Households started", {
        chwUsername,
      });

      const remoteHouseholds =
        await this.apiService.getHouseholdListing(chwUsername);

      for (const remote of remoteHouseholds) {
        const existing = await this.localRepo.getByHouseholdId(
          remote.householdId,
        );

        if (!existing) {
          await this.localRepo.insertFromListing(remote);
          inserted++;
        } else {
          await this.localRepo.updateFromListing(remote);
          updated++;
        }
      }

      await AppLogger.log("INFO", "DownloadHouseholds completed", {
        inserted,
        updated,
      });

      return { inserted, updated };
    } catch (error: any) {
      await AppLogger.log("ERROR", "DownloadHouseholds failed", {
        message: error?.message,
      });
      throw error;
    }
  }
}
