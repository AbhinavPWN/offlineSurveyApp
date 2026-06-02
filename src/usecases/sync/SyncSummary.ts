export type SyncStep = "HOUSEHOLD" | "MEMBER" | "SURVEY";

export type SyncStepStatus = "SUCCESS" | "PARTIAL" | "FAILED" | "SKIPPED";

export type SyncItemResult = {
  id: string;
  label?: string;
  status: "SUCCESS" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type SyncEntitySummary = {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  items: SyncItemResult[];
};

export function createEmptySyncSummary(): SyncEntitySummary {
  return {
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    items: [],
  };
}

export function getStepStatus(summary: SyncEntitySummary): SyncStepStatus {
  if (summary.total === 0) return "SKIPPED";

  if (summary.failed > 0 && summary.success > 0) {
    return "PARTIAL";
  }

  if (summary.failed > 0 && summary.success === 0) {
    return "FAILED";
  }

  if (summary.success > 0 && summary.failed === 0) {
    return "SUCCESS";
  }

  return "SKIPPED";
}

export function getSafeSyncReason(error: any): string {
  const raw =
    error?.response?.data?.message ||
    error?.response?.data?.response_message ||
    error?.message ||
    "";

  if (!raw) {
    return "Could not sync. Please review and try again.";
  }

  if (raw === "Offline" || raw === "OFFLINE") {
    return "No internet connection.";
  }

  if (raw.includes("Network")) {
    return "Network problem. Please try again.";
  }

  if (raw.includes("timeout")) {
    return "Connection timed out. Please try again.";
  }

  if (raw.includes("400")) {
    return "Some information may be incomplete or invalid.";
  }

  if (raw.includes("500")) {
    return "Server problem. Please try again later.";
  }

  if (raw.includes("SESSION_EXPIRED")) {
    return "Session expired. Please login again.";
  }

  return raw;
}
