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
      address1Line2: household.vdcnpCode ?? "", // municipality
      address1Line3: household.wardNo ?? "", // ward

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

    // memberToSync
    const pendingMembers = [
      ...(await this.memberRepo.listBySyncStatus("PENDING")),
      ...(await this.memberRepo.listBySyncStatus("FAILED")),
    ];
    await AppLogger.log("SYNC", "Pending members found", {
      count: pendingMembers.length,
    });
    if (__DEV__) {
      console.log("🟡 MEMBER SYNC START");
      console.log("🟡 Pending Members Count:", pendingMembers.length);
      console.log("🟡 Pending Members Data:", pendingMembers);
    }
    console.log("Pending members:", pendingMembers);
    for (const dbMember of pendingMembers ?? []) {
      const member = mapDbToDomainMember(dbMember);
      try {
        const parent = await this.householdRepo.getByLocalId(
          dbMember.householdLocalId,
        );

        if (__DEV__) {
          console.log("🔍 Checking parent for member:", member.localId);
          console.log("   Parent:", parent);
        }

        if (!parent) {
          if (__DEV__) console.log("❌ No parent found — skipping");
          continue;
        }

        if (parent.syncStatus !== "SYNCED") {
          // Parent not ready, skip
          if (__DEV__) console.log("⏳ Parent not SYNCED — skipping member");
          continue;
        }

        // Safety: infer syncAction if missing
        if (!dbMember.syncAction) {
          const inferredAction = dbMember.clientNo ? "UPDATE" : "INSERT";
          await this.memberRepo.markPending(dbMember.localId, inferredAction);
          dbMember.syncAction = inferredAction;
        }

        if (__DEV__) console.log("➡️ Member syncAction:", dbMember.syncAction);
        if (dbMember.syncAction === "INSERT") {
          if (__DEV__) console.log("🚀 Calling syncInsert");
          await this.syncInsert(dbMember, member, parent.householdId!);
        } else if (dbMember.syncAction === "UPDATE") {
          if (__DEV__) console.log("🔄 Calling syncUpdate");
          await this.syncUpdate(dbMember, member, parent.householdId!);
        }
      } catch (error: any) {
        console.log("❌ MEMBER UPDATE ERROR:", error);
        console.log("❌ SERVER RESPONSE:", error?.response?.data);

        await AppLogger.log("ERROR", "Member sync failed", {
          localId: member.localId,
          message: error?.message,
          response: error?.response?.data,
        });

        await this.memberRepo.markFailed(member.localId);
      }
    }
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

    //  Safety check
    if (!enrichedMember.address || enrichedMember.address.trim() === "") {
      throw new Error("❌ Address still empty after enrichment");
    }

    const payload = mapMemberToInsertPayload(
      enrichedMember,
      serverHouseholdId,
      session?.userName ?? "",
      sessionEmployeeId,
    );

    if (__DEV__) {
      console.log("🟢 INSERT MEMBER LOCAL OBJECT:", member);
      console.log("📦 INSERT PAYLOAD SENT TO SERVER:", payload);
    }

    const result = await this.memberApi.insertMember(payload);
    if (__DEV__) {
      console.log("📩 INSERT RAW SERVER RESPONSE:", result);
    }
    if (
      !result ||
      (result.response_code !== "0" && result.response_code !== "SUCCESS")
    ) {
      // console.log(" MEMBER INSERT RAW RESPONSE:", result);
      throw new Error(result?.response_message || "Insert failed");
    }

    if (!result.client_id) {
      throw new Error("Server did not return client_id after insert");
    }

    await this.memberRepo.markSynced(dbMember.localId, result.client_id);

    await this.memberRepo.recalculateMemberCount(dbMember.householdLocalId);

    await AppLogger.log("SYNC", "Member synced (INSERT)", {
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

    // let employeeId = session?.employeeId;

    // if (!employeeId && dbMember.employeeId) {
    //   employeeId = dbMember.employeeId;
    // }

    // if (!employeeId) {
    //   throw new Error("EMPLOYEE_ID_NOT_AVAILABLE");
    // }

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
      console.log("📦 MEMBER UPDATE PAYLOAD:", payload);
      console.log("📦 UPDATE PAYLOAD SENT TO SERVER:", payload);
    }

    const result = await this.memberApi.updateMember(payload);

    if (__DEV__) console.log("📩 MEMBER UPDATE RAW RESPONSE:", result);

    if (!result || result.response_code !== "SUCCESS") {
      throw new Error(result?.response_message || "Update failed");
    }

    if (__DEV__) console.log("✅ MEMBER UPDATE SUCCESS — marking synced");
    await this.memberRepo.markSynced(member.localId, member.clientNo);

    await this.memberRepo.recalculateMemberCount(dbMember.householdLocalId);

    await AppLogger.log("SYNC", "Member synced (UPDATE)", {
      localId: member.localId,
      clientNo: member.clientNo,
    });
  }
}
