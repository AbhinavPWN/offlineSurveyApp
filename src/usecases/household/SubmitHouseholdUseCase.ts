// Purpose: Validate household before submission,Decide INSERT vs UPDATE,Mark record as PENDING,Does NOT talk to API

// Purpose:
// - Validate household before submission
// - Decide INSERT vs UPDATE
// - Mark record as PENDING
// - Does NOT talk to API

import { HouseholdLocalRepository } from "@/src/repositories/HouseholdLocalRepository";
import { HouseholdMemberLocalRepository } from "@/src/repositories/HouseholdMemberLocalRepository";

interface SubmitHouseholdParams {
  localId: string;
}

export class SubmitHouseholdUseCase {
  constructor(
    private householdRepo: HouseholdLocalRepository,
    private memberRepo: HouseholdMemberLocalRepository,
  ) {}

  async execute(params: SubmitHouseholdParams): Promise<void> {
    const household = await this.householdRepo.getByLocalId(params.localId);

    if (!household) {
      throw new Error("Household not found");
    }

    // Skip if already synced and no local changes
    if (household.syncStatus === "SYNCED" && household.syncAction === null) {
      return;
    }

    // ---------------- VALIDATION ----------------
    const missing: string[] = [];

    if (!household.provinceCode) missing.push("Province");
    if (!household.districtCode) missing.push("District");
    if (!household.wardNo) missing.push("Ward");

    if (
      typeof household.noofHHMembers !== "number" ||
      household.noofHHMembers <= 0
    ) {
      missing.push("No. of household members");
    }

    if (!household.typeofHousing) missing.push("Type of housing");

    if (!household.accesstoCleanWater) missing.push("Access to clean water");

    if (!household.accesstoSanitation) missing.push("Access to sanitation");

    if (!household.gpsCoordinates) missing.push("GPS location");

    if (!household.dateoflistingAD) missing.push("Date of listing");

    if (missing.length > 0) {
      console.log("VALIDATION FAILED. Missing:", missing);
      throw new Error(
        "Household data is not valid for submission: " + missing.join(", "),
      );
    }

    // ---------------- DETERMINE ACTION ----------------
    const action = household.householdId ? "UPDATE" : "INSERT";

    // ---------------- MARK PENDING ----------------
    await this.householdRepo.markPending(params.localId, action);

    // ---------------- PROPAGATE TO MEMBERS ----------------
    await this.memberRepo.markAllDraftMembersPending(params.localId);

    console.log("HOUSEHOLD MARKED PENDING:", {
      localId: params.localId,
      action,
    });
  }
}
