import { HouseholdLocal } from "@/src/models/household.model";
import { HouseholdMemberLocal } from "@/src/models/householdMember.model";
import { AggregateSyncStatus } from "@/src/models/AggregateSyncStatus";

export function resolveHouseholdAggregateStatus(
  household: HouseholdLocal,
  members: HouseholdMemberLocal[],
): AggregateSyncStatus {
  // 1️⃣ If household itself not synced → priority
  if (household.syncStatus === "DRAFT") return "DRAFT";
  if (household.syncStatus === "FAILED") return "FAILED";
  if (household.syncStatus === "PENDING") return "PENDING";

  // 2️⃣ Household synced → check members
  if (members.length === 0) return "FULLY_SYNCED";

  const hasFailed = members.some((m) => m.syncStatus === "FAILED");
  const hasPending = members.some((m) => m.syncStatus === "PENDING");

  if (hasFailed) return "PARTIAL_FAILED";
  if (hasPending) return "PARTIAL_PENDING";

  return "FULLY_SYNCED";
}
