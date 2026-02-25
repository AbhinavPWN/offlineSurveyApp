// Purpose: Validate household before submission,Decide INSERT vs UPDATE,Mark record as PENDING,Does NOT talk to API

import { HouseholdLocalRepository } from "@/src/repositories/HouseholdLocalRepository";
import { HouseholdInfoRepository } from "@/src/repositories/HouseholdInfoRepository";
import { HouseholdMemberLocalRepository } from "@/src/repositories/HouseholdMemberLocalRepository";

interface SubmitHouseholdParams {
  localId: string;
}

export class SubmitHouseholdUseCase {
  constructor(
    private householdRepo: HouseholdLocalRepository,
    private householdInfoRepo: HouseholdInfoRepository,
    private memberRepo: HouseholdMemberLocalRepository,
  ) {}

  async execute(params: SubmitHouseholdParams): Promise<void> {
    const household = await this.householdRepo.getByLocalId(params.localId);

    const info = await this.householdInfoRepo.getByHouseholdId(params.localId);

    if (!info) {
      throw new Error("Household info not found");
    }
    if (household?.syncStatus === "SYNCED") {
      // If household is already synced and not edited,
      // do NOT re-validate.
      return;
    }

    const validation = this.householdInfoRepo.validateForSubmit(info);

    if (!validation.valid) {
      console.log("VALIDATION FAILED. Missing:", validation.missingFields);
      throw new Error(
        "Household data is not valid for submission: " +
          validation.missingFields.join(", "),
      );
    }

    const action = household?.householdId ? "UPDATE" : "INSERT";

    // Mark household pending
    await this.householdRepo.markPending(params.localId, action);

    // Propagate to members
    await this.memberRepo.markAllDraftMembersPending(params.localId);
  }
}
