// Creating a  simple bridge function to get the member for a survey, this is to avoid circular dependencies between the survey and member services

import { householdMemberLocalRepository } from "@/src/di/container";
import { HouseholdMemberLocal } from "@/src/models/householdMember.model";

export async function getMemberForSurvey(
  memberId: string,
): Promise<HouseholdMemberLocal> {
  const member = await householdMemberLocalRepository.getByLocalId(memberId);

  if (!member) {
    throw new Error(`Member not found: ${memberId}`);
  }

  return member;
}
