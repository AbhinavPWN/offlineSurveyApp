import { HouseholdApiService } from "@/src/services/HouseholdApiService";
import { HouseholdLocalRepository } from "@/src/repositories/HouseholdLocalRepository";
import { AppLogger } from "@/src/utils/AppLogger";
import { NetworkServiceImpl } from "@/src/utils/NetworkService";
import {
  loadAuthSession,
  saveAuthSession,
} from "@/src/auth/storage/authStorage";

export interface DownloadSummary {
  inserted: number;
  updated: number;
  skipped: number;
}

const networkService = new NetworkServiceImpl();

export class DownloadHouseholdsUseCase {
  constructor(
    private apiService: HouseholdApiService,
    private localRepo: HouseholdLocalRepository,
    private getCurrentChwUsername: () => Promise<string>,
    private getCurrentIdOfChw: () => Promise<string>,
  ) {}

  async execute(): Promise<DownloadSummary> {
    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    try {
      const isOnline = await networkService.isOnline();

      if (!isOnline) {
        await AppLogger.log("INFO", "Download skipped - offline");
        return { inserted: 0, updated: 0, skipped: 0 };
      }

      const chwUsername = await this.getCurrentChwUsername();
      const idofCHW = await this.getCurrentIdOfChw();

      await AppLogger.log("INFO", "Download Households started", {
        chwUsername,
      });

      const remoteHouseholds =
        await this.apiService.getHouseholdListing(chwUsername);

      if (__DEV__) {
        console.log("REMOTE HOUSEHOLDS SAMPLE:", remoteHouseholds[0]);
        console.log("SERVER CHW ID:", remoteHouseholds[0]?.employeeId);
      }

      console.log("Remote households count:", remoteHouseholds.length);

      // Load session once
      const session = await loadAuthSession();

      // Discover employeeId from first household
      if (
        session &&
        !session.employeeId &&
        remoteHouseholds.length > 0 &&
        remoteHouseholds[0].employeeId
      ) {
        session.employeeId = remoteHouseholds[0].employeeId;

        await saveAuthSession(session);

        await AppLogger.log("SYNC", "EmployeeId discovered from server", {
          employeeId: session.employeeId,
        });
      }

      for (const remote of remoteHouseholds) {
        const existing = await this.localRepo.getByHouseholdId(
          remote.householdId,
        );

        if (!existing) {
          await this.localRepo.insertFromListing(remote, chwUsername, idofCHW);
          inserted++;
          continue;
        }

        if (existing.syncStatus === "SYNCED") {
          await this.localRepo.updateFromListing(remote);
          updated++;
        } else {
          skipped++;
          await AppLogger.log("WARN", "Skipped listing overwrite", {
            serverId: remote.householdId,
            localStatus: existing.syncStatus,
          });
        }
      }

      await AppLogger.log("INFO", "DownloadHouseholds completed", {
        inserted,
        updated,
        skipped,
      });

      console.log("Download summary:", { inserted, updated, skipped });

      return { inserted, updated, skipped };
    } catch (error: any) {
      await AppLogger.log("ERROR", "DownloadHouseholds failed", {
        message: error?.message,
      });
      throw error;
    }
  }
}
