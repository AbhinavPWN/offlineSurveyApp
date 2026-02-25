import { HouseholdMemberLocalRepository } from "@/src/repositories/HouseholdMemberLocalRepository";

export interface HouseholdMemberValidationResult {
  valid: boolean;
  errors: {
    noMembers?: string;
    headMissing?: string;
    multipleHeads?: string;
    failedMembers?: string;
    draftMembers?: string;
  };
}

interface Params {
  householdLocalId: string;
}

export class ValidateHouseholdMembersForSubmitUseCase {
  constructor(private memberRepo: HouseholdMemberLocalRepository) {}

  async execute(params: Params): Promise<HouseholdMemberValidationResult> {
    const members = await this.memberRepo.listByHousehold(
      params.householdLocalId,
    );

    const errors: HouseholdMemberValidationResult["errors"] = {};

    // Rule 1: At least one member
    if (members.length === 0) {
      errors.noMembers = "At least one household member is required.";
    }

    // Rule 2: Exactly one head
    const heads = members.filter((m) => m.headHousehold === "Y");

    if (heads.length === 0) {
      errors.headMissing = "One household member must be marked as head.";
    }

    if (heads.length > 1) {
      errors.multipleHeads = "Only one household member can be marked as head.";
    }

    // Rule 3: No FAILED members
    const failedMembers = members.filter((m) => m.syncStatus === "FAILED");

    if (failedMembers.length > 0) {
      errors.failedMembers =
        "Some members failed to sync. Please review and fix them before submission.";
    }

    // Rule 4: No remaining DRAFT members
    const draftMembers = members.filter((m) => m.syncStatus === "DRAFT");

    if (draftMembers.length > 0) {
      errors.draftMembers =
        "Some members are not saved properly. Please review all members.";
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
