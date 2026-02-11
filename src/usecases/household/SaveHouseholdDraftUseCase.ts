// Used when user is filling form -save progress safely.
// used on every form change,on blur,on screen exit.

import { HouseholdLocalRepository } from "@/src/repositories/HouseholdLocalRepository";
import { HouseholdLocal } from "@/src/models/household.model";

interface SaveHouseholdDraftParams {
  localId: string;
  patch: Partial<HouseholdLocal>;
}

export class SaveHouseholdDraftUseCase {
  constructor(private householdRepo: HouseholdLocalRepository) {}

  async execute(params: SaveHouseholdDraftParams): Promise<void> {
    await this.householdRepo.updateDraft(params.localId, {
      ...params.patch,
      lastModifiedAt: Date.now(),
    });
  }
}
