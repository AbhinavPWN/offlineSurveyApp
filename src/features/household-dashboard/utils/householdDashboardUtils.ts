import type { AggregateSyncStatus } from "../../../models/AggregateSyncStatus";
import type { HouseholdLocal } from "../../../models/household.model";
import type { SurveyMemberDisplayStatus } from "../../../utils/getSurveyStatusForMember";

export type SurveyStatusCounts = {
  notStarted: number;
  inProgress: number;
  readyToSync: number;
  synced: number;
};

export type HouseholdWithAggregate = {
  household: HouseholdLocal;
  aggregateStatus: AggregateSyncStatus;

  totalMembers: number;
  syncedMembers: number;
  pendingMembers: number;
  failedMembers: number;
  draftMembers: number;

  surveyCounts: SurveyStatusCounts;

  headName?: string;
  headMobile?: string;
  memberSearchNames: string[];
  pregnantWomenCount: number;
};

export function formatServerModifiedDate(value?: string | null): string {
  if (!value?.trim()) return "";

  // Backend already returns a BS date in YYYY-MM-DD format.
  // Do not parse it as a JavaScript/Gregorian date.
  return value.trim().split("T")[0].split(" ")[0];
}

export function normalizeSearchValue(value: unknown): string {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function matchesSearchTerms(
  value: unknown,
  normalizedQuery: string,
): boolean {
  const normalizedValue = normalizeSearchValue(value);
  const queryTerms = normalizedQuery.split(" ").filter(Boolean);

  return queryTerms.every((term) => normalizedValue.includes(term));
}

export function isPregnantMember(value: unknown): boolean {
  return (
    String(value ?? "")
      .trim()
      .toUpperCase() === "Y"
  );
}

export function sortHouseholds(data: HouseholdLocal[]) {
  const priorityMap: Record<string, number> = {
    FAILED: 1,
    DRAFT: 2,
    PENDING: 3,
    SYNCED: 4,
  };

  return [...data].sort((a, b) => {
    const p1 = priorityMap[a.syncStatus] ?? 5;
    const p2 = priorityMap[b.syncStatus] ?? 5;

    if (p1 !== p2) return p1 - p2;

    const timeA = Number(a.lastModifiedAt) || 0;
    const timeB = Number(b.lastModifiedAt) || 0;

    return timeB - timeA;
  });
}

export function getAggregateMainMessage(status: AggregateSyncStatus) {
  switch (status) {
    case "FULLY_SYNCED":
      return {
        text: "All data is synced",
        className: "text-green-700 bg-green-100",
      };

    case "PENDING":
      return {
        text: "Household ready to sync",
        className: "text-yellow-700 bg-yellow-100",
      };

    case "PARTIAL_PENDING":
      return {
        text: "Some data needs sync",
        className: "text-yellow-700 bg-yellow-100",
      };

    case "FAILED":
      return {
        text: "Household needs attention",
        className: "text-red-700 bg-red-100",
      };

    case "PARTIAL_FAILED":
      return {
        text: "Some records need attention",
        className: "text-red-700 bg-red-100",
      };

    case "DRAFT":
      return {
        text: "Household not completed",
        className: "text-orange-700 bg-orange-100",
      };

    default:
      return {
        text: "Status unknown",
        className: "text-gray-700 bg-gray-100",
      };
  }
}

export function getHouseholdDetailStatus(
  syncStatus: HouseholdLocal["syncStatus"],
) {
  switch (syncStatus) {
    case "SYNCED":
      return {
        label: "✓ Synced",
        className: "text-green-700",
      };

    case "PENDING":
      return {
        label: "↻ Ready to sync",
        className: "text-yellow-700",
      };

    case "FAILED":
      return {
        label: "⚠ Needs attention",
        className: "text-red-700",
      };

    case "DRAFT":
      return {
        label: "Not completed",
        className: "text-orange-700",
      };

    default:
      return {
        label: "Unknown",
        className: "text-gray-600",
      };
  }
}

export function getMemberDetailStatus(params: {
  totalMembers: number;
  syncedMembers: number;
  pendingMembers: number;
  failedMembers: number;
  draftMembers: number;
}) {
  const {
    totalMembers,
    syncedMembers,
    pendingMembers,
    failedMembers,
    draftMembers,
  } = params;

  if (totalMembers === 0) {
    return {
      label: "No members added",
      className: "text-gray-500",
    };
  }

  if (failedMembers > 0) {
    return {
      label: `⚠ ${failedMembers} need attention`,
      className: "text-red-700",
    };
  }

  if (pendingMembers > 0) {
    return {
      label: `↻ ${pendingMembers} ready to sync`,
      className: "text-yellow-700",
    };
  }

  if (draftMembers > 0) {
    return {
      label: `${draftMembers} not completed`,
      className: "text-orange-700",
    };
  }

  if (syncedMembers === totalMembers) {
    return {
      label: `✓ ${syncedMembers}/${totalMembers} synced`,
      className: "text-green-700",
    };
  }

  return {
    label: `${syncedMembers}/${totalMembers} synced`,
    className: "text-yellow-700",
  };
}

export function getSurveyDetailStatus(
  counts: SurveyStatusCounts,
  totalMembers: number,
) {
  if (totalMembers === 0) {
    return {
      label: "Add members first",
      className: "text-gray-500",
    };
  }

  if (counts.readyToSync > 0) {
    return {
      label: `↻ ${counts.readyToSync} ready to sync`,
      className: "text-yellow-700",
    };
  }

  if (counts.inProgress > 0) {
    return {
      label: `${counts.inProgress} in progress`,
      className: "text-orange-700",
    };
  }

  if (counts.synced > 0) {
    return {
      label: `✓ ${counts.synced} synced`,
      className: "text-green-700",
    };
  }

  return {
    label: "Not started",
    className: "text-gray-500",
  };
}

export function countSurveyStatuses(
  statuses: SurveyMemberDisplayStatus[],
): SurveyStatusCounts {
  return statuses.reduce<SurveyStatusCounts>(
    (acc, status) => {
      if (status === "NOT_STARTED") acc.notStarted += 1;
      if (status === "IN_PROGRESS") acc.inProgress += 1;
      if (status === "READY_TO_SYNC") acc.readyToSync += 1;
      if (status === "SYNCED") acc.synced += 1;

      return acc;
    },
    {
      notStarted: 0,
      inProgress: 0,
      readyToSync: 0,
      synced: 0,
    },
  );
}
