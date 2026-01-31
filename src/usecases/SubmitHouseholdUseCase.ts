// Make submission a Use-Case

import { householdInfoRepository, householdRepository } from "../repositories";

export class SubmitHouseholdUseCase {
  async execute(householdId: string) {
    const household = await householdRepository.getHouseholdById(householdId);

    if (!household) throw new Error("Household not found");
    if (household.status !== "DRAFT")
      throw new Error("Household already submitted");

    const info = await householdInfoRepository.getByHouseholdId(householdId);

    if (!info) throw new Error("Household info missing");

    const validation = householdInfoRepository.validateForSubmit(info);

    if (!validation.valid) {
      throw new Error("Missing: " + validation.missingFields.join(", "));
    }
    await householdRepository.submitHousehold(householdId);
  }
}
