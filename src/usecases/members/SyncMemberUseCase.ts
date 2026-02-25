import { HouseholdMemberLocalRepository } from "@/src/repositories/HouseholdMemberLocalRepository";
import { HouseholdLocalRepository } from "@/src/repositories/HouseholdLocalRepository";
import { MemberApiService } from "@/src/services/MemberApiService";
import { SyncContextGuard } from "../sync/SyncContextGuard";
import { AppLogger } from "@/src/utils/AppLogger";
import { loadAuthSession } from "@/src/auth/storage/authStorage";
import {
  mapMemberToInsertPayload,
  mapMemberToUpdatePayload,
} from "@/src/services/api/mappers/MemberMapper";

export class SyncMembersUseCase {
  constructor(
    private readonly memberRepo: HouseholdMemberLocalRepository,
    private readonly householdRepo: HouseholdLocalRepository,
    private readonly memberApi: MemberApiService,
    private readonly syncGuard: SyncContextGuard,
  ) {}

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

    const pendingMembers = await this.memberRepo.listBySyncStatus("PENDING");
    await AppLogger.log("SYNC", "Pending members found", {
      count: pendingMembers.length,
    });

    for (const member of pendingMembers) {
      try {
        const parent = await this.householdRepo.getByLocalId(
          member.householdLocalId,
        );

        if (!parent || parent.syncStatus !== "SYNCED") {
          // Parent not ready, skip
          continue;
        }

        if (member.syncAction === "INSERT") {
          await this.syncInsert(member, parent.householdId!);
        } else if (member.syncAction === "UPDATE") {
          await this.syncUpdate(member, parent.householdId!);
        }
      } catch (error: any) {
        await AppLogger.log("ERROR", "Member sync failed", {
          localId: member.localId,
          message: error?.message,
        });

        await this.memberRepo.markFailed(member.localId);
      }
    }
  }

  //   Insert Flow
  private async syncInsert(
    member: any,
    serverHouseholdId: string,
  ): Promise<void> {
    const session = await loadAuthSession();

    const payload = mapMemberToInsertPayload(
      member,
      serverHouseholdId,
      session?.userName ?? "",
    );

    await AppLogger.log("SYNC_DEBUG", "Insert payload", payload);

    await this.memberApi.insertMember(payload);

    await AppLogger.log("SYNC_DEBUG", "Insert API called successfully", {
      localId: member.localId,
    });

    const remoteMembers =
      await this.memberApi.getMemberListing(serverHouseholdId);

    await AppLogger.log("SYNC_DEBUG", "Remote members fetched", {
      count: remoteMembers.length,
    });

    await AppLogger.log("SYNC_DEBUG", "Local member comparison base", {
      idDocumentNo: member.idDocumentNo,
      firstName: member.firstName,
      dobAD: member.dobAD,
      mobileNo: member.mobileNo,
    });

    for (const rm of remoteMembers) {
      await AppLogger.log("SYNC_DEBUG", "Remote member candidate", {
        serverClientNo: rm.clienT_NO,
        idDocumentNo: rm.iD_DOCUMENT_NO,
        fname: rm.fname,
        dob: rm.dob,
        mobile: rm.mobilE_NO,
      });
    }
    console.log("LOCAL DOB:", member.dobAD);

    for (const rm of remoteMembers) {
      console.log("REMOTE DOB:", rm.dob);
    }
    const matched = remoteMembers.find((m: any) => {
      if (member.idDocumentNo && m.iD_DOCUMENT_NO === member.idDocumentNo) {
        return true;
      }

      const normalizedServerDob = this.normalizeServerDob(m.dob);

      return (
        m.fname?.trim().toLowerCase() ===
          member.firstName?.trim().toLowerCase() &&
        normalizedServerDob === member.dobAD &&
        m.mobilE_NO?.trim() === member.mobileNo?.trim()
      );
    });

    if (!matched?.clienT_NO) {
      await AppLogger.log("SYNC_DEBUG", "No match found in listing", {
        localId: member.localId,
      });

      throw new Error(
        `Inserted member not found in server listing | localId=${member.localId}`,
      );
    }

    await AppLogger.log("SYNC_DEBUG", "Match found", {
      clientNo: matched.clienT_NO,
    });

    await this.memberRepo.markSynced(member.localId, matched.clienT_NO);

    await this.memberRepo.recalculateMemberCount(member.householdLocalId);

    await AppLogger.log("SYNC", "Member synced (INSERT)", {
      localId: member.localId,
      clientNo: matched.clienT_NO,
    });
  }

  private async syncUpdate(
    member: any,
    serverHouseholdId: string,
  ): Promise<void> {
    if (!member.clientNo) {
      throw new Error("Cannot update member without clientNo");
    }

    const session = await loadAuthSession();

    const payload = mapMemberToUpdatePayload(
      member,
      serverHouseholdId,
      session?.userName ?? "",
    );

    await this.memberApi.updateMember(payload);

    await this.memberRepo.markSynced(member.localId, member.clientNo);
    await this.memberRepo.recalculateMemberCount(member.householdLocalId);

    await AppLogger.log("SYNC", "Member synced (UPDATE)", {
      localId: member.localId,
      clientNo: member.clientNo,
    });
  }
}
