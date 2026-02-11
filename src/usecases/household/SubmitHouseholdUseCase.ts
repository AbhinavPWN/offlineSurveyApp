// Purpose: Validate household before submission,Decide INSERT vs UPDATE,Mark record as PENDING,Does NOT talk to API

import { HouseholdLocalRepository } from "@/src/repositories/HouseholdLocalRepository";
import { HouseholdInfoRepository } from "@/src/repositories/HouseholdInfoRepository";

interface SubmitHouseholdParams {
  localId: string;
}

export class SubmitHouseholdUseCase {
  constructor(
    private householdRepo: HouseholdLocalRepository,
    private householdInfoRepo: HouseholdInfoRepository,
  ) {}

  async execute(params: SubmitHouseholdParams): Promise<void> {
    const household = await this.householdRepo.getByLocalId(params.localId);

    const info = await this.householdInfoRepo.getByHouseholdId(params.localId);

    if (!info) {
      throw new Error("Household info not found");
    }

    const validation = this.householdInfoRepo.validateForSubmit(info);

    if (!validation.valid) {
      throw new Error("Household data is not valid for submission");
    }

    const action = household?.householdId ? "UPDATE" : "INSERT";

    await this.householdRepo.markPending(params.localId, action);
  }
}
