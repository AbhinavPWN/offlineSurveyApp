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
  const responseData = error?.response?.data;

  const rawValue =
    responseData?.message ||
    responseData?.response_message ||
    responseData?.error ||
    (typeof responseData === "string" ? responseData : "") ||
    error?.message ||
    "";

  const raw = String(rawValue).trim();

  if (!raw) {
    return "Could not sync. Please review and try again.";
  }

  const normalized = raw.toLowerCase();

  if (normalized === "offline") {
    return "No internet connection.";
  }

  if (normalized.includes("network")) {
    return "Network problem. Please try again.";
  }

  if (normalized.includes("timeout")) {
    return "Connection timed out. Please try again.";
  }

  if (normalized.includes("session_expired")) {
    return "Session expired. Please login again.";
  }

  return raw;
}
