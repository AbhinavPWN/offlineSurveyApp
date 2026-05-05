// src\usecases\members\SyncMemberUseCase.ts

import { HouseholdMemberLocalRepository } from "@/src/repositories/HouseholdMemberLocalRepository";
import { HouseholdLocalRepository } from "@/src/repositories/HouseholdLocalRepository";
import { MemberApiService } from "@/src/services/MemberApiService";
import { SyncContextGuard } from "../sync/SyncContextGuard";
import { AppLogger } from "@/src/utils/AppLogger";
import { loadAuthSession } from "@/src/auth/storage/authStorage";
import {
  mapMemberToInsertPayload,
  mapMemberToUpdatePayload,
  MemberLocal,
} from "@/src/services/api/mappers/MemberMapper";
import { mapDbToDomainMember } from "@/src/services/api/mappers/MemberDomainMapper";
import { HouseholdMemberLocal } from "@/src/models/householdMember.model";

export class SyncMembersUseCase {
  constructor(
    private readonly memberRepo: HouseholdMemberLocalRepository,
    private readonly householdRepo: HouseholdLocalRepository,
    private readonly memberApi: MemberApiService,
    private readonly syncGuard: SyncContextGuard,
  ) {}

  private enrichMemberWithHousehold(
    member: MemberLocal,
    household: any,
  ): MemberLocal {
    return {
      ...member,
      address: household.address ?? "",
      address1Line2: household.vdcnpCode ?? "",
      address1Line3: household.wardNo ?? "",
      address1DistrictCode: household.districtCode ?? "",
      address1Province: household.provinceCode ?? "",
      address1Type: member.address1Type || "P",
    };
  }

  private normalizeServerDob(serverDob: string): string {
    if (!serverDob) return "";

    const [day, mon, year] = serverDob.split("-");

    const monthMap: Record<string, string> = {
      JAN: "01",
      FEB: "02",
      MAR: "03",
      APR: "04",
      MAY: "05",
      JUN: "06",
      JUL: "07",
      AUG: "08",
      SEP: "09",
      OCT: "10",
      NOV: "11",
      DEC: "12",
    };

    const month = monthMap[mon.toUpperCase()] ?? "01";

    return `${year}-${month}-${day}`;
  }

  async execute(chwUsername: string): Promise<void> {
    try {
      await this.syncGuard.ensureValidContext(chwUsername);
    } catch (error: any) {
      if (error?.message === "OFFLINE") return;
      throw error;
    }

    await AppLogger.log("SYNC", "[MEMBER][START]", { chwUsername });

    const pendingMembers = [
      ...(await this.memberRepo.listBySyncStatus("PENDING")),
      ...(await this.memberRepo.listBySyncStatus("FAILED")),
    ];

    await AppLogger.log("SYNC", "[MEMBER][PENDING_COUNT]", {
      count: pendingMembers.length,
    });

    if (__DEV__) {
      console.log("[MEMBER][START]", {
        pendingCount: pendingMembers.length,
      });
      console.log("[MEMBER][DATA]", pendingMembers);
    }

    for (const dbMember of pendingMembers ?? []) {
      const member = mapDbToDomainMember(dbMember);

      try {
        await AppLogger.log("SYNC", "[MEMBER][PROCESSING]", {
          localId: dbMember.localId,
          syncAction: dbMember.syncAction,
        });

        if (__DEV__) {
          console.log("[MEMBER][PROCESSING]", {
            localId: dbMember.localId,
            action: dbMember.syncAction,
          });
        }

        const parent = await this.householdRepo.getByLocalId(
          dbMember.householdLocalId,
        );

        if (!parent) {
          if (__DEV__) {
            console.log("[MEMBER][SKIP][NO_PARENT]", dbMember.localId);
          }

          await AppLogger.log("SYNC_DEBUG", "[MEMBER][SKIPPED_NO_PARENT]", {
            localId: dbMember.localId,
          });

          continue;
        }

        if (parent.syncStatus !== "SYNCED") {
          if (__DEV__) {
            console.log("[MEMBER][SKIP][PARENT_NOT_SYNCED]", dbMember.localId);
          }

          await AppLogger.log(
            "SYNC_DEBUG",
            "[MEMBER][SKIPPED_PARENT_NOT_SYNCED]",
            {
              localId: dbMember.localId,
            },
          );

          continue;
        }

        // Safety: infer syncAction if missing
        if (!dbMember.syncAction) {
          const inferredAction = dbMember.clientNo ? "UPDATE" : "INSERT";
          await this.memberRepo.markPending(dbMember.localId, inferredAction);
          dbMember.syncAction = inferredAction;
        }

        if (__DEV__) {
          console.log("[MEMBER][ACTION]", {
            localId: dbMember.localId,
            action: dbMember.syncAction,
          });
        }

        if (dbMember.syncAction === "INSERT") {
          if (__DEV__) console.log("[MEMBER][INSERT][START]", dbMember.localId);

          await this.syncInsert(dbMember, member, parent.householdId!);
        } else if (dbMember.syncAction === "UPDATE") {
          if (__DEV__) console.log("[MEMBER][UPDATE][START]", dbMember.localId);

          await this.syncUpdate(dbMember, member, parent.householdId!);
        }
      } catch (error: any) {
        if (__DEV__) {
          console.log("[MEMBER][ERROR]", {
            localId: member.localId,
            message: error?.message,
            response: error?.response?.data,
          });
        }

        await AppLogger.log("ERROR", "[MEMBER][FAIL]", {
          localId: member.localId,
          syncAction: dbMember.syncAction,
          message: error?.message,
          response: error?.response?.data,
        });

        await this.memberRepo.markFailed(member.localId);
      }
    }

    await AppLogger.log("SYNC", "[MEMBER][END]");
  }

  // ---------------- INSERT FLOW ----------------
  private async syncInsert(
    dbMember: HouseholdMemberLocal,
    member: MemberLocal,
    serverHouseholdId: string,
  ): Promise<void> {
    const session = await loadAuthSession();
    const sessionEmployeeId = session?.employeeId ?? "";

    const household = await this.householdRepo.getByLocalId(
      dbMember.householdLocalId,
    );

    if (!household) {
      throw new Error(`Household not found for member ${member.localId}`);
    }

    const enrichedMember = this.enrichMemberWithHousehold(member, household);

    if (!enrichedMember.address || enrichedMember.address.trim() === "") {
      throw new Error("Address still empty after enrichment");
    }

    const payload = mapMemberToInsertPayload(
      enrichedMember,
      serverHouseholdId,
      session?.userName ?? "",
      sessionEmployeeId,
    );

    if (__DEV__) {
      console.log("[MEMBER][INSERT][PAYLOAD]", payload);
    }

    const result = await this.memberApi.insertMember(payload);

    if (__DEV__) {
      console.log("[MEMBER][INSERT][RESPONSE]", result);
    }

    if (
      !result ||
      (result.response_code !== "0" && result.response_code !== "SUCCESS")
    ) {
      throw new Error(result?.response_message || "Insert failed");
    }

    if (!result.client_id) {
      throw new Error("Server did not return client_id after insert");
    }

    await this.memberRepo.markSynced(dbMember.localId, result.client_id);
    await this.memberRepo.recalculateMemberCount(dbMember.householdLocalId);

    await AppLogger.log("SYNC", "[MEMBER][INSERT][SUCCESS]", {
      localId: member.localId,
      clientNo: result.client_id,
    });
  }

  // ---------------- UPDATE FLOW ----------------
  private async syncUpdate(
    dbMember: HouseholdMemberLocal,
    member: MemberLocal,
    serverHouseholdId: string,
  ): Promise<void> {
    if (!member.clientNo) {
      throw new Error("Cannot update member without clientNo");
    }

    const session = await loadAuthSession();
    const sessionEmployeeId = session?.employeeId ?? "";

    const household = await this.householdRepo.getByLocalId(
      dbMember.householdLocalId,
    );

    if (!household) {
      throw new Error(`Household not found for member ${member.localId}`);
    }

    const enrichedMember = this.enrichMemberWithHousehold(member, household);

    const payload = mapMemberToUpdatePayload(
      enrichedMember,
      serverHouseholdId,
      session?.userName ?? "",
      sessionEmployeeId,
    );

    if (__DEV__) {
      console.log("[MEMBER][UPDATE][PAYLOAD]", payload);
    }

    const result = await this.memberApi.updateMember(payload);

    if (__DEV__) {
      console.log("[MEMBER][UPDATE][RESPONSE]", result);
    }

    if (!result || result.response_code !== "SUCCESS") {
      throw new Error(result?.response_message || "Update failed");
    }

    await this.memberRepo.markSynced(member.localId, member.clientNo);
    await this.memberRepo.recalculateMemberCount(dbMember.householdLocalId);

    await AppLogger.log("SYNC", "[MEMBER][UPDATE][SUCCESS]", {
      localId: member.localId,
      clientNo: member.clientNo,
    });
  }
}
