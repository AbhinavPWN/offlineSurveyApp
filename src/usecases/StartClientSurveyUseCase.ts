import { householdRepository } from "../repositories";

export class StartClientSurveyUseCase {
  async execute(params: {
    clientCode: string;
    createdByUserId: string;
    chwId?: string;
  }): Promise<{ householdId: string }> {
    // Check for existing draft
    const existing = await householdRepository.getHouseholdByCode(
      params.clientCode,
    );

    if (existing) {
      if (existing.status === "DRAFT") {
        return { householdId: existing.id };
      }

      throw new Error("Survey already submitted for this client");
    }

    // Create new draft
    const id = await householdRepository.startHousehold({
      householdCode: params.clientCode,
      createdByUserId: params.createdByUserId,
      chwId: params.chwId,
    });

    return { householdId: id };
  }
}
